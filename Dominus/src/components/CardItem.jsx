import './CardItem.css'

function CardItem({ nome, preco, descricao, imagem, onAdicionar }) {
  return (
    <div className="card-item">
      <img className="card-item-imagem" src={imagem} alt={nome} />

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
          <button className="card-item-btn" onClick={onAdicionar}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardItem