import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle, Camera } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import './ModalComanda.css'

function ModalComanda({ onFechar, onComandaLida }) {
  const [etapa, setEtapa] = useState('lendo')
  const [comanda, setComanda] = useState(null)
  const [erroMsg, setErroMsg] = useState('')
  const scannerRef = useRef(null)
  const rodandoRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-video-container')
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
          setEtapa('sucesso')
          setTimeout(() => {
            onComandaLida(texto)
            onFechar()
          }, 2500)
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
  }, [])

  return (
    <div className="comanda-overlay" onClick={onFechar}>
      <div className="comanda-modal" onClick={(e) => e.stopPropagation()}>

        <button className="comanda-fechar" onClick={onFechar}>
          <X size={18} />
        </button>

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

        {etapa === 'sucesso' && (
          <div className="comanda-sucesso">
            <CheckCircle size={72} strokeWidth={1.5} color="var(--cor-primaria)" />
            <h2>Pedido Confirmado!</h2>
            <p>Comanda <strong>{comanda}</strong> vinculada com sucesso.</p>
          </div>
        )}

        {etapa === 'erro' && (
          <div className="comanda-sucesso">
            <X size={72} strokeWidth={1.5} color="#f55" />
            <h2 style={{ color: '#f55' }}>Câmera indisponível</h2>
            <p>Não foi possível acessar a câmera. Verifique as permissões do navegador.</p>
            <button className="comanda-btn-retry" onClick={onFechar}>Fechar</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default ModalComanda