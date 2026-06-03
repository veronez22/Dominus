import './CardItem.css'

function CardItem({ nome, preco, descricao, imagem, onAdicionar, disponivel = true }) {
  return (
    <div className={`card-item${!disponivel ? ' indisponivel' : ''}`}>
      <div className="card-item-imagem-wrap">
        <img className="card-item-imagem" src={imagem} alt={nome} />
        {!disponivel && <div className="card-item-indisponivel-overlay">Indisponível</div>}
      </div>

      <div className="card-item-info">
        <div className="card-item-topo">
          <div className="card-item-texto">
            <h3>{nome}</h3>
            <p>{descricao}</p>
          </div>
          <span className="card-item-preco">
            R$ {preco.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="card-item-rodape">
          {disponivel ? (
            <button className="card-item-btn" onClick={onAdicionar}>
              Adicionar
            </button>
          ) : (
            <span className="card-item-tag-indisp">⚠️ Indisponível no momento</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardItem