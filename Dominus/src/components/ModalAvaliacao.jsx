import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Star, Utensils, CupSoda, Armchair, Smile, Music } from 'lucide-react'
import './ModalAvaliacao.css'

// Categorias avaliadas por estrelas (segue o modelo do print de referência).
// `campo` = coluna correspondente na tabela `avaliacoes`.
const CATEGORIAS = [
  { id: 'comida',      label: 'Comida',      Icone: Utensils, campo: 'nota_comida' },
  { id: 'bebida',      label: 'Bebida',      Icone: CupSoda,  campo: 'nota_bebida' },
  { id: 'ambiente',    label: 'Ambiente',    Icone: Armchair, campo: 'nota_ambiente' },
  { id: 'atendimento', label: 'Atendimento', Icone: Smile,    campo: 'nota_atendimento' },
  { id: 'musica',      label: 'Música',      Icone: Music,    campo: 'nota_musica' },
]

function ModalAvaliacao({ comanda, mesa, onFechar }) {
  const [notas,    setNotas]    = useState({})   // { [categoriaId]: 1-5 }
  const [hover,    setHover]    = useState({})   // { [categoriaId]: 1-5 }
  const [nome,         setNome]         = useState('')
  const [comandaInput, setComandaInput] = useState(comanda ?? '')
  const [email,        setEmail]        = useState('')
  const [sugestao,     setSugestao]     = useState('')
  const [salvando, setSalvando] = useState(false)
  const [enviado,  setEnviado]  = useState(false)

  const algumaNota = CATEGORIAS.some(c => notas[c.id] > 0)

  function definirNota(catId, n) {
    setNotas(prev => ({ ...prev, [catId]: prev[catId] === n ? 0 : n }))
  }

  async function handleEnviar() {
    if (!algumaNota) return
    setSalvando(true)
    try {
      const { data: rest } = await supabase.from('restaurantes').select('id').single()

      const dadas  = CATEGORIAS.filter(c => notas[c.id]).map(c => notas[c.id])
      const media  = Math.round(dadas.reduce((s, v) => s + v, 0) / dadas.length)

      const payload = {
        restaurante_id: rest.id,
        mesa:       mesa ?? null,
        comanda:    comandaInput.trim() || null,
        nome:       nome.trim()  || null,
        email:      email.trim() || null,
        comentario: sugestao.trim() || null,
        nota:       media,
      }
      CATEGORIAS.forEach(c => { payload[c.campo] = notas[c.id] || null })

      const { error } = await supabase.from('avaliacoes').insert(payload)
      if (error) throw error
    } catch (e) {
      console.error('Erro ao salvar avaliação:', e)
    }
    setSalvando(false)
    setEnviado(true)
    setTimeout(() => onFechar(), 1800)
  }

  return (
    <div className="aval-overlay" onClick={onFechar}>
      <div className={`aval-modal${enviado ? ' aval-modal--enviado' : ''}`} onClick={e => e.stopPropagation()}>

        {enviado ? (
          <div className="aval-enviado">
            <span>⭐</span>
            Obrigado pela sua avaliação!
          </div>
        ) : (
          <>
            <button className="aval-fechar" onClick={onFechar}><X size={18} /></button>

            <div className="aval-header">
              <h2 className="aval-titulo">Avalie sua experiência</h2>
              <p className="aval-sub">Conte como foi cada parte da sua visita{mesa ? ` à Mesa ${mesa}` : ''}.</p>
            </div>

            <div className="aval-corpo">
              {/* ── Categorias (estrelas) ── */}
              <div className="aval-categorias">
                {CATEGORIAS.map(cat => {
                  const atual = hover[cat.id] || notas[cat.id] || 0
                  return (
                    <div key={cat.id} className="aval-cat">
                      <div className="aval-cat-info">
                        <span className="aval-cat-icone"><cat.Icone size={20} strokeWidth={1.8} /></span>
                        <span className="aval-cat-label">{cat.label}</span>
                      </div>
                      <div className="aval-cat-estrelas">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            className={`aval-estrela${atual >= n ? ' ativa' : ''}`}
                            onClick={() => definirNota(cat.id, n)}
                            onMouseEnter={() => setHover(h => ({ ...h, [cat.id]: n }))}
                            onMouseLeave={() => setHover(h => ({ ...h, [cat.id]: 0 }))}
                          >
                            <Star size={26} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Formulário ── */}
              <div className="aval-form">
                <div className="aval-campo">
                  <label>Nome <span className="aval-opcional">(opcional)</span></label>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="aval-campo">
                  <label>Número da comanda <span className="aval-opcional">(opcional)</span></label>
                  <input value={comandaInput} onChange={e => setComandaInput(e.target.value)} placeholder="Ex: 042" />
                </div>
                <div className="aval-campo">
                  <label>E-mail <span className="aval-opcional">(opcional)</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" />
                </div>
                <div className="aval-campo aval-campo--cresce">
                  <label>Sugestão ou elogio <span className="aval-opcional">(opcional)</span></label>
                  <textarea
                    value={sugestao}
                    onChange={e => setSugestao(e.target.value)}
                    placeholder="Deixe uma sugestão ou elogie o atendimento..."
                  />
                </div>
              </div>
            </div>

            <div className="aval-footer">
              <button className="aval-btn-pular" onClick={onFechar}>Agora não</button>
              <button
                className="aval-btn-avaliar"
                onClick={handleEnviar}
                disabled={!algumaNota || salvando}
              >
                {salvando ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default ModalAvaliacao
