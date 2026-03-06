function Carrinho({ itens, onRemover }) {
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  return (
    <div>
      <h2>Meu Pedido</h2>

      {itens.length === 0 ? (
        <p>Seu carrinho está vazio</p>
      ) : (
        itens.map((item) => (
          <div key={item.id}>
            <span>{item.nome}</span>
            <span> x{item.quantidade}</span>
            <span> R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
            <button onClick={() => onRemover(item.id)}>Remover</button>
          </div>
        ))
      )}

      <strong>Total: R$ {total.toFixed(2).replace('.', ',')}</strong>
    </div>
  )
}

export default Carrinho