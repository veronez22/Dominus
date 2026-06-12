import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getExtrasLinhas } from '../../lib/formatExtras'
import './AdminPedidos.css'

const TOTAL_COMANDAS = 20
const TODAS_COMANDAS = Array.from({ length: TOTAL_COMANDAS }, (_, i) =>
  `CMD-${String(i + 1).padStart(4, '0')}`
)

const STATUS_LABEL = { recebido: 'Recebido', preparo: 'Em Preparo', pronto: 'Pronto ✓', entregue: 'Entregue' }
const STATUS_COR   = { recebido: '#FFB84D',  preparo: '#6fa3ef',    pronto: '#4caf50',   entregue: '#4caf50' }

const fmt     = (v)   => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function imprimir(sessao) {
  const win = window.open('', '_blank', 'width=400,height=600')
  const { codigo, mesa, pedidos, total } = sessao

  const itensHtml = pedidos.map((pedido, idx) => `
    <div class="pedido">
      <div class="pedido-header">Pedido #${idx + 1} — ${fmtHora(pedido.criado_em)}</div>
      ${(pedido.itens_pedido || []).map(item => `
        <div class="item">
          <span>${item.quantidade}x ${item.nome_snapshot}${item.observacao ? ` <em>(${item.observacao})</em>` : ''}</span>
          <span>${fmt(Number(item.preco_snapshot) * item.quantidade)}</span>
        </div>
        ${getExtrasLinhas(item.extras).map(linha => `<div class="item-extra">${linha}</div>`).join('')}
      `).join('')}
      <div class="subtotal">Subtotal: ${fmt(Number(pedido.total))}</div>
    </div>
  `).join('<hr/>')

  win.document.write(`
    <html><head><title>Comanda ${codigo}</title>
    <style>
      body { font-family: monospace; font-size: 13px; padding: 20px; max-width: 320px; margin: 0 auto; }
      h2 { text-align: center; margin-bottom: 4px; }
      .sub { text-align: center; color: #555; margin-bottom: 16px; font-size: 12px; }
      hr { border: none; border-top: 1px dashed #ccc; margin: 12px 0; }
      .pedido-header { font-weight: bold; margin-bottom: 6px; }
      .item { display: flex; justify-content: space-between; margin: 3px 0; }
      .item-extra { padding-left: 12px; color: #555; font-size: 12px; white-space: pre; }
      .subtotal { text-align: right; font-size: 12px; color: #555; margin-top: 6px; }
      .total { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 16px; border-top: 2px solid #000; padding-top: 10px; }
      .rodape { text-align: center; margin-top: 20px; font-size: 11px; color: #777; }
    </style></head>
    <body>
      <h2>Dominus</h2>
      <div class="sub">
        ${codigo}${mesa ? ` · Mesa ${mesa}` : ''}<br/>
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
  const [aba,         setAba]         = useState('mapa')
  const [sessoes,     setSessoes]     = useState([])
  const [caixaAberto, setCaixaAberto] = useState(null)
  const [caixaId,     setCaixaId]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [baixando,    setBaixando]    = useState(null)
  const caixaIdRef = useRef(null)

  useEffect(() => {
    init()
    const channel = supabase
      .channel('admin-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' },         () => carregarSessoes(caixaIdRef.current))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' },         () => carregarSessoes(caixaIdRef.current))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessoes_comanda' }, () => carregarSessoes(caixaIdRef.current))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessoes_comanda' }, () => carregarSessoes(caixaIdRef.current))
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
    caixaIdRef.current = caixa?.id || null
    await carregarSessoes(caixa?.id)
    setLoading(false)
  }

  async function carregarSessoes(id) {
    let cxId = id ?? caixaId
    if (!cxId) {
      const { data: rest } = await supabase
        .from('restaurantes').select('id').eq('slug', 'dominus').single()
      const { data: caixa } = await supabase
        .from('caixas').select('id').eq('restaurante_id', rest.id).is('fechado_em', null).single()
      cxId = caixa?.id
    }
    if (!cxId) { setSessoes([]); return }

    const { data: sessoesData } = await supabase
      .from('sessoes_comanda')
      .select('*, pedidos(*, itens_pedido(*))')
      .eq('caixa_id', cxId)
      .order('aberta_em', { ascending: false })

    const com_total = (sessoesData || []).map(s => ({
      ...s,
      pedidos: (s.pedidos || []).sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em)),
      total: (s.pedidos || []).reduce((acc, p) => acc + Number(p.total), 0),
    }))

    setSessoes(com_total)
  }

  async function darBaixa(sessao) {
    if (!confirm(`Confirmar pagamento e dar baixa na comanda ${sessao.codigo}?`)) return
    setBaixando(sessao.id)

    const ids = sessao.pedidos.map(p => p.id)
    await Promise.all([
      supabase.from('pedidos').update({ status: 'baixa' }).in('id', ids),
      supabase.from('sessoes_comanda').update({ encerrada_em: new Date().toISOString() }).eq('id', sessao.id),
    ])

    await carregarSessoes()
    setBaixando(null)
    setAba('mapa')
  }

  const sessoesAtivas     = sessoes.filter(s => !s.encerrada_em)
  const sessoesEncerradas = sessoes.filter(s =>  s.encerrada_em)

  // Mapa: quais comandas estão em uso, quais disponíveis
  const mapaComandas = TODAS_COMANDAS.map(cod => {
    const sessaoAberta = sessoesAtivas.find(s => s.codigo === cod)
    return { codigo: cod, sessao: sessaoAberta || null }
  })

  return (
    <div className="ped-wrap">
      <div className="ped-topbar">
        <div>
          <h1>🪙 Comandas</h1>
          <p>
            {caixaAberto
              ? `Caixa aberto desde ${fmtHora(caixaAberto.aberto_em)} · ${sessoesAtivas.length} em uso · ${TOTAL_COMANDAS - sessoesAtivas.length} disponíveis`
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
            <button className={`ped-aba ${aba === 'mapa' ? 'active' : ''}`} onClick={() => setAba('mapa')}>
              Mapa
            </button>
            <button className={`ped-aba ${aba === 'ativas' ? 'active' : ''}`} onClick={() => setAba('ativas')}>
              Em Uso
              {sessoesAtivas.length > 0 && <span className="ped-aba-badge">{sessoesAtivas.length}</span>}
            </button>
          </div>

          {/* ── Mapa de Comandas ── */}
          {aba === 'mapa' && (
            <div className="mapa-grid">
              {mapaComandas.map(({ codigo, sessao }) => (
                <div
                  key={codigo}
                  className={`mapa-card ${sessao ? 'em-uso' : 'disponivel'}`}
                  onClick={() => sessao && setAba('ativas')}
                  title={sessao ? `Clique para ver detalhes` : 'Disponível'}
                >
                  <span className="mapa-codigo">{codigo}</span>
                  {sessao ? (
                    <>
                      <span className="mapa-status em-uso-label">Em uso</span>
                      {sessao.mesa && <span className="mapa-mesa">Mesa {sessao.mesa}</span>}
                      <span className="mapa-hora">{fmtHora(sessao.aberta_em)}</span>
                    </>
                  ) : (
                    <span className="mapa-status disp-label">Disponível</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Em Uso ── */}
          {aba === 'ativas' && (
            sessoesAtivas.length === 0 ? (
              <div className="ped-vazio"><span>🍽️</span><p>Nenhuma comanda em uso no momento.</p></div>
            ) : (
              <div className="ped-grid">
                {sessoesAtivas.map(sessao => (
                  <CardSessao
                    key={sessao.id}
                    sessao={sessao}
                    encerrada={false}
                    baixando={baixando}
                    onBaixa={() => darBaixa(sessao)}
                    onImprimir={() => imprimir(sessao)}
                  />
                ))}
              </div>
            )
          )}

          {/* ── Encerradas ── */}
          {aba === 'encerradas' && (
            sessoesEncerradas.length === 0 ? (
              <div className="ped-vazio"><span>✅</span><p>Nenhuma comanda no histórico deste caixa.</p></div>
            ) : (
              <div className="ped-grid">
                {sessoesEncerradas.map(sessao => (
                  <CardSessao
                    key={sessao.id}
                    sessao={sessao}
                    encerrada={true}
                    baixando={baixando}
                    onBaixa={() => {}}
                    onImprimir={() => imprimir(sessao)}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

function CardSessao({ sessao, encerrada, baixando, onBaixa, onImprimir }) {
  const { id, codigo, mesa, pedidos, total } = sessao
  return (
    <div className={`ped-card ${encerrada ? 'ped-card--enc' : ''}`}>
      <div className="ped-card-header">
        <div className="ped-card-titulo">
          <strong className="ped-comanda">{codigo}</strong>
          {mesa && <span className="ped-mesa">Mesa {mesa}</span>}
        </div>
        <div className="ped-card-acoes">
          <button className="ped-btn-imprimir" onClick={onImprimir}>🖨️ Imprimir</button>
          {!encerrada ? (
            <button className="ped-btn-baixa" onClick={onBaixa} disabled={baixando === id}>
              {baixando === id ? 'Encerrando...' : '✅ Dar Baixa'}
            </button>
          ) : (
            <span className="ped-enc-tag">Encerrada</span>
          )}
        </div>
      </div>

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

      <div className="ped-card-footer">
        <span>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</span>
        <strong className="ped-total">{fmt(total)}</strong>
      </div>
    </div>
  )
}
