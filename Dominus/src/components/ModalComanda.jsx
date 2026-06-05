import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import './ModalComanda.css'

function ModalComanda({ onFechar, onComandaLida }) {
  const [etapa,   setEtapa]   = useState('lendo') // 'lendo' | 'sucesso' | 'erro'
  const [comanda, setComanda] = useState(null)
  const [erroMsg, setErroMsg] = useState('')
  const scannerRef = useRef(null)
  const ativoRef   = useRef(false)

  useEffect(() => {
    let scanner
    try {
      scanner = new Html5Qrcode('qr-video-container')
      scannerRef.current = scanner
    } catch {
      setEtapa('erro')
      return
    }

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (texto) => {
        if (!ativoRef.current) return
        if (/^CMD-\d{4}$/.test(texto)) {
          pararScanner()
          setComanda(texto)
          setEtapa('sucesso')
          onComandaLida(texto)
          setTimeout(() => onFechar(), 2000)
        } else {
          setErroMsg('QR Code inválido. Use a comanda do estabelecimento.')
          setTimeout(() => setErroMsg(''), 2500)
        }
      },
      () => {}
    ).then(() => {
      ativoRef.current = true
    }).catch(() => {
      setEtapa('erro')
    })

    return () => {
      ativoRef.current = false
      try { scanner?.stop().catch(() => {}) } catch {}
    }
  }, [])

  function pararScanner() {
    ativoRef.current = false
    try { scannerRef.current?.stop().catch(() => {}) } catch {}
  }

  return (
    <div className="comanda-overlay" onClick={onFechar}>
      <div className="comanda-modal" onClick={(e) => e.stopPropagation()}>

        <button className="comanda-fechar" onClick={onFechar}>
          <X size={18} />
        </button>

        {/* ── Câmera ── */}
        {etapa === 'lendo' && (
          <>
            <div className="comanda-topo">
              <Camera size={22} color="var(--cor-primaria)" />
              <h2 className="comanda-titulo">Leia sua comanda</h2>
              <p className="comanda-subtitulo">Aponte o QR Code da comanda para a câmera</p>
            </div>

            <div className="comanda-camera-wrapper">
              <div id="qr-video-container" className="comanda-camera-inner" />
              <div className="comanda-frame">
                <span className="frame-tl" />
                <span className="frame-tr" />
                <span className="frame-bl" />
                <span className="frame-br" />
              </div>
              <div className="comanda-scanline" />
            </div>

            {erroMsg && <p className="comanda-erro">{erroMsg}</p>}
          </>
        )}

        {/* ── Sucesso ── */}
        {etapa === 'sucesso' && (
          <div className="comanda-sucesso">
            <CheckCircle size={72} strokeWidth={1.5} color="var(--cor-primaria)" />
            <h2>Pedido Registrado!</h2>
            <p>Comanda <strong>{comanda}</strong> vinculada com sucesso.</p>
          </div>
        )}

        {/* ── Câmera indisponível ── */}
        {etapa === 'erro' && (
          <div className="comanda-sucesso">
            <X size={72} strokeWidth={1.5} color="#f55" />
            <h2 style={{ color: '#f55' }}>Câmera indisponível</h2>
            <p>Não foi possível acessar a câmera.<br/>Chame um garçom para ajudar.</p>
            <button className="comanda-btn-confirmar" onClick={onFechar}>Fechar</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ModalComanda
