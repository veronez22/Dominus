import { useState } from 'react'
import logo from '../assets/logo.png'
import { CreditCard, BellRing, ShoppingCart, Search } from 'lucide-react'
import './Header.css'

const HASH_SENHA_GARCOM = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
const LIMITE_MESAS = 20

function Header({ totalItens, onAbrirCarrinho, onAbrirConta, busca, onBusca, mesa, onMesaMudou, onLogoClick }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [modalGarcom, setModalGarcom] = useState(false)
  const [erroGarcom, setErroGarcom] = useState(false)
  const [etapa, setEtapa] = useState('mesa')
  const [inputMesa, setInputMesa] = useState('')
  const [inputSenha, setInputSenha] = useState('')
  const [erro, setErro] = useState('')

  function mostrarErro(msg) {
    setErro(msg)
    setTimeout(() => setErro(''), 5000)
  }

  async function hashSenha(senha) {
    const encoded = new TextEncoder().encode(senha)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  function handleFechar() {
    setModalAberto(false)
    setEtapa('mesa')
    setInputMesa('')
    setInputSenha('')
    setErro('')
  }

  function handleConfirmarMesa() {
    const num = parseInt(inputMesa)
    if (!inputMesa || isNaN(num) || num <= 0) {
      mostrarErro('Digite um número de mesa válido.')
      return
    }
    if (num > LIMITE_MESAS) {
      mostrarErro(`Mesa ${num} não existe. O limite é mesa ${LIMITE_MESAS}.`)
      return
    }
    setEtapa('senha')
    setErro('')
  }

  async function handleConfirmarSenha() {
    const hash = await hashSenha(inputSenha)
    if (hash !== HASH_SENHA_GARCOM) {
      mostrarErro('Senha incorreta. Tente novamente.')
      setInputSenha('')
      return
    }
    onMesaMudou(inputMesa)
    handleFechar()
  }

  function handleChamarGarcom() {
    if (!mesa) {
      setErroGarcom(true)
      return
    }
    setModalGarcom(true)
    setTimeout(() => setModalGarcom(false), 3000)
  }

  return (
    <>
      <header className="header">
        <div className="header-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Logo" className="header-logo-img" />
        </div>

        <div className="header-busca">
          <Search size={16} className="header-busca-icone" />
          <input
            className="header-busca-input"
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
          />
          {busca && (
            <button className="header-busca-limpar" onClick={() => onBusca('')}>✕</button>
          )}
        </div>

        <div className="header-acoes">
          <button className="header-btn" onClick={() => setModalAberto(true)}>
            Mesa {mesa || ''}
          </button>
          <button className="header-btn" onClick={onAbrirConta}>
            <CreditCard size={25} />
            Minha <br/>Conta
          </button>
          <button className="header-btn" onClick={handleChamarGarcom}>
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

      {/* ── Modal de mesa ── */}
      {modalAberto && (
        <div className="mesa-overlay" onClick={handleFechar}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            {etapa === 'mesa' ? (
              <>
                <h2 className="mesa-titulo">Qual é a sua mesa?</h2>
                <p className="mesa-subtitulo">Digite o número da mesa (1 a {LIMITE_MESAS})</p>
                <input
                  className="mesa-input"
                  type="number"
                  placeholder="Ex: 5"
                  value={inputMesa}
                  onChange={(e) => setInputMesa(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmarMesa()}
                  autoFocus
                />
                {erro && <p className="mesa-erro">⚠️ {erro}</p>}
                <div className="mesa-acoes">
                  <button className="mesa-btn-cancelar" onClick={handleFechar}>Cancelar</button>
                  <button className="mesa-btn-confirmar" onClick={handleConfirmarMesa}>Continuar</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mesa-titulo">Senha do Garçom</h2>
                <p className="mesa-subtitulo">Confirme com um garçom para definir a Mesa {inputMesa}</p>
                <input
                  className="mesa-input"
                  type="password"
                  placeholder="••••"
                  value={inputSenha}
                  onChange={(e) => setInputSenha(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmarSenha()}
                  autoFocus
                />
                {erro && <p className="mesa-erro">⚠️ {erro}</p>}
                <div className="mesa-acoes">
                  <button className="mesa-btn-cancelar" onClick={() => { setEtapa('mesa'); setErro('') }}>Voltar</button>
                  <button className="mesa-btn-confirmar" onClick={handleConfirmarSenha}>Confirmar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal erro — mesa não definida ── */}
      {erroGarcom && (
        <div className="mesa-overlay" onClick={() => setErroGarcom(false)}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="mesa-titulo">Mesa não definida</h2>
            <p className="mesa-subtitulo">
              Por favor, informe o número da sua mesa antes de chamar o garçom.
            </p>
            <div className="mesa-acoes">
              <button className="mesa-btn-cancelar" onClick={() => setErroGarcom(false)}>
                Cancelar
              </button>
              <button className="mesa-btn-confirmar" onClick={() => {
                setErroGarcom(false)
                setModalAberto(true)
              }}>
                Definir mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal garçom a caminho ── */}
      {modalGarcom && (
        <div className="mesa-overlay" onClick={() => setModalGarcom(false)}>
          <div className="mesa-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <BellRing size={52} color="var(--cor-primaria)" strokeWidth={1.5} />
            </div>
            <h2 className="mesa-titulo" style={{ textAlign: 'center' }}>
              Garçom a caminho!
            </h2>
            <p className="mesa-subtitulo" style={{ textAlign: 'center' }}>
              Um garçom foi notificado e está indo até a{' '}
              <strong style={{ color: 'var(--cor-primaria)' }}>Mesa {mesa}</strong>.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Header