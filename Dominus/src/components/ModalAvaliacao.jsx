import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './ModalAvaliacao.css'

function ModalAvaliacao({ comanda, mesa, onFechar }) {
  const [nota,     setNota]     = useState(0)
  const [hover,    setHover]    = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)

  async function handleAvaliar() {
    if (nota === 0) return
    setSalvando(true)
    try {
      const { data: rest } = await supabase.from('restaurantes').select('id').single()
      await supabase.from('avaliacoes').insert({
        restaurante_id: rest.id,
        comanda,
        mesa,
        nota,
      })
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e)
    }
    setSalvando(false)
    setEnviado(true)
    setTimeout(() => onFechar(), 1500)
  }

  return (
    <div className="aval-overlay" onClick={onFechar}>
      <div className="aval-modal" onClick={e => e.stopPropagation()}>

        {enviado ? (
          <div className="aval-enviado">
            <span>⭐</span>
            Obrigado pela avaliação!
          </div>
        ) : (
          <>
            <h2 className="aval-titulo">O que achou da experiência?</h2>
            <p className="aval-sub">Sua avaliação ajuda a melhorar<br />o nosso atendimento.</p>

            <div className="aval-estrelas">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`aval-estrela${(hover || nota) >= n ? ' ativa' : ''}`}
                  onClick={() => setNota(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="aval-btns">
              <button className="aval-btn-pular" onClick={onFechar}>Agora não</button>
              <button
                className="aval-btn-avaliar"
                onClick={handleAvaliar}
                disabled={nota === 0 || salvando}
              >
                {salvando ? 'Enviando...' : 'Avaliar'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default ModalAvaliacao
