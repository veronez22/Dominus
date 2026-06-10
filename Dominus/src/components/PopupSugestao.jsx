import './PopupSugestao.css'
import { Plus, X } from 'lucide-react'

// Popup pós-adição: sugere uma bebida quando o pedido ainda não tem nenhuma.
// "Sim" abre o ModalProduto da bebida direto no passo Quantidade.
function PopupSugestao({ bebida, onSim, onNao }) {
  const preco = bebida.precoPromo ?? bebida.preco

  return (
    <div className="ps-overlay" onClick={onNao}>
      <div className="ps-card" onClick={e => e.stopPropagation()}>
        <button className="ps-fechar" onClick={onNao}><X size={16} /></button>

        <div className="ps-titulo">
          <span className="ps-emoji">🥤</span>
          <h3>Que tal uma bebida gelada?</h3>
          <p>Seu pedido ainda está sem bebida.</p>
        </div>

        <div className="ps-bebida">
          <div className="ps-bebida-img">
            {bebida.imagem
              ? <img src={bebida.imagem} alt={bebida.nome} />
              : <span>🥤</span>}
          </div>
          <div className="ps-bebida-info">
            <span className="ps-bebida-nome">{bebida.nome}</span>
            <span className="ps-bebida-preco">R$ {preco.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div className="ps-acoes">
          <button className="ps-btn ps-btn--nao" onClick={onNao}>
            Agora não
          </button>
          <button className="ps-btn ps-btn--sim" onClick={onSim}>
            <Plus size={18} /> Sim, quero!
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopupSugestao
