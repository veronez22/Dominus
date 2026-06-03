import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

const STATUS_LABEL = { recebido: 'Recebido', preparo: 'Em Preparo', pronto: 'Pronto', entregue: 'Entregue' }
const STATUS_COR   = { recebido: '#FFB84D',  preparo: '#6fa3ef',    pronto: '#4caf50', entregue: '#888' }

const fmt     = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export default function AdminDashboard() {
  const [usuario,         setUsuario]         = useState('')
  const [restauranteId,   setRestauranteId]   = useState(null)
  const [caixaAtual,      setCaixaAtual]      = useState(undefined) // undefined=carregando, null=fechado
  const [caixasSelecionado, setCaixaSelecionado] = useState(null)   // caixa sendo visualizado
  const [historicoCaixas, setHistoricoCaixas] = useState([])
  const [stats,           setStats]           = useState(null)
  const [pedidosRecentes, setPedidosRecentes] = useState([])
  const [maisPedidos,     setMaisPedidos]     = useState([])
  const [loading,         setLoading]         = useState(true)
  const [abrindo,         setAbrindo]         = useState(false)
  const [fechando,        setFechando]        = useState(false)

  // ── Inicialização ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUsuario(user?.email?.split('@')[0] || 'Admin')

      const { data: rest } = await supabase.from('restaurantes').select('id').eq('slug', 'dominus').single()
      if (!rest) return
      setRestauranteId(rest.id)

      await carregarCaixaAtual(rest.id)
      await carregarHistorico(rest.id)
    }
    init()
  }, [])

  // ── Recarrega dados quando o caixa selecionado muda ──
  useEffect(() => {
    if (caixasSelecionado !== null) carregarDados(caixasSelecionado, true)
  }, [caixasSelecionado])

  // ── Realtime: atualiza silenciosamente quando chega pedido novo ──
  useEffect(() => {
    const estaVendoCaixaAtual = caixaAtual && caixasSelecionado?.id === caixaAtual?.id
    if (!estaVendoCaixaAtual) return

    const channel = supabase
      .channel('dashboard-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'itens_pedido' }, () => {
        carregarDados(caixaAtual)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        carregarDados(caixaAtual)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [caixaAtual, caixasSelecionado])

  async function carregarCaixaAtual(restId) {
    const { data } = await supabase
      .from('caixas')
      .select('*')
      .eq('restaurante_id', restId)
      .is('fechado_em', null)
      .single()

    setCaixaAtual(data || null)
    setCaixaSelecionado(data || null)
    await carregarDados(data || null, true)
  }

  async function carregarHistorico(restId) {
    const { data } = await supabase
      .from('caixas')
      .select('*')
      .eq('restaurante_id', restId)
      .not('fechado_em', 'is', null)
      .order('fechado_em', { ascending: false })
      .limit(20)
    setHistoricoCaixas(data || [])
  }

  async function carregarDados(caixa, exibirLoading = false) {
    if (exibirLoading) setLoading(true)

    const filtro = caixa
      ? { column: 'caixa_id', value: caixa.id }
      : null

    let query = supabase.from('pedidos').select('id, comanda, total, status, criado_em, caixa_id')
    if (filtro) query = query.eq(filtro.column, filtro.value)

    const { data: pedidos } = await query.order('criado_em', { ascending: false })

    const totalPedidos = pedidos?.length ?? 0
    const faturamento  = pedidos?.reduce((s, p) => s + Number(p.total), 0) ?? 0
    const ticket       = totalPedidos > 0 ? faturamento / totalPedidos : 0
    const emPreparo    = pedidos?.filter(p => p.status === 'preparo').length ?? 0

    // Avaliação média
    const { data: avals } = await supabase.from('avaliacoes').select('nota')
    const mediaAval = avals?.length > 0 ? avals.reduce((s, a) => s + a.nota, 0) / avals.length : null

    setStats({ totalPedidos, faturamento, ticket, emPreparo, mediaAval, totalAvals: avals?.length ?? 0 })
    setPedidosRecentes(pedidos?.slice(0, 8) ?? [])

    // Produtos mais pedidos do caixa selecionado
    if (pedidos && pedidos.length > 0) {
      const ids = pedidos.map(p => p.id)
      const { data: itens } = await supabase
        .from('itens_pedido')
        .select('nome_snapshot, quantidade')
        .in('pedido_id', ids)

      if (itens) {
        const contagem = {}
        itens.forEach(i => { contagem[i.nome_snapshot] = (contagem[i.nome_snapshot] || 0) + i.quantidade })
        const ranking = Object.entries(contagem)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([nome, qtd]) => ({ nome, qtd }))
        setMaisPedidos(ranking)
      } else {
        setMaisPedidos([])
      }
    } else {
      setMaisPedidos([])
    }

    setLoading(false)
  }

  async function abrirCaixa() {
    if (!restauranteId) return
    setAbrindo(true)
    const { data } = await supabase
      .from('caixas')
      .insert({ restaurante_id: restauranteId })
      .select()
      .single()
    setCaixaAtual(data)
    setCaixaSelecionado(data)
    setAbrindo(false)
  }

  async function fecharCaixa() {
    if (!caixaAtual || !confirm('Fechar o caixa agora? Os dados do período serão salvos.')) return
    setFechando(true)

    await supabase
      .from('caixas')
      .update({
        fechado_em:    new Date().toISOString(),
        faturamento:   stats?.faturamento ?? 0,
        total_pedidos: stats?.totalPedidos ?? 0,
      })
      .eq('id', caixaAtual.id)

    await carregarHistorico(restauranteId)
    setCaixaAtual(null)
    setCaixaSelecionado(null)
    setFechando(false)
  }

  const saudacao = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const caixaAberto = !!caixaAtual

  return (
    <div className="dash-wrap">

      {/* ── Topbar ── */}
      <div className="dash-topbar">
        <div>
          <h1>{saudacao()}, {usuario} 👋</h1>
          <p>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="dash-caixa-actions">
          {caixaAtual === undefined ? null : caixaAberto ? (
            <div className="dash-caixa-aberto">
              <span className="dash-caixa-dot" />
              <span>Caixa aberto desde {fmtHora(caixaAtual.aberto_em)}</span>
              <button className="dash-btn dash-btn--fechar" onClick={fecharCaixa} disabled={fechando}>
                {fechando ? 'Fechando...' : '🔒 Fechar Caixa'}
              </button>
            </div>
          ) : (
            <div className="dash-caixa-fechado">
              <span className="dash-caixa-dot dash-caixa-dot--off" />
              <span>Caixa fechado</span>
              <button className="dash-btn dash-btn--abrir" onClick={abrirCaixa} disabled={abrindo}>
                {abrindo ? 'Abrindo...' : '🟢 Abrir Caixa'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Seletor de histórico ── */}
      <div className="dash-periodo">
        <button
          className={`dash-periodo-btn${caixasSelecionado?.id === caixaAtual?.id || (!caixasSelecionado && !caixaAtual) ? ' active' : ''}`}
          onClick={() => setCaixaSelecionado(caixaAtual || null)}
        >
          {caixaAberto ? '📂 Caixa Atual' : '— Sem caixa aberto'}
        </button>
        {historicoCaixas.map(c => (
          <button
            key={c.id}
            className={`dash-periodo-btn${caixasSelecionado?.id === c.id ? ' active' : ''}`}
            onClick={() => setCaixaSelecionado(c)}
          >
            {fmtData(c.aberto_em)}
            <span className="dash-periodo-fat">{fmt(c.faturamento ?? 0)}</span>
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      {loading ? (
        <div className="dash-loading">Carregando dados...</div>
      ) : (
        <>
          {/* ── Métricas ── */}
          <div className="dash-metrics">
            <div className="dash-metric">
              <div className="dm-label">💰 Faturamento</div>
              <div className="dm-value">{fmt(stats.faturamento)}</div>
              <div className="dm-sub">{stats.totalPedidos} pedido{stats.totalPedidos !== 1 ? 's' : ''}</div>
            </div>
            <div className="dash-metric">
              <div className="dm-label">🧾 Pedidos</div>
              <div className="dm-value">{stats.totalPedidos}</div>
              <div className="dm-sub">no período</div>
            </div>
            <div className="dash-metric">
              <div className="dm-label">🪙 Ticket Médio</div>
              <div className="dm-value">{stats.totalPedidos > 0 ? fmt(stats.ticket) : '—'}</div>
              <div className="dm-sub">por pedido</div>
            </div>
            <div className="dash-metric">
              <div className="dm-label">🍳 Em Preparo</div>
              <div className="dm-value">{stats.emPreparo}</div>
              <div className="dm-sub">agora</div>
            </div>
            <div className="dash-metric">
              <div className="dm-label">⭐ Avaliação</div>
              <div className="dm-value">{stats.mediaAval ? stats.mediaAval.toFixed(1) : '—'}</div>
              <div className="dm-sub">{stats.totalAvals > 0 ? `${stats.totalAvals} avaliações` : 'sem avaliações'}</div>
            </div>
          </div>

          <div className="dash-grid">
            {/* ── Pedidos recentes ── */}
            <div className="dash-card">
              <h3 className="dash-card-titulo">🧾 Pedidos Recentes</h3>
              {pedidosRecentes.length === 0 ? (
                <p className="dash-vazio">Nenhum pedido neste período.</p>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Comanda</th>
                      <th>Horário</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosRecentes.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.comanda}</strong></td>
                        <td>{fmtHora(p.criado_em)}</td>
                        <td>{fmt(Number(p.total))}</td>
                        <td>
                          <span className="dash-status" style={{ color: STATUS_COR[p.status] }}>
                            {STATUS_LABEL[p.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Produtos mais pedidos ── */}
            <div className="dash-card">
              <h3 className="dash-card-titulo">🏆 Produtos Mais Pedidos</h3>
              {maisPedidos.length === 0 ? (
                <p className="dash-vazio">Nenhum dado neste período.</p>
              ) : (
                <div className="dash-ranking">
                  {maisPedidos.map((item, i) => {
                    const max = maisPedidos[0].qtd
                    return (
                      <div key={item.nome} className="dash-rank-item">
                        <span className="dash-rank-pos">#{i + 1}</span>
                        <div className="dash-rank-info">
                          <div className="dash-rank-nome">{item.nome}</div>
                          <div className="dash-rank-bar">
                            <div className="dash-rank-fill" style={{ width: `${(item.qtd / max) * 100}%` }} />
                          </div>
                        </div>
                        <span className="dash-rank-qtd">{item.qtd}x</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
