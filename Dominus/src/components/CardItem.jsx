import './CardItem.css'

function CardItem({ nome, preco, precoPromo, descricao, imagem, onAdicionar, onVerImagem, disponivel = true, badge }) {
  return (
    <div className={`card-item${!disponivel ? ' card-item--indisp' : ''}`} onClick={disponivel ? onAdicionar : undefined}>

      <div className="card-item-img-wrap" onClick={imagem && onVerImagem ? e => { e.stopPropagation(); onVerImagem() } : undefined}
        style={imagem && onVerImagem ? { cursor: 'zoom-in' } : {}}>
        <img className="card-item-img" src={imagem} alt={nome} />
        {!disponivel && <span className="card-item-indisp-tag">Indisponível</span>}
        {badge && disponivel && <span className="card-item-badge">{badge}</span>}
      </div>

      <div className="card-item-body">
        <div>
          <div className="card-item-topo">
            <h3 className="card-item-nome">{nome}</h3>
          </div>
          {descricao && <p className="card-item-desc">{descricao}</p>}
        </div>

        <div className="card-item-rodape">
          <div className="card-item-precos">
            {precoPromo
              ? <>
                  <span className="card-item-preco-original">R$ {preco.toFixed(2).replace('.', ',')}</span>
                  <span className="card-item-preco">R$ {precoPromo.toFixed(2).replace('.', ',')}</span>
                </>
              : <span className="card-item-preco">R$ {preco.toFixed(2).replace('.', ',')}</span>
            }
          </div>
          {disponivel
            ? <button className="card-item-btn" onClick={e => { e.stopPropagation(); onAdicionar() }}>+ Adicionar</button>
            : <span className="card-item-tag-indisp">Indisponível</span>
          }
        </div>
      </div>

    </div>
  )
}

export default CardItem
