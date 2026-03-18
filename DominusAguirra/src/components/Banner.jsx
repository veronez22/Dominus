import './Banner.css'

function Banner({ categoria }) {
  return (
    <div className="banner">
      <img src={categoria.banner} alt={categoria.label} className="banner-img" />
      <div className="banner-overlay">
        <h2 className="banner-titulo">{categoria.label}</h2>
        <p className='banner-descricao'>{categoria.descricao}</p>
      </div>
    </div>
  )
}

export default Banner