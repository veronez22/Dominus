import { categorias } from '../data/cardapio'
import './Sidebar.css'

function Sidebar({ categoriaAtiva, onMudar, subcategoriaAtiva, onMudarSub }) {
  const categoriaAtualObj = categorias.find((cat) => cat.id === categoriaAtiva)

  return (
    <div className="sidebar-wrapper">

      {/* Coluna principal */}
      <aside className="sidebar">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`sidebar-btn ${categoriaAtiva === cat.id ? 'ativo' : ''}`}
            onClick={() => onMudar(cat.id)}
          >
            <span className="sidebar-icon">{cat.icon}</span>
            <span className="sidebar-label">{cat.label}</span>
          </button>
        ))}
      </aside>

      {/* Coluna de subcategorias */}
      {categoriaAtualObj?.subcategorias && (
        <aside className="sidebar-sub">
          {categoriaAtualObj.subcategorias.map((sub) => (
            <button
              key={sub}
              className={`sidebar-sub-btn ${subcategoriaAtiva === sub ? 'ativo' : ''}`}
              onClick={() => onMudarSub(sub)}
            >
              {sub}
            </button>
          ))}
        </aside>
      )}

    </div>
  )
}

export default Sidebar