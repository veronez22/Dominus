import { X, Check, MapPin, Clock, Phone, Instagram, CreditCard } from 'lucide-react'
import './ModalSobre.css'

// Destaques do estabelecimento (fatos do cardápio + atendimento)
const DESTAQUES = [
  'Esfihas salgadas e doces, sempre fresquinhas',
  'Fogazzas, cigarretes, coxinhas e kibes',
  'Combos para compartilhar e bebidas geladas',
  'Feito na hora, com massa artesanal',
  'Atendimento de mesa rápido e na palma da mão',
]

// Informações práticas (fonte: cadastro oficial do estabelecimento)
const INFOS = [
  { Icone: MapPin,     label: 'Endereço',  valor: 'Av. Gregório Benedetti, 101 — Jardim Campestre, Dobrada/SP' },
  { Icone: Clock,      label: 'Horário',   valor: 'Quarta a domingo, das 18h30 às 23h' },
  { Icone: Phone,      label: 'WhatsApp',  valor: '(16) 9 9372-2231' },
  { Icone: Instagram,  label: 'Instagram', valor: '@aguirraesfiharia' },
  { Icone: CreditCard, label: 'Pagamento', valor: 'PIX, cartão (débito/crédito) e dinheiro' },
]

function ModalSobre({ onFechar }) {
  return (
    <div className="modal-overlay sobre-overlay" onClick={onFechar}>
      <div className="sobre-modal" onClick={(e) => e.stopPropagation()}>

        <button className="sobre-fechar" onClick={onFechar}><X size={18} /></button>

        <div className="sobre-corpo">
          {/* ── Coluna esquerda: apresentação ── */}
          <div className="sobre-texto">
            <span className="sobre-tag">Sobre nós</span>
            <h2 className="sobre-titulo">Aguirra Esfiharia</h2>
            <p className="sobre-descricao">
              A casa da esfiha em Dobrada, no interior de São Paulo. Massa artesanal feita
              com carinho, recheios generosos e um cardápio que vai do salgado ao doce —
              perfeito para todos os gostos. Aqui o pedido é fácil, rápido e do seu jeito.
            </p>

            <h3 className="sobre-subtitulo">Por que pedir no Aguirra?</h3>
            <ul className="sobre-lista">
              {DESTAQUES.map((d, i) => (
                <li key={i} className="sobre-item">
                  <span className="sobre-item-check"><Check size={14} strokeWidth={3} /></span>
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Coluna direita: informações práticas ── */}
          <aside className="sobre-info">
            <h3 className="sobre-info-titulo">Onde nos encontrar</h3>
            {INFOS.map((info) => (
              <div key={info.label} className="sobre-info-linha">
                <span className="sobre-info-icone"><info.Icone size={18} strokeWidth={1.9} /></span>
                <div className="sobre-info-texto">
                  <span className="sobre-info-label">{info.label}</span>
                  <span className="sobre-info-valor">{info.valor}</span>
                </div>
              </div>
            ))}
          </aside>
        </div>

        <button className="sobre-btn-fechar" onClick={onFechar}>Voltar ao cardápio</button>

      </div>
    </div>
  )
}

export default ModalSobre
