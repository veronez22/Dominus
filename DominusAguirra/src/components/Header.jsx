import './Header.css'

function Header({ mesa, totalItens, onAbrirCarrinho }) {
  return (
    <header className="header">
      <div className="header-logo">
        <span>🫓</span>
        <h1>Dominus <span>Aguirra</span></h1>
      </div>

      <div className="header-acoes">
        <button className="header-btn">⬜ Mesa {mesa}</button>
        <button className="header-btn">💳 Wallet</button>
        <button className="header-btn">🔔 Chamar Garçom</button>
        <button className="header-btn-carrinho" onClick={onAbrirCarrinho}>
          🛒 Meu Pedido
          {totalItens > 0 && (
            <span className="header-badge">{totalItens}</span>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header