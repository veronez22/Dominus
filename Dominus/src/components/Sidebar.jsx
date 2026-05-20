import { useState } from 'react'
import { categoriasPrincipais, subcategorias } from '../data/cardapio'
import './Sidebar.css'
import { UtensilsCrossed, Package, Star, BookOpen } from 'lucide-react'

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
  const subAtivas = subcategorias.filter(s => s.grupo === 'cardapio')
  const mostrarSub = secaoAtiva === 'cardapio'

  function handlePrincipal(id) {
    onSecaoMudar(id)
    if (id === 'destaques') {
      onMudar('destaques', 'destaques')
    } else if (id === 'combos') {
      onMudar('combos', 'combos')
    } else {
      // Cardápio — vai pra primeira subcategoria
      onMudar(subAtivas[0]?.id || 'esfihas', 'cardapio')
    }
  }

  function handleSub(id) {
    onMudar(id, 'cardapio')
  }

  return (
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
          <a href="#" className="sidebar-link">Sobre nós</a>
          <a href="#" className="sidebar-link">Avalie-nos</a>
          <a href="#" className="sidebar-link">Termos de uso</a>
          <div className="sidebar-idiomas">
            {idiomas.map((i) => (
              <button key={i.codigo} className="sidebar-idioma">
                <span>{i.bandeira}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Sub-aside (só aparece em Cardápio) ── */}
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
  )
}

export default Sidebar