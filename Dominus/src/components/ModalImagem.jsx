import { X } from 'lucide-react'
import './ModalImagem.css'

function ModalImagem({ produto, onFechar }) {
  return (
    <div className="mi-overlay" onClick={onFechar}>
      <div className="mi-sheet" onClick={e => e.stopPropagation()}>
        <button className="mi-fechar" onClick={onFechar}><X size={16} /></button>
        <div className="mi-imagem-wrap">
          {produto.imagem
            ? <img src={produto.imagem} alt={produto.nome} className="mi-imagem" />
            : <div className="mi-placeholder">🫓</div>
          }
        </div>
        <div className="mi-info">
          <p className="mi-categoria">{produto.categoria}</p>
          <h2 className="mi-nome">{produto.nome}</h2>
          {produto.descricao && <p className="mi-desc">{produto.descricao}</p>}
          {(produto.precoPromo ?? produto.preco) && (
            <div className="mi-precos">
              {produto.precoPromo && (
                <span className="mi-preco-original">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
              )}
              <span className="mi-preco">R$ {(produto.precoPromo ?? produto.preco).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalImagem
