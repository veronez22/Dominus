import { useState } from 'react'
import { X, ShoppingCart, CheckCircle, Minus, Plus } from 'lucide-react'
import ModalComanda from './ModalComanda'
import './Carrinho.css'

function Carrinho({ itens, onRemover, onAlterar, onFechar, onConfirmar, onLimpar, mesa }) {
  const [etapa,        setEtapa]        = useState('carrinho')
  const [mensagemErro, setMensagemErro] = useState('')
  const [comanda,      setComanda]      = useState(null)
  const [finalizando,  setFinalizando]  = useState(false)
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  function handleConfirmar() {
    if (itens.length === 0) {
      setMensagemErro('Adicione pelo menos um produto!')
      setTimeout(() => setMensagemErro(''), 5000)
      return
    }
    if (!mesa) {
      setMensagemErro('Defina o número da mesa antes de confirmar.')
      setTimeout(() => setMensagemErro(''), 5000)
      return
    }
    setEtapa('comanda')
  }

  async function handleComandaLida(codigo) {
    if (finalizando) return
    setFinalizando(true)
    try {
      await onConfirmar(itens, codigo)  // salva no banco
      onLimpar()                         // limpa o carrinho
      setComanda(codigo)
      setEtapa('sucesso')
      setTimeout(() => onFechar(), 3000) // fecha após 3s mostrando o sucesso
    } catch {
      setMensagemErro('Erro ao salvar pedido. Tente novamente.')
      setTimeout(() => setMensagemErro(''), 5000)
      setEtapa('carrinho')
    } finally {
      setFinalizando(false)
    }
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
                      <div key={item._key || item.id} className="carrinho-item">
                        <div className="carrinho-item-info">
                          <div className="carrinho-item-topo">
                            <p>{item.nome}</p>
                            <button
                              className="carrinho-item-remover"
                              onClick={() => onRemover(item._key)}
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <div className="carrinho-item-qtd-row">
                            <div className="carrinho-item-contador">
                              <button className="carrinho-qtd-btn" onClick={() => onAlterar(item._key, item.quantidade - 1)}>
                                <Minus size={12} />
                              </button>
                              <span className="carrinho-qtd-num">{item.quantidade}</span>
                              <button className="carrinho-qtd-btn" onClick={() => onAlterar(item._key, item.quantidade + 1)}>
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="carrinho-item-preco">
                              R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
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
                <div className="carrinho-footer-btns">
                  <button className="carrinho-btn-pedir-mais" onClick={onFechar}>
                    Pedir Mais
                  </button>
                  <button
                    className="carrinho-btn-confirmar"
                    onClick={handleConfirmar}
                    disabled={finalizando}
                  >
                    {finalizando ? 'Salvando...' : 'Finalizar Pedido'}
                  </button>
                </div>
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