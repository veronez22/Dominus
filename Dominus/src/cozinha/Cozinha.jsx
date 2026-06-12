import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getExtrasLinhas } from '../lib/formatExtras'
import './Cozinha.css'

const STATUS_LABEL = {
  recebido: 'Recebido',
  preparo:  'Em Preparo',
  pronto:   'Pronto',
  entregue: 'Entregue',
}

const STATUS_PROXIMO = {
  recebido: 'preparo',
  preparo:  'pronto',
  pronto:   'entregue',
}

const STATUS_BTN = {
  recebido: 'Iniciar Preparo',
  preparo:  'Marcar como Pronto',
  pronto:   'Entregar',
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  // Busca pedidos ativos (recebido, preparo, pronto)
  async function fetchPedidos() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .in('status', ['recebido', 'preparo', 'pronto'])
      .order('criado_em', { ascending: true })

    if (!error) setPedidos(data || [])
    setLoading(false)
  }

  // Avança o status do pedido
  async function avancarStatus(pedido) {
    const novoStatus = STATUS_PROXIMO[pedido.status]
    if (!novoStatus) return

    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', pedido.id)

    if (error) console.error('Erro ao atualizar status:', error)
  }

  useEffect(() => {
    fetchPedidos()

    // Realtime: escuta INSERT em itens_pedido (último passo do envio)
    // e UPDATE em pedidos (mudança de status pela cozinha)
    const channel = supabase
      .channel('cozinha-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'itens_pedido' }, fetchPedidos)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const colunas = ['recebido', 'preparo', 'pronto']

  if (loading) return (
    <div className="cozinha-loading">
      <span>🍳</span> Carregando pedidos...
    </div>
  )

  return (
    <div className="cozinha">
      <header className="cozinha-header">
        <h1>🍳 Painel da Cozinha</h1>
        <span className="cozinha-total">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} ativo{pedidos.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div className="cozinha-board">
        {colunas.map(status => {
          const lista = pedidos.filter(p => p.status === status)
          return (
            <div key={status} className={`cozinha-coluna cozinha-coluna--${status}`}>
              <div className="cozinha-coluna-header">
                <span className={`cozinha-badge cozinha-badge--${status}`}>
                  {STATUS_LABEL[status]}
                </span>
                <span className="cozinha-coluna-count">{lista.length}</span>
              </div>

              <div className="cozinha-cards">
                {lista.length === 0 && (
                  <p className="cozinha-vazio">Nenhum pedido</p>
                )}
                {lista.map(pedido => (
                  <div key={pedido.id} className={`cozinha-card cozinha-card--${pedido.status}`}>
                    <div className="cozinha-card-top">
                      <div className="cozinha-card-identificacao">
                        <strong className="cozinha-comanda">{pedido.comanda}</strong>
                        {pedido.mesa && <span className="cozinha-mesa">Mesa {pedido.mesa}</span>}
                      </div>
                      <span className="cozinha-horario">
                        {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <ul className="cozinha-itens">
                      {pedido.itens_pedido.map(item => (
                        <li key={item.id} className="cozinha-item">
                          <div>
                            <span className="cozinha-item-qtd">{item.quantidade}x</span>
                            <span className="cozinha-item-nome">{item.nome_snapshot}</span>
                            {item.observacao && (
                              <span className="cozinha-item-obs">— {item.observacao}</span>
                            )}
                          </div>
                          {getExtrasLinhas(item.extras).map((linha, idx) => (
                            <div key={idx} className="cozinha-item-extra">{linha}</div>
                          ))}
                        </li>
                      ))}
                    </ul>

                    <div className="cozinha-card-footer">
                      <span className="cozinha-total-valor">
                        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                      </span>
                      {STATUS_PROXIMO[pedido.status] && (
                        <button
                          className={`cozinha-btn cozinha-btn--${pedido.status}`}
                          onClick={() => avancarStatus(pedido)}
                        >
                          {STATUS_BTN[pedido.status]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
