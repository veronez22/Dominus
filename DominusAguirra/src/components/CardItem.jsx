function CardItem({ nome, preco, descricao, imagem, onAdicionar }) {
  return (
    <div>
      <img src={imagem} alt={nome} width="100" />
      <h3>{nome}</h3>
      <p>{descricao}</p>
      <strong>R$ {preco.toFixed(2).replace('.', ',')}</strong>
      <button onClick={onAdicionar}>+ Adicionar</button>
    </div>
  )
}

export default CardItem