import './PopupSugestao.css'
import { Plus, X } from 'lucide-react'

// Popup de sugestão (cross-sell de esfiha doce/salgada ao abrir o carrinho).
function PopupSugestao({ produto, titulo, subtitulo, textoSim = 'Sim, quero!', onSim, onNao }) {
  const preco = produto.precoPromo ?? produto.preco

  return (
    <div className="ps-overlay" onClick={onNao}>
      <div className="ps-card" onClick={e => e.stopPropagation()}>
        <button className="ps-fechar" onClick={onNao}><X size={20} /></button>

        <div className="ps-img-grande">
          {produto.imagem && <img src={produto.imagem} alt={produto.nome} />}
        </div>

        <div className="ps-corpo">
          <div className="ps-titulo">
            <h3>{titulo}</h3>
            <p>{subtitulo}</p>
          </div>

          <div className="ps-produto">
            <span className="ps-produto-nome">{produto.nome}</span>
            <span className="ps-produto-preco">R$ {preco.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="ps-acoes">
            <button className="ps-btn ps-btn--nao" onClick={onNao}>
              Agora não
            </button>
            <button className="ps-btn ps-btn--sim" onClick={onSim}>
              <Plus size={20} /> {textoSim}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopupSugestao
