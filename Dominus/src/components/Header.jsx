import { useState } from 'react'
import logo from '../assets/logo.png'
import { CreditCard, BellRing, ShoppingCart, Search, CupSoda, GlassWater, Utensils, Soup } from 'lucide-react'
import './Header.css'

const HASH_SENHA_GARCOM = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
const LIMITE_MESAS = 20

// Itens que o cliente pode solicitar ao chamar o garçom (com contador)
const ITENS_GARCOM = [
  { id: 'copo',      Icone: CupSoda,    label: 'Copo extra' },
  { id: 'copo-gelo', Icone: GlassWater, label: 'Copo com gelo' },
  { id: 'talheres',  Icone: Utensils,   label: 'Talheres' },
  { id: 'prato',     Icone: Soup,       label: 'Prato extra' },
]

function Header({ totalItens, onAbrirCarrinho, onAbrirConta, busca, onBusca, mesa, onMesaMudou, onLogoClick }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [modalGarcom, setModalGarcom] = useState(false)
  const [modalSelecao, setModalSelecao] = useState(false)
  const [itensGarcom, setItensGarcom] = useState({})       // { [id]: quantidade }
  const [itensSolicitados, setItensSolicitados] = useState([]) // snapshot p/ tela "a caminho"
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
    const resultado = await onMesaMudou(inputMesa)
    if (!resultado?.ok) {
      mostrarErro(resultado?.erro || 'Não foi possível definir a mesa.')
      setInputSenha('')
      return
    }
    handleFechar()
  }

  function handleChamarGarcom() {
    if (!mesa) {
      setErroGarcom(true)
      return
    }
    setItensGarcom({})
    setModalSelecao(true)
  }

  function incItemGarcom(id) {
    setItensGarcom(p => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
  }

  function decItemGarcom(id) {
    setItensGarcom(p => {
      const qty = (p[id] ?? 0) - 1
      const c = { ...p }
      if (qty <= 0) delete c[id]
      else c[id] = qty
      return c
    })
  }

  function confirmarChamado() {
    const solicitados = ITENS_GARCOM
      .filter(i => itensGarcom[i.id])
      .map(i => ({ ...i, qty: itensGarcom[i.id] }))
    setItensSolicitados(solicitados)
    setModalSelecao(false)
    setModalGarcom(true)
    setTimeout(() => setModalGarcom(false), 4000)
  }

  const totalItensGarcom = Object.values(itensGarcom).reduce((s, v) => s + v, 0)

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

      {/* ── Modal seleção de itens do garçom ── */}
      {modalSelecao && (
        <div className="mesa-overlay" onClick={() => setModalSelecao(false)}>
          <div className="mesa-modal garcom-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="garcom-titulo">Chamar Garçom</h2>
            <p className="garcom-sub">
              Mesa <strong style={{ color: 'var(--cor-primaria)' }}>{mesa}</strong> · selecione o que precisa (opcional)
            </p>

            <div className="garcom-lista">
              <div className="garcom-lista-cab">
                <span>Item</span>
                <span>Qtd</span>
              </div>
              {ITENS_GARCOM.map(item => {
                const qty = itensGarcom[item.id] ?? 0
                return (
                  <div key={item.id} className={`garcom-item ${qty > 0 ? 'garcom-item--ativo' : ''}`}>
                    <span className="garcom-item-icone"><item.Icone size={28} strokeWidth={1.8} /></span>
                    <span className="garcom-item-label">{item.label}</span>
                    <div className="garcom-item-contador">
                      <button className="garcom-cont-btn" onClick={() => decItemGarcom(item.id)} disabled={qty === 0}>−</button>
                      <span className="garcom-cont-num">{qty}</span>
                      <button className="garcom-cont-btn" onClick={() => incItemGarcom(item.id)}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mesa-acoes">
              <button className="mesa-btn-cancelar" onClick={() => setModalSelecao(false)}>Cancelar</button>
              <button className="mesa-btn-confirmar garcom-btn-chamar" onClick={confirmarChamado}>
                <BellRing size={20} />
                {totalItensGarcom > 0 ? `Chamar agora (${totalItensGarcom})` : 'Chamar agora'}
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

            {itensSolicitados.length > 0 && (
              <div className="garcom-resumo">
                <p className="garcom-resumo-titulo">Você solicitou:</p>
                {itensSolicitados.map(i => (
                  <div key={i.id} className="garcom-resumo-linha">
                    <span className="garcom-resumo-item"><i.Icone size={17} strokeWidth={1.8} /> {i.label}</span>
                    <strong>{i.qty}x</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Header