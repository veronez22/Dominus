import { categorias } from '../data/cardapio'
import './Sidebar.css'
import { UtensilsCrossed, ChefHat, GlassWater, Package, Star } from 'lucide-react'

const idiomas = [
  { codigo: 'pt', label: 'PT', bandeira: '🇧🇷' },
  { codigo: 'en', label: 'EN', bandeira: '🇺🇸' },
  { codigo: 'es', label: 'ES', bandeira: '🇪🇸' },
]

function Sidebar({ onMudar, categoriaVisivel }) {
  const icones = {
    destaques:  <Star size={22} />,
    esfihas:    <UtensilsCrossed size={22} />,
    cigarretes: <ChefHat size={22} />,
    bebidas:    <GlassWater size={22} />,
    combos:     <Package size={22} />,
  }

  return (
    <div className="sidebar-wrapper">
      <aside className="sidebar">

        {/* ── Categorias ── */}
        <div className="sidebar-categorias">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`sidebar-btn ${categoriaVisivel === cat.id ? 'ativo' : ''}`}
              onClick={() => onMudar(cat.id)}
            >
              {icones[cat.id]}
              <span className="sidebar-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ── Rodapé ── */}
        <div className="sidebar-rodape">
          <a href="#" className="sidebar-link">Sobre nós</a>
          <a href="#" className="sidebar-link">Avalie-nos</a>
          <a href="#" className="sidebar-link">Termos de uso</a>

          <div className="sidebar-idiomas">
            {idiomas.map((idioma) => (
              <button key={idioma.codigo} className="sidebar-idioma">
                <span>{idioma.bandeira}</span>
              </button>
            ))}
          </div>
        </div>

      </aside>
    </div>
  )
}

export default Sidebar