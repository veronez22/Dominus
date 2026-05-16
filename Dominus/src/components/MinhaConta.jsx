import './MinhaConta.css'
import { X, ShoppingBag, UtensilsCrossed, Clock } from 'lucide-react'

function MinhaConta({ mesa, historico, onFechar, onAbrirCarrinho }) {
  const totalGasto = historico.reduce((s, p) => s + p.total, 0)
  const totalItens = historico.reduce((s, p) =>
    s + p.itens.reduce((si, i) => si + i.quantidade, 0), 0)

  return (
    <div className="modal-overlay conta-overlay" onClick={onFechar}>
      <div className="conta-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="conta-header">
          <div className="conta-header-info">
            <h2>Minha Conta</h2>
            <span>{mesa ? `Mesa ${mesa}` : 'Mesa não definida'}</span>
          </div>
          <button className="conta-btn-fechar" onClick={onFechar}>
            <X size={20} />
          </button>
        </div>

        {/* Resumo */}
        <div className="conta-resumo">
          <div className="conta-resumo-card">
            <ShoppingBag size={20} />
            <div>
              <p>{historico.length}</p>
              <span>{historico.length === 1 ? 'Pedido feito' : 'Pedidos feitos'}</span>
            </div>
          </div>
          <div className="conta-resumo-card">
            <UtensilsCrossed size={20} />
            <div>
              <p>{totalItens}</p>
              <span>{totalItens === 1 ? 'Item pedido' : 'Itens pedidos'}</span>
            </div>
          </div>
          <div className="conta-resumo-card destaque">
            <div>
              <p>R$ {totalGasto.toFixed(2).replace('.', ',')}</p>
              <span>Total gasto</span>
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="conta-historico">
          {historico.length === 0 ? (
            <div className="conta-vazio">
              <p>Nenhum pedido realizado ainda.</p>
            </div>
          ) : (
            [...historico].reverse().map((pedido) => (
              <div key={pedido.id} className="conta-pedido">
                <div className="conta-pedido-header">
                  <div className="conta-pedido-badge">Pedido #{historico.indexOf(pedido) + 1}</div>
                  <div className="conta-pedido-horario">
                    <Clock size={13} />
                    {pedido.horario}
                  </div>
                </div>
                <div className="conta-pedido-itens">
                  {pedido.itens.map((item) => (
                    <div key={item.id} className="conta-pedido-item">
                      <span className="conta-pedido-item-nome">
                        <span className="conta-pedido-item-qtd">x{item.quantidade}</span>
                        {item.nome}
                      </span>
                      <span className="conta-pedido-item-preco">
                        R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="conta-pedido-total">
                  <span>Total do pedido</span>
                  <strong>R$ {pedido.total.toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}

export default MinhaConta