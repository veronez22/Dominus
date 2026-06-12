import { useState } from 'react'
import { X, ShoppingCart, CheckCircle, Minus, Plus } from 'lucide-react'
import ModalComanda from './ModalComanda'
import ModalAvaliacao from './ModalAvaliacao'
import './Carrinho.css'

function Carrinho({ itens, onRemover, onAlterar, onFechar, onConfirmar, onLimpar, mesa }) {
  const [etapa,          setEtapa]          = useState('carrinho')
  const [mensagemErro,   setMensagemErro]   = useState('')
  const [comanda,        setComanda]        = useState(null)
  const [finalizando,    setFinalizando]    = useState(false)
  const [mostrarAvaliar, setMostrarAvaliar] = useState(false)
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

      // Mostra avaliação apenas na primeira vez desta comanda
      const jaAvaliou = sessionStorage.getItem(`avaliou_${codigo}`)
      if (!jaAvaliou) {
        setTimeout(() => setMostrarAvaliar(true), 1500)
      } else {
        setTimeout(() => onFechar(), 3000)
      }
    } catch {
      setMensagemErro('Erro ao salvar pedido. Tente novamente.')
      setTimeout(() => setMensagemErro(''), 5000)
      setEtapa('carrinho')
    } finally {
      setFinalizando(false)
    }
  }

  function handleFecharAvaliacao() {
    if (comanda) sessionStorage.setItem(`avaliou_${comanda}`, '1')
    setMostrarAvaliar(false)
    onFechar()
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
                    const ext        = item.extras || {}
                    const adicionais = ext.adicionais || []
                    const retirados  = ext.retirados  || []
                    const observacao = ext.observacao || ''
                    const tamanho    = ext.tamanho
                    const gelo       = ext.gelo
                    const limao      = ext.limao
                    const copos      = ext.copos
                    const tipoCombo  = ext.tipoCombo
                    const itensCombo = ext.itensCombo || []

                    const TAMANHO_LABEL = { lata: 'Lata 350ml', ks: 'KS 473ml', '600ml': 'Garrafa Pet 600ml' }

                    return (
                      <div key={item._key || item.id} className="carrinho-item">
                        <div className="carrinho-item-info">
                          <div className="carrinho-item-topo">
                            <p>{item.nome}</p>
                            <button className="carrinho-item-remover" onClick={() => onRemover(item._key)}>
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

                          {/* Adicionais */}
                          {adicionais.length > 0 && (
                            <div className="carrinho-item-extras">
                              {adicionais.map(a => (
                                <span key={a.id} className="carrinho-item-tag carrinho-item-tag--add">+ {a.label}</span>
                              ))}
                            </div>
                          )}

                          {/* Retirados */}
                          {retirados.length > 0 && (
                            <div className="carrinho-item-extras">
                              {retirados.map(r => (
                                <span key={r} className="carrinho-item-tag carrinho-item-tag--rem">− Sem {r.toLowerCase()}</span>
                              ))}
                            </div>
                          )}

                          {/* Bebida: tamanho / copos / gelo / limão */}
                          {(tamanho || gelo || limao || (copos && copos > 1)) && (
                            <div className="carrinho-item-extras">
                              {tamanho && <span className="carrinho-item-tag carrinho-item-tag--tam">{TAMANHO_LABEL[tamanho] ?? tamanho}</span>}
                              {copos > 1 && <span className="carrinho-item-tag">{copos} copos</span>}
                              {gelo  && <span className="carrinho-item-tag">Gelo</span>}
                              {limao && <span className="carrinho-item-tag">Limão</span>}
                            </div>
                          )}

                          {/* Combo */}
                          {tipoCombo && itensCombo.length > 0 && (
                            <div className="carrinho-item-combo">
                              <span className="carrinho-combo-label">
                                {tipoCombo === 'familia' ? 'Combo Família' : 'Combo'}
                              </span>
                              {itensCombo.map((ci, idx) => (
                                <div key={idx} className="carrinho-combo-item">
                                  <span className="carrinho-combo-nome">{ci.quantidade > 1 ? `${ci.quantidade}× ${ci.nome}` : `+ ${ci.nome}`}</span>
                                  {(ci.tamanho || ci.gelo || ci.limao || (ci.copos && ci.copos > 1)) && (
                                    <span className="carrinho-combo-opts">
                                      {ci.tamanho ? (TAMANHO_LABEL[ci.tamanho] ?? ci.tamanho) : ''}
                                      {ci.copos > 1 ? ` · ${ci.copos} copos` : ''}
                                      {ci.gelo  ? ' · gelo'  : ''}
                                      {ci.limao ? ' · limão' : ''}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {observacao && (
                            <p className="carrinho-item-obs">{observacao}</p>
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

      {/* Modal de avaliação — aparece após o primeiro pedido da comanda */}
      {mostrarAvaliar && (
        <ModalAvaliacao
          comanda={comanda}
          mesa={mesa}
          onFechar={handleFecharAvaliacao}
        />
      )}
    </>
  )
}

export default Carrinho