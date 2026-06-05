import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminPedidos.css'

const STATUS_LABEL = { recebido: 'Recebido', preparo: 'Em Preparo', pronto: 'Pronto ✓', entregue: 'Entregue' }
const STATUS_COR   = { recebido: '#FFB84D',  preparo: '#6fa3ef',    pronto: '#4caf50',   entregue: '#4caf50' }

const fmt     = (v)   => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function agruparPorComanda(pedidos) {
  const mapa = {}
  ;(pedidos || []).forEach(p => {
    if (!mapa[p.comanda]) {
      mapa[p.comanda] = { comanda: p.comanda, mesa: p.mesa, pedidos: [], total: 0 }
    }
    mapa[p.comanda].pedidos.push(p)
    mapa[p.comanda].total += Number(p.total)
  })
  return Object.values(mapa)
}

function imprimir(comanda) {
  const win = window.open('', '_blank', 'width=400,height=600')
  const { comanda: cod, mesa, pedidos, total } = comanda

  const itensHtml = pedidos.map((pedido, idx) => `
    <div class="pedido">
      <div class="pedido-header">Pedido #${idx + 1} — ${fmtHora(pedido.criado_em)}</div>
      ${(pedido.itens_pedido || []).map(item => `
        <div class="item">
          <span>${item.quantidade}x ${item.nome_snapshot}${item.observacao ? ` <em>(${item.observacao})</em>` : ''}</span>
          <span>${fmt(Number(item.preco_snapshot) * item.quantidade)}</span>
        </div>
      `).join('')}
      <div class="subtotal">Subtotal: ${fmt(Number(pedido.total))}</div>
    </div>
  `).join('<hr/>')

  win.document.write(`
    <html><head><title>Comanda ${cod}</title>
    <style>
      body { font-family: monospace; font-size: 13px; padding: 20px; max-width: 320px; margin: 0 auto; }
      h2 { text-align: center; margin-bottom: 4px; }
      .sub { text-align: center; color: #555; margin-bottom: 16px; font-size: 12px; }
      hr { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
      .pedido-header { font-weight: bold; margin-bottom: 6px; }
      .item { display: flex; justify-content: space-between; margin: 3px 0; }
      .subtotal { text-align: right; font-size: 12px; color: #555; margin-top: 6px; }
      .total { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 16px; border-top: 2px solid #000; padding-top: 10px; }
      .rodape { text-align: center; margin-top: 20px; font-size: 11px; color: #777; }
    </style></head>
    <body>
      <h2>Dominus</h2>
      <div class="sub">
        ${cod}${mesa ? ` · Mesa ${mesa}` : ''}<br/>
        ${fmtData(pedidos[0]?.criado_em)} · ${fmtHora(pedidos[0]?.criado_em)}
      </div>
      <hr/>
      ${itensHtml}
      <div class="total"><span>TOTAL</span><span>${fmt(total)}</span></div>
      <div class="rodape">Obrigado pela visita!</div>
    </body></html>
  `)
  win.document.close()
  win.print()
}

