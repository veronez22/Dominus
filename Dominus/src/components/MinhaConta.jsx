import { useState, useEffect, useRef } from 'react'
import { X, Clock, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import './MinhaConta.css'

function MinhaConta({ mesa, historico, onFechar, onAbrirCarrinho }) {
  const [etapa, setEtapa] = useState('scanner')
  const [comanda, setComanda] = useState(null)
  const [erroMsg, setErroMsg] = useState('')
  const scannerRef = useRef(null)
  const rodandoRef = useRef(false)

  const pedidosDaComanda = historico.filter(p => p.comanda === comanda)
  const totalGasto = pedidosDaComanda.reduce((s, p) => s + p.total, 0)
  const totalItens = pedidosDaComanda.reduce((s, p) =>
    s + p.itens.reduce((si, i) => si + i.quantidade, 0), 0)

  useEffect(() => {
    if (etapa !== 'scanner') return

    const scanner = new Html5Qrcode('qr-conta-container')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (texto) => {
        if (/^CMD-\d{4}$/.test(texto)) {
          if (rodandoRef.current) {
            rodandoRef.current = false
            scanner.stop().catch(() => {})
          }
          setComanda(texto)
          setEtapa('conta')
        } else {
          setErroMsg('QR Code inválido. Use a comanda do estabelecimento.')
          setTimeout(() => setErroMsg(''), 2500)
        }
      },
      () => {}
    ).then(() => {
      rodandoRef.current = true
    }).catch(() => {
      setEtapa('erro')
    })

    return () => {
      if (rodandoRef.current) {
        rodandoRef.current = false
        scanner.stop().catch(() => {})
      }
    }
  }, [etapa])

  return (
    <div className="modal-overlay conta-overlay" onClick={onFechar}>
      <div className="conta-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Scanner ── */}
        {etapa === 'scanner' && (
          <>
            <div className="conta-header">
              <div className="conta-header-info">
                <h2>Minha Conta</h2>
                <span>Leia sua comanda para continuar</span>
              </div>
              <button className="conta-btn-fechar" onClick={onFechar}><X size={20} /></button>
            </div>
            <div className="conta-scanner-area">
              <div className="conta-scanner-topo">
                <Camera size={22} color="var(--cor-primaria)" />
                <p>Aponte o QR Code da comanda para a câmera</p>
              </div>
              <div className="conta-camera-wrapper">
                <div id="qr-conta-container" className="conta-camera-inner" />
                <div className="conta-frame">
                  <span className="frame-tl" /><span className="frame-tr" />
                  <span className="frame-bl" /><span className="frame-br" />
                </div>
                <div className="conta-scanline" />
              </div>
              {erroMsg && <p className="conta-erro">{erroMsg}</p>}
            </div>
          </>
        )}

        {/* ── Conta da comanda ── */}
        {etapa === 'conta' && (
          <>
            <div className="conta-header">
              <div className="conta-header-info">
                <h2>Minha Conta</h2>
                <span>{comanda} · {mesa ? `Mesa ${mesa}` : 'Mesa não definida'}</span>
              </div>
              <button className="conta-btn-fechar" onClick={onFechar}><X size={20} /></button>
            </div>

            <div className="conta-historico">
              {pedidosDaComanda.length === 0 ? (
                <div className="conta-vazio">
                  <p>Nenhum pedido realizado nesta comanda.</p>
                  <button className="conta-btn-pedir" onClick={() => { onFechar(); onAbrirCarrinho() }}>
                    Fazer pedido
                  </button>
                </div>
              ) : (
                <>
                  {[...pedidosDaComanda].reverse().map((pedido, idx) => (
                    <div key={pedido.id} className="conta-pedido">

                      {/* Header do pedido */}
                      <div className="conta-pedido-header">
                        <span className="conta-pedido-badge">
                          Pedido #{pedidosDaComanda.length - idx}
                        </span>
                        <span className="conta-pedido-horario">
                          <Clock size={13} />
                          {pedido.horario}
                        </span>
                      </div>

                      {/* Itens com adicionais e obs */}
                      <div className="conta-pedido-itens">
                        {pedido.itens.map((item) => {
                          const adicionais = item.extras?.adicionais || []
                          const observacao = item.extras?.observacao || ''
                          const gelo = item.extras?.gelo
                          const limao = item.extras?.limao
                          const formato = item.extras?.formato

                          const tags = [
                            ...adicionais.map(a => `+ ${a}`),
                            gelo ? 'Gelo' : null,
                            limao ? 'Limão' : null,
                            formato || null,
                          ].filter(Boolean)

                          return (
                            <div key={item.id} className="conta-pedido-item">
                              <div className="conta-item-esquerda">
                                <div className="conta-item-linha">
                                  <span className="conta-pedido-item-qtd">x{item.quantidade}</span>
                                  <span className="conta-pedido-item-nome">{item.nome}</span>
                                </div>
                                {tags.length > 0 && (
                                  <div className="conta-item-tags">
                                    {tags.map((tag) => (
                                      <span key={tag} className="conta-item-tag">{tag}</span>
                                    ))}
                                  </div>
                                )}
                                {observacao && (
                                  <p className="conta-item-obs">Obs: {observacao}</p>
                                )}
                              </div>
                              <span className="conta-pedido-item-preco">
                                R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                    </div>
                  ))}

                  {/* Total destacado */}
                  <div className="conta-total-destaque">
                    <div>
                      <p className="conta-total-label">Total da comanda</p>
                      <p className="conta-total-valor">
                        R$ {totalGasto.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="conta-total-info">
                      <span>{pedidosDaComanda.length} {pedidosDaComanda.length === 1 ? 'pedido' : 'pedidos'} · {totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
                      {mesa && <span>Mesa {mesa}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Erro câmera ── */}
        {etapa === 'erro' && (
          <div className="conta-camera-erro">
            <X size={64} strokeWidth={1.5} color="#f55" />
            <h2>Câmera indisponível</h2>
            <p>Não foi possível acessar a câmera. Verifique as permissões do navegador.</p>
            <button className="conta-btn-pedir" onClick={onFechar}>Fechar</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default MinhaConta