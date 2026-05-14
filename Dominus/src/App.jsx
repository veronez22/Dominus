import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CardItem from './components/CardItem'
import Carrinho from './components/Carrinho'
import ModalProduto from './components/ModalProduto'
import Destaques from './components/Destaques'
import MinhaConta from './components/MinhaConta'
import { cardapio, categorias } from './data/cardapio'
import './App.css'

function App() {
  const [carrinho, setCarrinho] = useState([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [contaAberta, setContaAberta] = useState(false)
  const [categoriaVisivel, setCategoriaVisivel] = useState('destaques')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [busca, setBusca] = useState('')
  const [historico, setHistorico] = useState([])
  const [mesa, setMesa] = useState('')

  const refs = useRef({})

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
  }, [])

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0)
  const buscaAtiva = busca.trim().length > 0
  const produtosFiltrados = buscaAtiva
    ? cardapio.filter(i =>
        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
        i.descricao.toLowerCase().includes(busca.toLowerCase())
      )
    : []

  function adicionarItem(item) {
    setCarrinho((prev) => {
      const jaExiste = prev.find((i) => i.id === item.id)
      if (jaExiste) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  function removerItem(id) {
    setCarrinho((prev) => prev.filter((i) => i.id !== id))
  }

  function scrollParaCategoria(id) {
    setCategoriaVisivel(id)
    refs.current[id]?.scrollIntoView({ behavior: 'smooth' })
  }

  function confirmarPedido(itens) {
    const novoPedido = {
      id: Date.now(),
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      itens: [...itens],
      total: itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
    }
    setHistorico(prev => [...prev, novoPedido])
  }

  return (
    <div className="app">
      <Header
        totalItens={totalItens}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
        onAbrirConta={() => setContaAberta(true)}
        busca={busca}
        onBusca={setBusca}
        mesa={mesa}
        onMesaMudou={setMesa}
      />

      <div className="app-body">
        <Sidebar onMudar={scrollParaCategoria} categoriaVisivel={categoriaVisivel} />

        <main className="app-conteudo">
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
                  descricao={item.descricao}
                  imagem={item.imagem}
                  onAdicionar={() => setProdutoSelecionado(item)}
                />
              ))}
            </div>
          ) : (
            categorias.map((cat) => {
              const itensDaCategoria = cardapio.filter(i => i.categoria === cat.id)
              return (
                <div key={cat.id} ref={(el) => refs.current[cat.id] = el}>
                  {cat.id !== 'destaques' && (
                    <div className="secao-titulo"><h2>{cat.label}</h2></div>
                  )}
                  {cat.id === 'destaques' ? (
                    <Destaques onAdicionar={setProdutoSelecionado} />
                  ) : (
                    itensDaCategoria.map((item) => (
                      <CardItem
                        key={item.id}
                        nome={item.nome}
                        preco={item.preco}
                        descricao={item.descricao}
                        imagem={item.imagem}
                        onAdicionar={() => setProdutoSelecionado(item)}
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
          onConfirmar={confirmarPedido}
        />
      )}

      {contaAberta && (
        <MinhaConta
          mesa={mesa}
          historico={historico}
          onFechar={() => setContaAberta(false)}
          onAbrirCarrinho={() => { setContaAberta(false); setCarrinhoAberto(true) }}
        />
      )}

      {produtoSelecionado && (
        <ModalProduto
          produto={produtoSelecionado}
          onFechar={() => setProdutoSelecionado(null)}
          onAdicionar={adicionarItem}
        />
      )}
    </div>
  )
}

export default App