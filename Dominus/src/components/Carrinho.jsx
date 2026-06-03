import { useState } from 'react'
import { X, ShoppingCart, CheckCircle } from 'lucide-react'
import ModalComanda from './ModalComanda'
import './Carrinho.css'

function Carrinho({ itens, onRemover, onFechar, onConfirmar, onLimpar, mesa }) {
  const [etapa, setEtapa] = useState('carrinho')  // 'carrinho' | 'comanda' | 'sucesso'
  const [mensagemErro, setMensagemErro] = useState('')
  const [comanda, setComanda] = useState(null)
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

function handleConfirmar() {
  if (itens.length === 0) {
    setMensagemErro('Adicione pelo menos um produto!')
    setTimeout(() => setMensagemErro(''), 2500)
    return
  }
  if (!mesa) {
    setMensagemErro('Defina o número da mesa antes de confirmar.')
    setTimeout(() => setMensagemErro(''), 2500)
    return
  }
  setEtapa('comanda')
}

function handleComandaLida(codigo) {
  onConfirmar(itens, codigo)  // salva no banco
  onLimpar()                  // limpa o carrinho
  onFechar()                  // fecha tudo imediatamente
}

  return (
    <>
      <div className="modal-overlay carrinho-overlay" onClick={onFechar} style={etapa === 'comanda' ? { display: 'none' } : {}}>
        <div className="carrinho" onClick={(e) => e.stopPropagation()}>

          {etapa === 'sucesso' ? (
            <div className="carrinho-confirmado">
              <div className="carrinho-confirmado-icone">
                <CheckCircle size={64} strokeWidth={1.5} />
              </div>
              <h2>Pedido Confirmado!</h2>
              <p>Comanda <strong style={{ color: 'var(--cor-primaria)' }}>{comanda}</strong> vinculada com sucesso.</p>
              <button className="carrinho-btn-confirmar" onClick={onFechar}>Fechar</button>
            </div>

          ) : (
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
                          {tagExtras.length > 0 && (
                            <div className="carrinho-item-tags">
                              {tagExtras.map((tag) => (
                                <span key={tag} className="carrinho-item-tag">+ {tag}</span>
                              ))}
                            </div>
                          )}
                          {observacao && (
                            <p className="carrinho-item-obs">Obs: {observacao}</p>
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
                  <p className="carrinho-erro">{mensagemErro}</p>
                )}
                <button className="carrinho-btn-confirmar" onClick={handleConfirmar}>
                  Confirmar Pedido
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Modal da câmera — abre sobre o carrinho */}
      {etapa === 'comanda' && (
        <ModalComanda
          onFechar={() => setEtapa('carrinho')}
          onComandaLida={handleComandaLida}
        />
      )}
    </>
  )
}

export default Carrinho