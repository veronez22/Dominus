import { useState } from 'react'
import './Carrinho.css'

function Carrinho({ itens, onRemover, onFechar }) {
  const [confirmado, setConfirmado] = useState(false)
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
  const [mensagemErro, setMensagemErro] = useState(false)

function handleConfirmar() {
  if (itens.length === 0) {
    setMensagemErro(true)
    setTimeout(() => setMensagemErro(false), 2500)
    return
  }
  setConfirmado(true)
}

  return (
    <div className="modal-overlay carrinho-overlay" onClick={onFechar}>
      <div className="carrinho" onClick={(e) => e.stopPropagation()}>
      
        {confirmado ? (
          // ── Tela de confirmação ──
          <div className="carrinho-confirmado">
            <div className="carrinho-confirmado-icone">✅</div>
            <h2>Pedido Enviado!</h2>
            <p>Seu pedido foi recebido e já está sendo preparado.</p>

            <button className="carrinho-btn-confirmar" onClick={onFechar}>
              Fechar
            </button>
          </div>

        ) : (
          // ── Tela normal do carrinho ──
          <>
            <div className="carrinho-header">
              <h2>🛒 Meu Pedido</h2>
              <button className="carrinho-btn-fechar" onClick={onFechar}>✕</button>
            </div>

            <div className="carrinho-itens">
              {itens.length === 0 ? (
                <p className="carrinho-vazio">Seu carrinho está vazio</p>
              ) : (
                itens.map((item) => (
                  <div key={item.id} className="carrinho-item">
                    <div className="carrinho-item-info">
                      <p>{item.nome}</p>
                      <span>x{item.quantidade} · R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button className="carrinho-item-remover" onClick={() => onRemover(item.id)}>✕</button>
                  </div>
                ))
              )}
            </div>

            <div className="carrinho-footer">
              <div className="carrinho-total">
                <span>Total</span>
                <strong>R$ {total.toFixed(2).replace('.', ',')}</strong>
              </div>
              {mensagemErro && (
              <p className="carrinho-erro">⚠️ Adicione pelo menos um produto!</p>
              )}
              <button className="carrinho-btn-confirmar" onClick={handleConfirmar}>
                Confirmar Pedido 🔥
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Carrinho