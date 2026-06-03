import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './ModalAvaliacao.css'

const perguntas = [
  { id: 'comida', label: 'Como foi a comida?' },
  { id: 'atendimento', label: 'E o atendimento?' },
  { id: 'ambiente', label: 'O ambiente te agradou?' },
]

function ModalAvaliacao({ onFechar, mesa }) {
  const [estrelas, setEstrelas] = useState({ comida: 0, atendimento: 0, ambiente: 0 })
  const [hover, setHover] = useState({ comida: 0, atendimento: 0, ambiente: 0 })
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleEnviar() {
    const todasAvaliadas = Object.values(estrelas).every(v => v > 0)
    if (!todasAvaliadas) return

    const media = Math.round((estrelas.comida + estrelas.atendimento + estrelas.ambiente) / 3)

    const { data: rest } = await supabase
      .from('restaurantes').select('id').eq('slug', 'dominus').single()

    if (rest) {
      await supabase.from('avaliacoes').insert({
        restaurante_id:   rest.id,
        nota:             media,
        nota_comida:      estrelas.comida,
        nota_atendimento: estrelas.atendimento,
        nota_ambiente:    estrelas.ambiente,
        comentario:       comentario || null,
        mesa:             mesa || null,
      })
    }

    setEnviado(true)
    setTimeout(() => onFechar(), 2500)
  }

  return (
    <div className="modal-overlay aval-overlay" onClick={onFechar}>
      <div className="aval-modal" onClick={(e) => e.stopPropagation()}>

        <button className="aval-fechar" onClick={onFechar}>
          <X size={18} />
        </button>

        {enviado ? (
          <div className="aval-sucesso">
            <span className="aval-sucesso-icone">🙏</span>
            <h2>Obrigado pelo feedback!</h2>
            <p>Sua avaliação nos ajuda a melhorar cada vez mais.</p>
          </div>
        ) : (
          <>
            <div className="aval-topo">
              <h2 className="aval-titulo">O que achou da sua experiência?</h2>
              <p className="aval-subtitulo">Sua opinião é muito importante pra gente</p>
            </div>

            <div className="aval-perguntas">
              {perguntas.map((p) => (
                <div key={p.id} className="aval-pergunta">
                  <span className="aval-pergunta-label">{p.label}</span>
                  <div className="aval-estrelas">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className="aval-estrela-btn"
                        onMouseEnter={() => setHover(h => ({ ...h, [p.id]: n }))}
                        onMouseLeave={() => setHover(h => ({ ...h, [p.id]: 0 }))}
                        onClick={() => setEstrelas(e => ({ ...e, [p.id]: n }))}
                      >
                        <Star
                          size={28}
                          className={`aval-estrela ${n <= (hover[p.id] || estrelas[p.id]) ? 'ativa' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="aval-comentario">
              <p className="aval-comentario-label">Quer deixar um comentário? (opcional)</p>
              <textarea
                className="aval-textarea"
                placeholder="Conte como foi sua visita..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <button
              className={`aval-btn-enviar ${Object.values(estrelas).every(v => v > 0) ? 'ativo' : ''}`}
              onClick={handleEnviar}
            >
              Enviar avaliação
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default ModalAvaliacao