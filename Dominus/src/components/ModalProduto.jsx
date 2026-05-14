import './ModalProduto.css'
import { X, Minus, Plus, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const ADICIONAIS = [
  { id: 'catupiry',  label: 'Catupiry',  preco: 1.00},
  { id: 'bacon',     label: 'Bacon',     preco: 1.50},
  { id: 'cheddar',   label: 'Cheddar',   preco: 1.00},
  { id: 'ketchup',   label: 'Ketchup',   preco: 0.00},
]

const CATEGORIAS_UPSELL = ['esfihas', 'cigarretes']

function ModalProduto({ produto, onFechar, onAdicionar }) {
  const [etapa, setEtapa] = useState('produto')   // 'produto' | 'upsell'
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')
  const [gelo, setGelo] = useState(false)
  const [limao, setLimao] = useState(false)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState([])

  const temUpsell = CATEGORIAS_UPSELL.includes(produto.categoria)

  const totalAdicionais = adicionaisSelecionados.reduce((s, id) => {
    const adicional = ADICIONAIS.find(a => a.id === id)
    return s + (adicional?.preco || 0)
  }, 0)

  const precoTotal = (produto.preco + totalAdicionais) * quantidade

  function toggleAdicional(id) {
    setAdicionaisSelecionados(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function handleAvancar() {
    if (temUpsell) {
      setEtapa('upsell')
    } else {
      handleConfirmar()
    }
  }

  function handleConfirmar() {
    onAdicionar({
      ...produto,
      quantidade,
      preco: produto.preco + totalAdicionais,
      extras: {
        gelo,
        limao,
        adicionais: adicionaisSelecionados,
        observacao
      }
    })
    onFechar()
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <button className="modal-fechar" onClick={onFechar}>
          <X size={20} />
        </button>

        {/* ── Imagem ── */}
        <img src={produto.imagem} alt={produto.nome} className="modal-imagem" />

        {/* ── Conteúdo ── */}
        <div className="modal-conteudo">

          {etapa === 'produto' ? (
            <>
              <h2 className="modal-nome">{produto.nome}</h2>
              <p className="modal-descricao">{produto.descricao}</p>
              <span className="modal-preco">
                R$ {produto.preco.toFixed(2).replace('.', ',')}
              </span>

              <div className="modal-divisor" />

              {/* Opções bebidas */}
              {produto.categoria === 'bebidas' && (
                <div className="modal-opcoes">
                  <p className="modal-opcoes-titulo">Opções</p>
                  <label className="modal-opcao">
                    <input type="checkbox" checked={gelo} onChange={(e) => setGelo(e.target.checked)} />
                    Gelo
                  </label>
                  <label className="modal-opcao">
                    <input type="checkbox" checked={limao} onChange={(e) => setLimao(e.target.checked)} />
                    Limão
                  </label>
                </div>
              )}

              {/* Observação */}
              <div className="modal-observacao">
                <p className="modal-opcoes-titulo">Alguma observação?</p>
                <textarea
                  placeholder="Ex: sem cebola, bem passado..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </div>

              {/* Rodapé */}
              <div className="modal-rodape">
                <div className="modal-quantidade">
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>
                    <Minus size={16} />
                  </button>
                  <span>{quantidade}</span>
                  <button onClick={() => setQuantidade(q => q + 1)}>
                    <Plus size={16} />
                  </button>
                </div>

                <button className="modal-btn-adicionar" onClick={handleAvancar}>
                  {temUpsell ? (
                    <>
                      Personalizar
                      <ChevronRight size={18} />
                    </>
                  ) : (
                    `Adicionar · R$ ${precoTotal.toFixed(2).replace('.', ',')}`
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ── Tela de upsell ── */}
              <div className="modal-upsell-header">
                <button className="modal-upsell-voltar" onClick={() => setEtapa('produto')}>
                  ← Voltar
                </button>
                <div>
                  <h2 className="modal-nome">Deseja adicionar algo?</h2>
                  <p className="modal-descricao">Deixe sua {produto.nome} ainda mais especial</p>
                </div>
              </div>

              <div className="modal-divisor" />

              <div className="modal-upsell-lista">
                {ADICIONAIS.map((adicional) => {
                  const selecionado = adicionaisSelecionados.includes(adicional.id)
                  return (
                    <button
                      key={adicional.id}
                      className={`modal-upsell-item ${selecionado ? 'selecionado' : ''}`}
                      onClick={() => toggleAdicional(adicional.id)}
                    >
                      <span className="modal-upsell-emoji">{adicional.emoji}</span>
                      <span className="modal-upsell-label">{adicional.label}</span>
                      <span className="modal-upsell-preco">
                        {adicional.preco === 0 ? 'Grátis' : `+ R$ ${adicional.preco.toFixed(2).replace('.', ',')}`}
                      </span>
                      <span className="modal-upsell-check">
                        {selecionado ? '✓' : '+'}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="modal-rodape" style={{ marginTop: 'auto' }}>
                <button className="modal-btn-adicionar modal-btn-confirmar-upsell" onClick={handleConfirmar}>
                  Adicionar ao Pedido · R$ {precoTotal.toFixed(2).replace('.', ',')}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default ModalProduto