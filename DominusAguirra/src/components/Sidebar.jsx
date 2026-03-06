const categorias = [
  {
    id: 'esfihas',
    label: 'Esfihas',
    subcategorias: ['Salgadas', 'Doces'],
  },
  { id: 'cigarretes', label: 'Cigarretes' },
  { id: 'bebidas',    label: 'Bebidas' },
  { id: 'combos',     label: 'Combos' },
  { id: 'destaques',  label: 'Destaques' },
]

function Sidebar({ categoriaAtiva, onMudar, subcategoriaAtiva, onMudarSub }) {
  return (
    <div style={{ display: 'flex' }}>

      {/* Coluna principal */}
      <aside>
        {categorias.map((cat) => (
          <button key={cat.id} onClick={() => onMudar(cat.id)}>
            {cat.label}
          </button>
        ))}
      </aside>

      {/* Coluna de subcategorias — só aparece se a categoria ativa tiver subcategorias */}
      {categorias.find((cat) => cat.id === categoriaAtiva)?.subcategorias && (
        <aside>
          {categorias
            .find((cat) => cat.id === categoriaAtiva)
            .subcategorias.map((sub) => (
              <button key={sub} onClick={() => onMudarSub(sub)}>
                {sub}
              </button>
            ))}
        </aside>
      )}

    </div>
  )
}

export default Sidebar