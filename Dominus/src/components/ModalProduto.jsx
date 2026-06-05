import './ModalProduto.css'
import { X, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

const ADICIONAIS = [
  { id: 'catupiry', label: 'Catupiry', preco: 1.00 },
  { id: 'bacon',    label: 'Bacon',    preco: 1.50 },
  { id: 'cheddar',  label: 'Cheddar',  preco: 1.00 },
  { id: 'ketchup',  label: 'Ketchup',  preco: 0.00 },
]

const CATEGORIAS_UPSELL = ['esfihas', 'cigarretes']

function ModalProduto({ produto, onFechar, onAdicionar, onPedirAgora }) {
  const [quantidade,             setQuantidade]             = useState(1)
  const [observacao,             setObservacao]             = useState('')
  const [gelo,                   setGelo]                   = useState(false)
  const [limao,                  setLimao]                  = useState(false)
  const [copos,                  setCopos]                  = useState(1)
  const [formatoSelecionado,     setFormatoSelecionado]     = useState(produto.formatos?.[0] || null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([])

  const temUpsell  = CATEGORIAS_UPSELL.includes(produto.categoria)
  const ehBebida   = produto.categoria === 'bebidas'
  const temFormatos = produto.formatos && produto.formatos.length > 1

  const totalAdicionais = adicionaisSelecionados.reduce((s, id) => {
    const a = ADICIONAIS.find(a => a.id === id)
    return s + (a?.preco || 0)
  }, 0)

  const precoBase  = produto.precoPromo ?? produto.preco
  const precoUnit  = precoBase + totalAdicionais
  const precoTotal = precoUnit * quantidade

  function toggleAdicional(id) {
    setAdicionaisSelecionados(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function montarItem() {
    return {
      ...produto,
      quantidade,
      preco: precoUnit,
      extras: {
        gelo,
        limao,
        copos: ehBebida ? copos : undefined,
        formato: formatoSelecionado,
        adicionais: adicionaisSelecionados,
        observacao,
      }
    }
  }

  function handleAdicionar() {
    onAdicionar(montarItem())
    onFechar()
  }

  function handlePedirAgora() {
    onAdicionar(montarItem())
    onFechar()
    onPedirAgora?.()
  }

  return (
    <div className="mp-overlay" onClick={onFechar}>
      <div className="mp-sheet" onClick={e => e.stopPropagation()}>

        <div className="mp-handle" />

        {/* ── Hero ── */}
        <div className="mp-hero">
          {produto.imagem && <img src={produto.imagem} alt={produto.nome} className="mp-hero-img" />}
          <div className="mp-hero-grad" />
          {produto.badge && <span className="mp-hero-badge">{produto.badge}</span>}
          <button className="mp-fechar" onClick={onFechar}><X size={18} /></button>
        </div>

        {/* ── Corpo ── */}
        <div className="mp-corpo">

          <div className="mp-cabecalho">
            <div>
              <h2 className="mp-nome">{produto.nome}</h2>
              {produto.descricao && <p className="mp-desc">{produto.descricao}</p>}
            </div>
            <div className="mp-precos">
              {produto.precoPromo
                ? <>
                    <span className="mp-preco-original">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
                    <span className="mp-preco">R$ {produto.precoPromo.toFixed(2).replace('.', ',')}</span>
                  </>
                : <span className="mp-preco">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
              }
            </div>
          </div>

          {/* Formatos */}
          {temFormatos && (
            <div className="mp-secao">
              <p className="mp-secao-titulo">Tamanho</p>
              <div className="mp-pills">
                {produto.formatos.map(f => (
                  <button key={f} className={`mp-pill ${formatoSelecionado === f ? 'mp-pill--ativo' : ''}`} onClick={() => setFormatoSelecionado(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opções bebida */}
          {ehBebida && (
            <div className="mp-secao">
              <p className="mp-secao-titulo">Opções</p>
              <div className="mp-pills">
                <button className={`mp-pill ${gelo ? 'mp-pill--ativo' : ''}`} onClick={() => setGelo(g => !g)}>Gelo</button>
                <button className={`mp-pill ${limao ? 'mp-pill--ativo' : ''}`} onClick={() => setLimao(l => !l)}>Limão</button>
              </div>
              <div className="mp-copos">
                <span className="mp-copos-label">Quantidade de copos</span>
                <div className="mp-contador mp-contador--sm">
                  <button className="mp-contador-btn" onClick={() => setCopos(c => Math.max(1, c - 1))}><Minus size={14}/></button>
                  <span className="mp-contador-num">{copos}</span>
                  <button className="mp-contador-btn" onClick={() => setCopos(c => c + 1)}><Plus size={14}/></button>
                </div>
              </div>
            </div>
          )}

          {/* Adicionais */}
          {temUpsell && (
            <div className="mp-secao">
              <p className="mp-secao-titulo">Adicionais</p>
              <div className="mp-pills">
                {ADICIONAIS.map(a => {
                  const ativo = adicionaisSelecionados.includes(a.id)
                  return (
                    <button key={a.id} className={`mp-pill mp-pill--add ${ativo ? 'mp-pill--ativo' : ''}`} onClick={() => toggleAdicional(a.id)}>
                      <span>{a.label}</span>
                      <span className="mp-pill-preco">{a.preco === 0 ? 'Grátis' : `+ R$ ${a.preco.toFixed(2).replace('.', ',')}`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="mp-secao">
            <p className="mp-secao-titulo">Observação</p>
            <textarea
              className="mp-textarea"
              placeholder="Ex: sem cebola, bem passado..."
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
            />
          </div>

        </div>

        {/* ── Rodapé fixo ── */}
        <div className="mp-rodape">
          <div className="mp-contador">
            <button className="mp-contador-btn" onClick={() => setQuantidade(q => Math.max(1, q - 1))}><Minus size={16}/></button>
            <span className="mp-contador-num">{quantidade}</span>
            <button className="mp-contador-btn" onClick={() => setQuantidade(q => q + 1)}><Plus size={16}/></button>
          </div>
          <div className="mp-btns">
            <button className="mp-btn mp-btn--sec" onClick={handleAdicionar}>Adicionar</button>
            <button className="mp-btn mp-btn--pri" onClick={handlePedirAgora}>
              Pedir Agora · R$ {precoTotal.toFixed(2).replace('.', ',')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ModalProduto
