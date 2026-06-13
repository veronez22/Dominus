import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CardItem from './components/CardItem'
import Carrinho from './components/Carrinho'
import ModalProduto from './components/ModalProduto'
import ModalImagem from './components/ModalImagem'
import PopupSugestao from './components/PopupSugestao'
import Destaques from './components/Destaques'
import MinhaConta from './components/MinhaConta'
import { useCardapio } from './lib/useCardapio'
import { supabase } from './lib/supabase'
import './App.css'

// Categorias que pertencem ao Cardápio (sub-aside)
const CATS_CARDAPIO = ['esfihas', 'esfihas-doces', 'fogazzas', 'kibes', 'cigarretes', 'coxinhas', 'bebidas', 'diversos']

function App() {
  const { produtos, categorias, loading } = useCardapio()

  const [carrinho, setCarrinho] = useState([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const [categoriaVisivel, setCategoriaVisivel] = useState('destaques')
  const [secaoAtiva, setSecaoAtiva] = useState('destaques') // 'destaques' | 'cardapio' | 'combos'
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [sugestaoEsfiha,     setSugestaoEsfiha]     = useState(null)  // cross-sell doce/salgada ao abrir o carrinho
  const [produtoImagem,     setProdutoImagem]     = useState(null)
  const [busca, setBusca] = useState('')
  const [historico, setHistorico] = useState([])
  const [mesa, setMesa] = useState('')
  const refs = useRef({})
  const jaSugeriuEsfiha = useRef(false) // garante a sugestão doce/salgada só 1x por visita

  // Filtra quais categorias renderizar no main baseado na seção ativa
  const categoriasVisiveis = categorias.filter(cat => {
    if (secaoAtiva === 'destaques') return cat.id === 'destaques'
    if (secaoAtiva === 'combos')    return cat.id === 'combos'
    if (secaoAtiva === 'cardapio')  return CATS_CARDAPIO.includes(cat.id)
    return false
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCategoriaVisivel(entry.target.dataset.categoria)
          }
        })
      },
      { threshold: 0.1, rootMargin: '-40% 0px -50% 0px' }
    )
    Object.entries(refs.current).forEach(([id, el]) => {
      if (el) {
        el.dataset.categoria = id
        observer.observe(el)
      }
    })
    return () => observer.disconnect()
  }, [secaoAtiva]) // re-observa quando a seção muda

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0)
  const buscaAtiva = busca.trim().length > 0
  const produtosFiltrados = buscaAtiva
    ? produtos.filter(i =>
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.descricao?.toLowerCase().includes(busca.toLowerCase())
      )
    : []

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#1a1a1a', color:'#FFB84D', fontSize:18, gap:12 }}>
      <span style={{ fontSize:28 }}>🍕</span> Carregando cardápio...
    </div>
  )

  function adicionarItem(item) {
    const quantidadeNova = item.quantidade || 1
    // Chave única combina id + opções escolhidas para não colapsar variações diferentes
    const chaveOpcoes = JSON.stringify({
      adicionais: [...(item.extras?.adicionais || [])].sort(),
      gelo: item.extras?.gelo || false,
      limao: item.extras?.limao || false,
      formato: item.extras?.formato || null,
    })
    const itemKey = `${item.id}__${chaveOpcoes}`

    setCarrinho((prev) => {
      const jaExiste = prev.find((i) => i._key === itemKey)
      if (jaExiste) {
        return prev.map((i) =>
          i._key === itemKey ? { ...i, quantidade: i.quantidade + quantidadeNova } : i
        )
      }
      return [...prev, { ...item, quantidade: quantidadeNova, _key: itemKey }]
    })
  }

  // Abre o carrinho e, na primeira vez da visita, sugere a esfiha "que falta"
  // (doce se só tem salgada, salgada se só tem doce).
  function abrirCarrinho() {
    setCarrinhoAberto(true)
    if (jaSugeriuEsfiha.current) return
    const temSalgada = carrinho.some(i => i.categoria === 'esfihas')
    const temDoce    = carrinho.some(i => i.categoria === 'esfihas-doces')
    let alvo = null
    if (temSalgada && !temDoce) alvo = 'esfihas-doces'
    else if (temDoce && !temSalgada) alvo = 'esfihas'
    if (!alvo) return
    const candidatos = produtos.filter(p => p.categoria === alvo && p.disponivel !== false)
    if (candidatos.length === 0) return
    const sugerida = candidatos.find(p => p.badge) ?? candidatos[0]
    jaSugeriuEsfiha.current = true
    setSugestaoEsfiha(sugerida)
  }

  // "Sim" na sugestão de esfiha → abre a esfiha sugerida (só passo Quantidade).
  function aceitarSugestaoEsfiha() {
    const e = sugestaoEsfiha
    setSugestaoEsfiha(null)
    setProdutoSelecionado(e)
  }

  function fecharModalProduto() {
    setProdutoSelecionado(null)
  }

  function limparCarrinho() {
    setCarrinho([])
  }

  function removerItem(key) {
    setCarrinho((prev) => prev.filter((i) => i._key !== key))
  }

  function alterarQuantidade(key, novaQtd) {
    if (novaQtd <= 0) {
      removerItem(key)
      return
    }
    setCarrinho((prev) =>
      prev.map((i) => i._key === key ? { ...i, quantidade: novaQtd } : i)
    )
  }

  function scrollParaCategoria(id, secao) {
    // Se vier com seção explícita (do Sidebar principal), troca a seção
    if (secao) setSecaoAtiva(secao)

    setCategoriaVisivel(id)
    // Aguarda o render das novas categorias antes de scrollar
    setTimeout(() => {
      refs.current[id]?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

async function confirmarPedido(itens, comanda) {
  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)

  try {
    // 1. Busca o restaurante_id
    const { data: rest, error: restErr } = await supabase
      .from('restaurantes')
      .select('id')
      .eq('slug', 'dominus')
      .single()
    if (restErr) throw restErr

    // 2. Busca o caixa aberto (se houver)
    const { data: caixa } = await supabase
      .from('caixas')
      .select('id')
      .eq('restaurante_id', rest.id)
      .is('fechado_em', null)
      .single()

    // 3. Busca sessão aberta para esta comanda (ou cria uma nova)
    const { data: sessaoExistente } = await supabase
      .from('sessoes_comanda')
      .select('id')
      .eq('restaurante_id', rest.id)
      .eq('codigo', comanda)
      .is('encerrada_em', null)
      .maybeSingle()

    let sessaoId = sessaoExistente?.id

    if (!sessaoId) {
      const { data: novaSessao, error: sessaoErr } = await supabase
        .from('sessoes_comanda')
        .insert({
          restaurante_id: rest.id,
          codigo:         comanda,
          mesa:           mesa || null,
          caixa_id:       caixa?.id || null,
        })
        .select('id')
        .single()
      if (sessaoErr) throw sessaoErr
      sessaoId = novaSessao.id
    }

    // 4. Insere o pedido vinculado à sessão
    const { data: pedido, error: pedErr } = await supabase
      .from('pedidos')
      .insert({
        restaurante_id: rest.id,
        comanda,
        sessao_id: sessaoId,
        total,
        status:   'recebido',
        caixa_id: caixa?.id || null,
        mesa,
      })
      .select()
      .single()
    if (pedErr) throw pedErr

    // 5. Insere os itens do pedido
    const itensSup = itens.map(i => ({
      pedido_id:      pedido.id,
      produto_id:     i.id,
      nome_snapshot:  i.nome,
      preco_snapshot: i.preco,
      quantidade:     i.quantidade,
      observacao:     i.extras?.observacao || null,
      extras: {
        adicionais: i.extras?.adicionais || [],
        retirados:  i.extras?.retirados  || [],
        tamanho:    i.extras?.tamanho    || null,
        gelo:       i.extras?.gelo       || false,
        limao:      i.extras?.limao      || false,
        copos:      i.extras?.copos      || null,
        tipoCombo:  i.extras?.tipoCombo  || null,
        itensCombo: i.extras?.itensCombo || [],
      },
    }))
    const { error: itensErr } = await supabase.from('itens_pedido').insert(itensSup)
    if (itensErr) throw itensErr

    // 6. Atualiza histórico local
    setHistorico(prev => [...prev, {
      id:      pedido.id,
      comanda,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      itens:   [...itens],
      total,
    }])
  } catch (err) {
    console.error('Erro ao salvar pedido:', err?.message || err?.code || JSON.stringify(err))
    throw err
  }
}

  return (
    <div className="app">
      <Header
        totalItens={totalItens}
        onAbrirCarrinho={abrirCarrinho}
        onAbrirConta={() => setContaAberta(true)}
        busca={busca}
        onBusca={setBusca}
        mesa={mesa}
        onMesaMudou={setMesa}
        onLogoClick={() => scrollParaCategoria('destaques', 'destaques')}
      />

      <div className="app-body">
        <Sidebar
          onMudar={scrollParaCategoria}
          categoriaVisivel={categoriaVisivel}
          secaoAtiva={secaoAtiva}
          onSecaoMudar={setSecaoAtiva}
          mesa={mesa}
        />

        <main
          className="app-conteudo"
          style={secaoAtiva === 'destaques' ? { overflowY: 'hidden' } : {}}
        >
          {buscaAtiva ? (
            <div className="busca-resultado">
              <p className="busca-info">
                {produtosFiltrados.length === 0
                  ? `Nenhum produto encontrado para "${busca}"`
                  : `${produtosFiltrados.length} resultado${produtosFiltrados.length > 1 ? 's' : ''} para "${busca}"`
                }
              </p>
              {produtosFiltrados.map((item) => (
                <CardItem
                  key={item.id}
                  nome={item.nome}
                  preco={item.preco}
                  precoPromo={item.precoPromo}
                  descricao={item.descricao}
                  imagem={item.imagem}
                  disponivel={item.disponivel !== false}
                  badge={item.badge}
                  onAdicionar={() => setProdutoSelecionado(item)}
                  onVerImagem={() => setProdutoImagem(item)}
                />
              ))}
            </div>
          ) : (
            categoriasVisiveis.map((cat) => {
              const itensDaCategoria = produtos.filter(i => i.categoria === cat.id)
              return (
                <div key={cat.id} ref={(el) => refs.current[cat.id] = el}>
                  {cat.id !== 'destaques' && (
                    <div className="secao-titulo">
                      <span className="secao-titulo-texto">{cat.label}</span>
                      <div className="secao-titulo-linha" />
                    </div>
                  )}
                  {cat.id === 'destaques' ? (

                    <Destaques
                    onAdicionar={setProdutoSelecionado}
                    onAbrirProduto={(produtoId) => {
                      const p = produtos.find(x => x.id === produtoId)
                      if (p) setProdutoSelecionado(p)
                    }}
                    produtos={produtos}
                    onNavegar={(destino) => {
                      if (!destino || destino === 'destaques') {
                        scrollParaCategoria('destaques', 'destaques')
                      } else if (destino === 'combos') {
                        scrollParaCategoria('combos', 'combos')
                      } else {
                        scrollParaCategoria(destino, 'cardapio')
                      }
                    }}
                  />
                  ) : (
                    itensDaCategoria.map((item) => (
                      <CardItem
                        key={item.id}
                        nome={item.nome}
                        preco={item.preco}
                        precoPromo={item.precoPromo}
                        descricao={item.descricao}
                        imagem={item.imagem}
                        disponivel={item.disponivel !== false}
                        badge={item.badge}
                        onAdicionar={() => setProdutoSelecionado(item)}
                        onVerImagem={() => setProdutoImagem(item)}
                      />
                    ))
                  )}
                </div>
              )
            })
          )}
        </main>
      </div>

      {carrinhoAberto && (
        <Carrinho
          itens={carrinho}
          onFechar={() => setCarrinhoAberto(false)}
          onRemover={removerItem}
          onAlterar={alterarQuantidade}
          onConfirmar={confirmarPedido}
          onLimpar={limparCarrinho}
          mesa={mesa}
        />
      )}

      {contaAberta && (
        <MinhaConta
          mesa={mesa}
          onFechar={() => setContaAberta(false)}
          onAbrirCarrinho={() => { setContaAberta(false); abrirCarrinho() }}
        />
      )}

      {produtoImagem && (
        <ModalImagem
          produto={produtoImagem}
          onFechar={() => setProdutoImagem(null)}
        />
      )}

      {produtoSelecionado && (
        <ModalProduto
          produto={produtoSelecionado}
          produtos={produtos}
          onFechar={fecharModalProduto}
          onAdicionar={adicionarItem}
          onPedirAgora={() => setCarrinhoAberto(true)}
        />
      )}

      {sugestaoEsfiha && (
        <PopupSugestao
          produto={sugestaoEsfiha}
          titulo={sugestaoEsfiha.categoria === 'esfihas-doces'
            ? 'Que tal uma esfiha doce?'
            : 'Que tal uma esfiha salgada?'}
          subtitulo={sugestaoEsfiha.categoria === 'esfihas-doces'
            ? 'Uma sobremesa pra fechar o pedido com chave de ouro.'
            : 'Complete seu pedido com uma salgada quentinha.'}
          textoSim="Sim, adicionar!"
          onSim={aceitarSugestaoEsfiha}
          onNao={() => setSugestaoEsfiha(null)}
        />
      )}

    </div>
  )
}

export default App