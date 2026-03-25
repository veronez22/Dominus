import { categorias } from '../data/cardapio'
import './Sidebar.css'
import { UtensilsCrossed, ChefHat, GlassWater, Package, Star } from 'lucide-react'

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
      </aside>
    </div>
  )
}

export default Sidebar