export default function AdminPedidos() {
  const [aba,         setAba]         = useState('ativas')
  const [ativas,      setAtivas]      = useState([])
  const [encerradas,  setEncerradas]  = useState([])
  const [caixaAberto, setCaixaAberto] = useState(null)
  const [caixaId,     setCaixaId]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [baixando,    setBaixando]    = useState(null)

  useEffect(() => {
    init()
    const channel = supabase
      .channel('admin-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, () => carregarTodos())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => carregarTodos())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function init() {
    const { data: rest } = await supabase
      .from('restaurantes').select('id').eq('slug', 'dominus').single()
    const { data: caixa } = await supabase
      .from('caixas').select('*').eq('restaurante_id', rest.id).is('fechado_em', null).single()
    setCaixaAberto(caixa || null)
    setCaixaId(caixa?.id || null)
    await carregarTodos(caixa?.id)
    setLoading(false)
  }

  async function carregarTodos(id) {
    let cxId = id ?? caixaId
    if (!cxId) {
      const { data: rest } = await supabase
        .from('restaurantes').select('id').eq('slug', 'dominus').single()
      const { data: caixa } = await supabase
        .from('caixas').select('id').eq('restaurante_id', rest.id).is('fechado_em', null).single()
      cxId = caixa?.id
    }
    if (!cxId) { setAtivas([]); setEncerradas([]); return }

    const [{ data: pedAtivas }, { data: pedEnc }] = await Promise.all([
      supabase.from('pedidos').select('*, itens_pedido(*)')
        .eq('caixa_id', cxId).neq('status', 'baixa').order('criado_em', { ascending: true }),
      supabase.from('pedidos').select('*, itens_pedido(*)')
        .eq('caixa_id', cxId).eq('status', 'baixa').order('criado_em', { ascending: false }),
    ])

    setAtivas(agruparPorComanda(pedAtivas))
    setEncerradas(agruparPorComanda(pedEnc))
  }

  async function darBaixa(comanda) {
    if (!confirm(`Confirmar pagamento e dar baixa na comanda ${comanda}?`)) return
    setBaixando(comanda)
    const ids = ativas.find(c => c.comanda === comanda)?.pedidos.map(p => p.id) || []
    await supabase.from('pedidos').update({ status: 'baixa' }).in('id', ids)
    await carregarTodos()
    setBaixando(null)
    setAba('ativas')
  }

  const lista = aba === 'ativas' ? ativas : encerradas

  return (
    <div className="ped-wrap">
      <div className="ped-topbar">
        <div>
          <h1>🪙 Comandas</h1>
          <p>
            {caixaAberto
              ? `Caixa aberto desde ${fmtHora(caixaAberto.aberto_em)} · ${ativas.length} ativa${ativas.length !== 1 ? 's' : ''} · ${encerradas.length} encerrada${encerradas.length !== 1 ? 's' : ''}`
              : 'Nenhum caixa aberto'
            }
          </p>
        </div>
      </div>

      {loading ? (
        <div className="ped-loading">Carregando comandas...</div>
      ) : !caixaAberto ? (
        <div className="ped-vazio"><span>🔒</span><p>Abra o caixa no Dashboard para ver as comandas.</p></div>
      ) : (
        <>
          {/* ── Abas ── */}
          <div className="ped-abas">
            <button className={`ped-aba ${aba === 'ativas' ? 'active' : ''}`} onClick={() => setAba('ativas')}>
              Ativas
              {ativas.length > 0 && <span className="ped-aba-badge">{ativas.length}</span>}
            </button>
            <button className={`ped-aba ${aba === 'encerradas' ? 'active' : ''}`} onClick={() => setAba('encerradas')}>
              Encerradas
              {encerradas.length > 0 && <span className="ped-aba-badge ped-aba-badge--enc">{encerradas.length}</span>}
            </button>
          </div>

          {lista.length === 0 ? (
            <div className="ped-vazio">
              <span>{aba === 'ativas' ? '🍽️' : '✅'}</span>
              <p>{aba === 'ativas' ? 'Nenhuma comanda ativa no momento.' : 'Nenhuma comanda encerrada neste caixa.'}</p>
            </div>
          ) : (
            <div className="ped-grid">
              {lista.map((cmd) => {
                const { comanda, mesa, pedidos, total } = cmd
                return (
                  <div key={comanda} className={`ped-card ${aba === 'encerradas' ? 'ped-card--enc' : ''}`}>

                    {/* ── Header ── */}
                    <div className="ped-card-header">
                      <div className="ped-card-titulo">
                        <strong className="ped-comanda">{comanda}</strong>
                        {mesa && <span className="ped-mesa">Mesa {mesa}</span>}
                      </div>
                      <div className="ped-card-acoes">
                        <button className="ped-btn-imprimir" onClick={() => imprimir(cmd)} title="Imprimir notinha">
                          🖨️ Imprimir
                        </button>
                        {aba === 'ativas' ? (
                          <button
                            className="ped-btn-baixa"
                            onClick={() => darBaixa(comanda)}
                            disabled={baixando === comanda}
                          >
                            {baixando === comanda ? 'Encerrando...' : '✅ Dar Baixa'}
                          </button>
                        ) : (
                          <span className="ped-enc-tag">Encerrada</span>
                        )}
                      </div>
                    </div>

                    {/* ── Pedidos ── */}
                    <div className="ped-pedidos">
                      {pedidos.map((pedido, idx) => (
                        <div key={pedido.id} className="ped-pedido">
                          <div className="ped-pedido-header">
                            <span className="ped-pedido-num">Pedido #{idx + 1}</span>
                            <span className="ped-pedido-hora">{fmtHora(pedido.criado_em)}</span>
                            <span className="ped-status" style={{ color: STATUS_COR[pedido.status] }}>
                              {STATUS_LABEL[pedido.status]}
                            </span>
                          </div>
                          <div className="ped-itens">
                            {(pedido.itens_pedido || []).map(item => (
                              <div key={item.id} className="ped-item">
                                <span className="ped-item-qtd">{item.quantidade}x</span>
                                <span className="ped-item-nome">{item.nome_snapshot}</span>
                                {item.observacao && <span className="ped-item-obs">— {item.observacao}</span>}
                                <span className="ped-item-preco">{fmt(Number(item.preco_snapshot) * item.quantidade)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Total ── */}
                    <div className="ped-card-footer">
                      <span>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</span>
                      <strong className="ped-total">{fmt(total)}</strong>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
