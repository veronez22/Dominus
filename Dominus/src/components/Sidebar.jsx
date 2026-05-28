import { useState } from 'react'
import { categoriasPrincipais, subcategorias } from '../data/cardapio'
import './Sidebar.css'
import { UtensilsCrossed, Package, Star, BookOpen } from 'lucide-react'
import Modalavaliacao from './Modalavaliacao'
import Modaltermos from './Modaltermos'

const idiomas = [
  { codigo: 'pt', bandeira: '🇧🇷' },
  { codigo: 'en', bandeira: '🇺🇸' },
  { codigo: 'es', bandeira: '🇪🇸' },
]

const iconesPrincipais = {
  destaques: <Star size={22} />,
  cardapio:  <BookOpen size={22} />,
  combos:    <Package size={22} />,
}

function Sidebar({ onMudar, categoriaVisivel, secaoAtiva, onSecaoMudar }) {
  const [modalAvaliacao, setModalAvaliacao] = useState(false)
  const [modalTermos, setModalTermos] = useState(false)

  const subAtivas = subcategorias.filter(s => s.grupo === 'cardapio')
  const mostrarSub = secaoAtiva === 'cardapio'

  function handlePrincipal(id) {
    onSecaoMudar(id)
    if (id === 'destaques') {
      onMudar('destaques', 'destaques')
    } else if (id === 'combos') {
      onMudar('combos', 'combos')
    } else {
      onMudar(subAtivas[0]?.id || 'esfihas', 'cardapio')
    }
  }

  function handleSub(id) {
    onMudar(id, 'cardapio')
  }

  return (
    <>
      <div className="sidebar-wrapper">

        {/* ── Aside principal ── */}
        <aside className="sidebar">
          <div className="sidebar-categorias">
            {categoriasPrincipais.map((cat) => (
              <button
                key={cat.id}
                className={`sidebar-btn ${secaoAtiva === cat.id ? 'ativo' : ''}`}
                onClick={() => handlePrincipal(cat.id)}
              >
                {iconesPrincipais[cat.id]}
                <span className="sidebar-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-rodape">
            <button
              className="sidebar-link"
              onClick={() => setModalAvaliacao(true)}
            >
              Avalie-nos
            </button>
            <button
              className="sidebar-link"
              onClick={() => setModalTermos(true)}
            >
              Termos de uso
            </button>
            <div className="sidebar-idiomas">
              {idiomas.map((i) => (
                <button key={i.codigo} className="sidebar-idioma">
                  <span>{i.bandeira}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Sub-aside ── */}
        {mostrarSub && (
          <aside className="sidebar-sub">
            {subAtivas.map((sub) => (
              <button
                key={sub.id}
                className={`sidebar-sub-btn ${categoriaVisivel === sub.id ? 'ativo' : ''}`}
                onClick={() => handleSub(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </aside>
        )}

      </div>

      {modalAvaliacao && (
        <ModalAvaliacao onFechar={() => setModalAvaliacao(false)} />
      )}

      {modalTermos && (
        <ModalTermos onFechar={() => setModalTermos(false)} />
      )}
    </>
  )
}

export default Sidebar