import './ModalProduto.css'
import { X, Minus, Plus } from 'lucide-react'
import { useState } from 'react'

function ModalProduto({ produto, onFechar, onAdicionar }) {
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')

  // opções extras dependendo da categoria
  const [gelo, setGelo] = useState(false)
  const [limao, setLimao] = useState(false)

  function handleAdicionar() {
    onAdicionar({
      ...produto,
      quantidade,
      extras: { gelo, limao, observacao }
    })
    onFechar()
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Botão fechar */}
        <button className="modal-fechar" onClick={onFechar}>
          <X size={20} />
        </button>

        {/* Imagem */}
        <img src={produto.imagem} alt={produto.nome} className="modal-imagem" />

        {/* Conteúdo */}
        <div className="modal-conteudo">
          <h2 className="modal-nome">{produto.nome}</h2>
          <p className="modal-descricao">{produto.descricao}</p>
          <span className="modal-preco">
             R$ {produto.preco.toFixed(2).replace('.', ',')}
          </span>

          <div className="modal-divisor" />

          {/* Opções extras — só pra bebidas */}
          {produto.categoria === 'bebidas' && (
            <div className="modal-opcoes">
              <p className="modal-opcoes-titulo">Opções</p>
              <label className="modal-opcao">
                <input
                  type="checkbox"
                  checked={gelo}
                  onChange={(e) => setGelo(e.target.checked)}
                />
                Gelo
              </label>
              <label className="modal-opcao">
                <input
                  type="checkbox"
                  checked={limao}
                  onChange={(e) => setLimao(e.target.checked)}
                />
                Limão
              </label>
            </div>
          )}

          {/* Observação */}
          <div className="modal-observacao">
            <p className="modal-opcoes-titulo">Alguma observação?</p>
            <textarea
              placeholder="Ex: sem cebola, bem passado..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          {/* Quantidade + botão */}
          <div className="modal-rodape">
            <div className="modal-quantidade">
              <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span>{quantidade}</span>
              <button onClick={() => setQuantidade(q => q + 1)}>
                <Plus size={16} />
              </button>
            </div>

            <button className="modal-btn-adicionar" onClick={handleAdicionar}>
              Adicionar · R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ModalProduto