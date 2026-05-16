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

function ModalProduto({ produto, onFechar, onAdicionar }) {
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')
  const [gelo, setGelo] = useState(false)
  const [limao, setLimao] = useState(false)
  const [copos, setCopos] = useState(1)
  const [formatoSelecionado, setFormatoSelecionado] = useState(
    produto.formatos?.[0] || null
  )
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([])

  const temUpsell = CATEGORIAS_UPSELL.includes(produto.categoria)
  const ehBebida = produto.categoria === 'bebidas'
  const temFormatos = produto.formatos && produto.formatos.length > 1

  const totalAdicionais = adicionaisSelecionados.reduce((s, id) => {
    const a = ADICIONAIS.find(a => a.id === id)
    return s + (a?.preco || 0)
  }, 0)

  const precoTotal = (produto.preco + totalAdicionais) * quantidade

  function toggleAdicional(id) {
    setAdicionaisSelecionados(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function handleConfirmar() {
    onAdicionar({
      ...produto,
      quantidade,
      preco: produto.preco + totalAdicionais,
      extras: {
        gelo,
        limao,
        copos: ehBebida ? copos : undefined,
        formato: formatoSelecionado,
        adicionais: adicionaisSelecionados,
        observacao,
      }
    })
    onFechar()
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <button className="modal-fechar" onClick={onFechar}>
          <X size={18} />
        </button>

        {/* Imagem */}
        <div className="modal-imagem-wrapper">
          <img src={produto.imagem} alt={produto.nome} className="modal-imagem" />
          {produto.badge && (
            <span className="modal-imagem-badge">{produto.badge}</span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="modal-conteudo">

          {/* Cabeçalho */}
          <div className="modal-cabecalho">
            <div>
              <h2 className="modal-nome">{produto.nome}</h2>
              <p className="modal-descricao">{produto.descricao}</p>
            </div>
            <span className="modal-preco">
              R$ {produto.preco.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="modal-divisor" />

          {/* Formatos — só se tiver mais de um */}
          {temFormatos && (
            <div className="modal-secao">
              <p className="modal-secao-titulo">Tamanho</p>
              <div className="modal-pills">
                {produto.formatos.map((f) => (
                  <button
                    key={f}
                    className={`modal-pill ${formatoSelecionado === f ? 'ativo' : ''}`}
                    onClick={() => setFormatoSelecionado(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opções bebidas */}
          {ehBebida && (
            <div className="modal-secao">
              <p className="modal-secao-titulo">Opções</p>
              <div className="modal-pills">
                <button
                  className={`modal-pill ${gelo ? 'ativo' : ''}`}
                  onClick={() => setGelo(g => !g)}
                >
                  Gelo
                </button>
                <button
                  className={`modal-pill ${limao ? 'ativo' : ''}`}
                  onClick={() => setLimao(l => !l)}
                >
                  Limão
                </button>
              </div>

              {/* Quantidade de copos */}
              <div className="modal-copos">
                <span className="modal-copos-label">Quantidade de copos</span>
                <div className="modal-copos-contador">
                  <button onClick={() => setCopos(c => Math.max(1, c - 1))}>
                    <Minus size={14} />
                  </button>
                  <span>{copos}</span>
                  <button onClick={() => setCopos(c => c + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Adicionais — só esfihas e cigarretes */}
          {temUpsell && (
            <div className="modal-secao">
              <p className="modal-secao-titulo">Adicionais</p>
              <div className="modal-pills">
                {ADICIONAIS.map((a) => {
                  const ativo = adicionaisSelecionados.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      className={`modal-pill ${ativo ? 'ativo' : ''}`}
                      onClick={() => toggleAdicional(a.id)}
                    >
                      {a.label}
                      <span className="modal-pill-preco">
                        {a.preco === 0 ? ' · Grátis' : ` · + R$ ${a.preco.toFixed(2).replace('.', ',')}`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Observação */}
          <div className="modal-secao modal-secao-obs">
            <p className="modal-secao-titulo">Observação</p>
            <textarea
              className="modal-textarea"
              placeholder="Ex: sem cebola, bem passado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          {/* Rodapé */}
          <div className="modal-rodape">
            <div className="modal-quantidade">
              <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>
                <Minus size={15} />
              </button>
              <span>{quantidade}</span>
              <button onClick={() => setQuantidade(q => q + 1)}>
                <Plus size={15} />
              </button>
            </div>
            <button className="modal-btn-adicionar" onClick={handleConfirmar}>
              Adicionar · R$ {precoTotal.toFixed(2).replace('.', ',')}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ModalProduto