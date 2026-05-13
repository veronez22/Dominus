import './Destaques.css'

const itensDestaque = [
  {
    id: 2,
    nome: 'Carne c/ Catupiry',
    preco: 5.75,
    descricao: 'Carne moída com catupiry cremoso.',
    imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600',
    badge: 'Mais Pedido',
  },
  {
    id: 4,
    nome: 'Frango c/ Requeijão',
    preco: 5.50,
    descricao: 'Frango desfiado com requeijão cremoso.',
    imagem: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600',
    badge: 'Favorito',
  },
  {
    id: 7,
    nome: 'Cigarrete de Carne',
    preco: 6.50,
    descricao: 'Massa crocante recheada com carne temperada.',
    imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600',
    badge: 'Novo',
  },
  {
    id: 11,
    nome: 'Limonada Suíça',
    preco: 9.00,
    descricao: 'Limonada cremosa com limão siciliano.',
    imagem: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600',
    badge: 'Novo',
  },
  {
    id: 12,
    nome: 'Combo Família',
    preco: 49.90,
    descricao: '10 esfihas à escolha + 2 refrigerantes.',
    imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600',
    badge: 'Oferta',
  },
]

const bannerItem = itensDestaque[0]

function Destaques({ onAdicionar }) {
  return (
    <div className="destaques">

      {/* ── Banner principal ── */}
      <div
        className="destaques-banner"
        style={{ backgroundImage: `url(${bannerItem.imagem})` }}
      >
        <div className="destaques-banner-overlay" />
        <div className="destaques-banner-conteudo">
          <span className="destaques-banner-badge">{bannerItem.badge}</span>
          <h1 className="destaques-banner-titulo">{bannerItem.nome}</h1>
          <p className="destaques-banner-descricao">{bannerItem.descricao}</p>
          <button
            className="destaques-banner-btn"
            onClick={() => onAdicionar(bannerItem)}
          >
            Adicionar · R$ {bannerItem.preco.toFixed(2).replace('.', ',')}
          </button>
        </div>
      </div>

      {/* ── Seção de recomendados ── */}
      <div className="destaques-secao">
        <h2 className="destaques-secao-titulo">⭐ Destaques</h2>
        <div className="destaques-cards">
          {itensDestaque.map((item) => (
            <div key={item.id} className="destaques-card">
              <div className="destaques-card-imagem-wrapper">
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="destaques-card-imagem"
                />
                <span className="destaques-card-badge">{item.badge}</span>
              </div>
              <div className="destaques-card-info">
                <p className="destaques-card-nome">{item.nome}</p>
                <span className="destaques-card-preco">
                  R$ {item.preco.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                className="destaques-card-btn"
                onClick={() => onAdicionar(item)}
              >
                + Adicionar
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Destaques
