import './Carrinho.css'

function Carrinho({ itens, onRemover, onFechar}) {
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)

  return (
    <div className="carrinho">
      <div className="carrinho-header">
        <h2>🛒 Meu Pedido</h2>
        <button className="carrinho-btn-fechar" onClick={onFechar}>✕</button>
      </div>

      <div className="carrinho-itens">
        {itens.length === 0 ? (
          <p className="carrinho-vazio">Seu carrinho está vazio</p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className="carrinho-item">
              <div className="carrinho-item-info">
                <p>{item.nome}</p>
                <span>x{item.quantidade} · R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
              </div>
              <button className="carrinho-item-remover" onClick={() => onRemover(item.id)}>✕</button>
            </div>
          ))
        )}
      </div>

      <div className="carrinho-footer">
        <div className="carrinho-total">
          <span>Total</span>
          <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
        </div>
        <button className="carrinho-btn-confirmar">
          Confirmar Pedido 🔥
        </button>
      </div>
    </div>
  )
}

export default Carrinho