import logo from '../assets/logo.png'
import { UtensilsCrossed, CreditCard, BellRing, ShoppingCart, Search } from 'lucide-react'
import './Header.css'

function Header({ mesa, totalItens, onAbrirCarrinho }) {
  return (
    <header className="header">
      {/* Logo */}
       <div className="header-logo">
        <img src={logo} alt="Sua logo" className="header-logo-img" />
      </div>

      {/* Ações */}
      <div className="header-acoes">
        <button className="header-btn">
          Mesa {mesa}
        </button>
        <button className="header-btn">
          <CreditCard size={25} />
          Minha <br/>Conta
        </button>
        <button className="header-btn">
          <BellRing size={25} />
          Chamar <br/> Garçom
        </button>
        <button className="header-btn-carrinho" onClick={onAbrirCarrinho}>
          <ShoppingCart size={25} />
          Meu <br/> Carrinho
          {totalItens > 0 && (
            <span className="header-badge">{totalItens}</span>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header