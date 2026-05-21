import { useState, useEffect, useRef } from 'react'
import { X, ShoppingBag, UtensilsCrossed, Clock, Camera, CheckCircle } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import './MinhaConta.css'

function MinhaConta({ mesa, historico, onFechar, onAbrirCarrinho }) {
  const [etapa, setEtapa] = useState('scanner')  // 'scanner' | 'conta' | 'erro'
  const [comanda, setComanda] = useState(null)
  const [erroMsg, setErroMsg] = useState('')
  const scannerRef = useRef(null)
  const rodandoRef = useRef(false)

  const totalGasto = historico.reduce((s, p) => s + p.total, 0)
  const totalItens = historico.reduce((s, p) =>
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

        {/* ── Etapa 1: Scanner ── */}
        {etapa === 'scanner' && (
          <>
            <div className="conta-header">
              <div className="conta-header-info">
                <h2>Minha Conta</h2>
                <span>Leia sua comanda para continuar</span>
              </div>
              <button className="conta-btn-fechar" onClick={onFechar}>
                <X size={20} />
              </button>
            </div>

            <div className="conta-scanner-area">
              <div className="conta-scanner-topo">
                <Camera size={22} color="var(--cor-primaria)" />
                <p>Aponte o QR Code da comanda para a câmera</p>
              </div>

              <div className="conta-camera-wrapper">
                <div id="qr-conta-container" className="conta-camera-inner" />
                <div className="conta-frame">
                  <span className="frame-tl" />
                  <span className="frame-tr" />
                  <span className="frame-bl" />
                  <span className="frame-br" />
                </div>
                <div className="conta-scanline" />
              </div>

              {erroMsg && <p className="conta-erro">{erroMsg}</p>}
            </div>
          </>
        )}

        {/* ── Etapa 2: Conta da comanda ── */}
        {etapa === 'conta' && (
          <>
            <div className="conta-header">
              <div className="conta-header-info">
                <h2>Minha Conta</h2>
                <span>{comanda} · {mesa ? `Mesa ${mesa}` : 'Mesa não definida'}</span>
              </div>
              <button className="conta-btn-fechar" onClick={onFechar}>
                <X size={20} />
              </button>
            </div>

            <div className="conta-resumo">
              <div className="conta-resumo-card">
                <ShoppingBag size={20} />
                <div>
                  <p>{historico.length}</p>
                  <span>{historico.length === 1 ? 'Pedido feito' : 'Pedidos feitos'}</span>
                </div>
              </div>
              <div className="conta-resumo-card">
                <UtensilsCrossed size={20} />
                <div>
                  <p>{totalItens}</p>
                  <span>{totalItens === 1 ? 'Item pedido' : 'Itens pedidos'}</span>
                </div>
              </div>
              <div className="conta-resumo-card destaque">
                <div>
                  <p>R$ {totalGasto.toFixed(2).replace('.', ',')}</p>
                  <span>Total gasto</span>
                </div>
              </div>
            </div>

            <div className="conta-historico">
              {historico.length === 0 ? (
                <div className="conta-vazio">
                  <p>Nenhum pedido realizado nesta comanda.</p>
                  <button className="conta-btn-pedir" onClick={() => { onFechar(); onAbrirCarrinho() }}>
                    Fazer pedido
                  </button>
                </div>
              ) : (
                [...historico].reverse().map((pedido) => (
                  <div key={pedido.id} className="conta-pedido">
                    <div className="conta-pedido-header">
                      <div className="conta-pedido-badge">Pedido #{historico.indexOf(pedido) + 1}</div>
                      <div className="conta-pedido-horario">
                        <Clock size={13} />
                        {pedido.horario}
                      </div>
                    </div>
                    <div className="conta-pedido-itens">
                      {pedido.itens.map((item) => (
                        <div key={item.id} className="conta-pedido-item">
                          <span className="conta-pedido-item-nome">
                            <span className="conta-pedido-item-qtd">x{item.quantidade}</span>
                            {item.nome}
                          </span>
                          <span className="conta-pedido-item-preco">
                            R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="conta-pedido-total">
                      <span>Total do pedido</span>
                      <strong>R$ {pedido.total.toFixed(2).replace('.', ',')}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── Etapa 3: Erro de câmera ── */}
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