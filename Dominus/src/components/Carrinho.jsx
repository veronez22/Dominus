import { useState } from 'react'
import { X, ShoppingCart, CheckCircle } from 'lucide-react'
import './Carrinho.css'

function Carrinho({ itens, onRemover, onFechar, onConfirmar }) {
  const [confirmado, setConfirmado] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(false)
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  function handleConfirmar() {
    if (itens.length === 0) {
      setMensagemErro(true)
      setTimeout(() => setMensagemErro(false), 2500)
      return
    }
    onConfirmar(itens)
    setConfirmado(true)
  }

  return (
    <div className="modal-overlay carrinho-overlay" onClick={onFechar}>
      <div className="carrinho" onClick={(e) => e.stopPropagation()}>

        {confirmado ? (

          /* ── Tela de confirmação ── */
          <div className="carrinho-confirmado">
            <div className="carrinho-confirmado-icone">
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h2>Pedido Enviado!</h2>
            <p>Seu pedido foi recebido e já está sendo preparado.</p>
            <button className="carrinho-btn-confirmar" onClick={onFechar}>Fechar</button>
          </div>

        ) : (

          /* ── Tela normal ── */
          <>
            <div className="carrinho-header">
              <div className="carrinho-header-titulo">
                <ShoppingCart size={20} />
                <h2>Meu Pedido</h2>
              </div>
              <button className="carrinho-btn-fechar" onClick={onFechar}>
                <X size={18} />
              </button>
            </div>

            <div className="carrinho-itens">
              {itens.length === 0 ? (
                <p className="carrinho-vazio">Seu carrinho está vazio</p>
              ) : (
                itens.map((item) => {
                  const adicionais = item.extras?.adicionais || []
                  const observacao = item.extras?.observacao || ''
                  const gelo = item.extras?.gelo
                  const limao = item.extras?.limao

                  const tagExtras = [
                    ...adicionais,
                    gelo ? 'Gelo' : null,
                    limao ? 'Limão' : null,
                  ].filter(Boolean)

                  return (
                    <div key={item.id} className="carrinho-item">
                      <div className="carrinho-item-info">
                        <div className="carrinho-item-topo">
                          <p>{item.nome}</p>
                          <button
                            className="carrinho-item-remover"
                            onClick={() => onRemover(item.id)}
                          >
                            <X size={13} />
                          </button>
                        </div>

                        <span className="carrinho-item-preco">
                          x{item.quantidade} · R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        </span>

                        {/* Tags de adicionais */}
                        {tagExtras.length > 0 && (
                          <div className="carrinho-item-tags">
                            {tagExtras.map((tag) => (
                              <span key={tag} className="carrinho-item-tag">+ {tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Observação */}
                        {observacao && (
                          <p className="carrinho-item-obs">
                            Obs: {observacao}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="carrinho-footer">
              <div className="carrinho-total">
                <span>Total</span>
                <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
              </div>
              {mensagemErro && (
                <p className="carrinho-erro">Adicione pelo menos um produto!</p>
              )}
              <button className="carrinho-btn-confirmar" onClick={handleConfirmar}>
                Confirmar Pedido
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Carrinho