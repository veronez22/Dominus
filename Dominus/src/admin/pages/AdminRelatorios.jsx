import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import {
  DollarSign, ShoppingBag, Receipt, Package,
  Clock, Star, Trophy, Lightbulb, BarChart2,
  Archive, AlertTriangle, CheckCircle, TrendingUp,
  TrendingDown, Minus, FileDown, Timer
} from 'lucide-react'
import './AdminRelatorios.css'

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const PERIODOS = [
  { id: 'hoje',   label: 'Hoje' },
  { id: 'semana', label: '7 dias' },
  { id: 'mes',    label: '30 dias' },
]

function gerarInsights({ pedidos, itens, avaliacoes, produtos, caixas }) {
  const insights = []

  if (!pedidos.length) return insights

  // Faturamento de hoje vs média dos últimos dias
  const hoje = new Date().toISOString().split('T')[0]
  const pedidosHoje = pedidos.filter(p => p.criado_em?.startsWith(hoje))
  const fatHoje = pedidosHoje.reduce((s, p) => s + Number(p.total), 0)
  const fatTotal = pedidos.reduce((s, p) => s + Number(p.total), 0)
  const diasUnicos = [...new Set(pedidos.map(p => p.criado_em?.split('T')[0]))].length
  const mediaDiaria = diasUnicos > 1 ? fatTotal / diasUnicos : 0

  if (mediaDiaria > 0 && fatHoje < mediaDiaria * 0.7) {
    insights.push({
      tipo: 'alerta',
      icone: <AlertTriangle size={18}/>,
      titulo: 'Movimento abaixo do normal',
      texto: `Faturamento de hoje (${fmt(fatHoje)}) está abaixo da média diária (${fmt(mediaDiaria)}). Considere uma promoção.`,
    })
  }

  // Avaliação de atendimento baixa
  if (avaliacoes.length >= 3) {
    const mediaAtend = avaliacoes.reduce((s, a) => s + (a.nota_atendimento || 0), 0) / avaliacoes.length
    if (mediaAtend > 0 && mediaAtend < 3.5) {
      insights.push({
        tipo: 'alerta',
        icone: <AlertTriangle size={18}/>,
        titulo: 'Atendimento abaixo da média',
        texto: `Avaliação de atendimento em ${mediaAtend.toFixed(1)}/5. Verifique o treinamento da equipe.`,
      })
    }
  }

  // Horário de pico
  const contagemHoras = {}
  pedidos.forEach(p => {
    const h = new Date(p.criado_em).getHours()
    contagemHoras[h] = (contagemHoras[h] || 0) + 1
  })
  const horaPico = Object.entries(contagemHoras).sort((a, b) => b[1] - a[1])[0]
  if (horaPico) {
    insights.push({
      tipo: 'info',
      icone: <Clock size={18}/>,
      titulo: 'Horário de pico identificado',
      texto: `Seu maior movimento é às ${horaPico[0]}h com ${horaPico[1]} pedido${horaPico[1] > 1 ? 's' : ''}. Reforce a equipe nesse período.`,
    })
  }

  // Produto mais pedido indisponível
  const contagem = {}
  itens.forEach(i => { contagem[i.nome_snapshot] = (contagem[i.nome_snapshot] || 0) + i.quantidade })
  const topProduto = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]
  if (topProduto && produtos.length) {
    const prodEncontrado = produtos.find(p => p.nome === topProduto[0])
    if (prodEncontrado && !prodEncontrado.disponivel) {
      insights.push({
        tipo: 'alerta',
        icone: <AlertTriangle size={18}/>,
        titulo: 'Produto mais pedido indisponível',
        texto: `"${topProduto[0]}" é seu produto #1 mas está marcado como indisponível!`,
      })
    }
  }

  // Ticket médio
  const ticketMedio = pedidos.length > 0 ? fatTotal / pedidos.length : 0
  if (ticketMedio > 0 && ticketMedio < 20) {
    insights.push({
      tipo: 'sugestao',
      icone: <Lightbulb size={18}/>,
      titulo: 'Ticket médio baixo',
      texto: `Ticket médio em ${fmt(ticketMedio)}. Considere criar combos ou sugerir adicionais para aumentar o valor do pedido.`,
    })
  }

  // Produto parado (não pedido em nenhum pedido do período)
  if (produtos.length && itens.length) {
    const nomesVendidos = new Set(itens.map(i => i.nome_snapshot))
    const produtosParados = produtos.filter(p => p.disponivel && !nomesVendidos.has(p.nome))
    if (produtosParados.length > 0) {
      insights.push({
        tipo: 'sugestao',
        icone: <Package size={18}/>,
        titulo: `${produtosParados.length} produto${produtosParados.length > 1 ? 's' : ''} sem pedidos no período`,
        texto: `"${produtosParados[0].nome}"${produtosParados.length > 1 ? ` e mais ${produtosParados.length - 1}` : ''} não foram pedidos. Considere promover ou revisar.`,
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      tipo: 'ok',
      icone: <CheckCircle size={18}/>,
      titulo: 'Tudo em ordem!',
      texto: 'Nenhuma inconsistência detectada no período. Continue assim!',
    })
  }

  return insights
}

function calcDuracao(ms) {
  const min = Math.round(ms / 60000)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}min`
}

function calcVariacao(atual, anterior) {
  if (!anterior || anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

export default function AdminRelatorios() {
  const [periodo,   setPeriodo]   = useState('hoje')
  const [dados,     setDados]     = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { carregar() }, [periodo])

  function getIntervalos() {
    const agora = new Date()
    if (periodo === 'hoje') {
      const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
      const inicioAnt = new Date(inicio - 24 * 60 * 60 * 1000)
      return { dataInicio: inicio.toISOString(), dataInicioAnt: inicioAnt.toISOString(), dataFimAnt: inicio.toISOString() }
    } else if (periodo === 'semana') {
      const ms = 7 * 24 * 60 * 60 * 1000
      const inicio = new Date(agora - ms)
      const inicioAnt = new Date(agora - ms * 2)
      return { dataInicio: inicio.toISOString(), dataInicioAnt: inicioAnt.toISOString(), dataFimAnt: inicio.toISOString() }
    } else {
      const ms = 30 * 24 * 60 * 60 * 1000
      const inicio = new Date(agora - ms)
      const inicioAnt = new Date(agora - ms * 2)
      return { dataInicio: inicio.toISOString(), dataInicioAnt: inicioAnt.toISOString(), dataFimAnt: inicio.toISOString() }
    }
  }

  async function carregar() {
    setLoading(true)
    const { dataInicio, dataInicioAnt, dataFimAnt } = getIntervalos()

    const [
      { data: pedidos },
      { data: pedidosAnt },
      { data: avaliacoes },
      { data: caixas },
      { data: produtos },
    ] = await Promise.all([
      supabase.from('pedidos').select('*, itens_pedido(*)').gte('criado_em', dataInicio).order('criado_em'),
      supabase.from('pedidos').select('total').gte('criado_em', dataInicioAnt).lt('criado_em', dataFimAnt),
      supabase.from('avaliacoes').select('*').gte('criado_em', dataInicio),
      supabase.from('caixas').select('*').not('fechado_em', 'is', null).order('fechado_em', { ascending: false }).limit(10),
      supabase.from('produtos').select('id, nome, disponivel'),
    ])

    const itensTodos = (pedidos || []).flatMap(p => p.itens_pedido || [])

    // Métricas atuais
    const totalPedidos = pedidos?.length || 0
    const faturamento  = pedidos?.reduce((s, p) => s + Number(p.total), 0) || 0
    const ticket       = totalPedidos > 0 ? faturamento / totalPedidos : 0
    const totalItens   = itensTodos.reduce((s, i) => s + i.quantidade, 0)

    // Métricas anteriores para comparativo
    const totalPedidosAnt = pedidosAnt?.length || 0
    const faturamentoAnt  = pedidosAnt?.reduce((s, p) => s + Number(p.total), 0) || 0
    const ticketAnt       = totalPedidosAnt > 0 ? faturamentoAnt / totalPedidosAnt : 0

    // Horário de pico
    const contagemH = {}
    ;(pedidos || []).forEach(p => {
      const h = new Date(p.criado_em).getHours()
      contagemH[h] = (contagemH[h] || 0) + 1
    })
    const horaPico = Object.entries(contagemH).sort((a, b) => b[1] - a[1])[0]

    // Avaliação média
    const mediaAval = avaliacoes?.length
      ? avaliacoes.reduce((s, a) => s + (a.nota || 0), 0) / avaliacoes.length
      : null

    // Tempo médio de preparo (criado_em → atualizado_em dos pedidos prontos/entregues)
    const pedidosProcessados = (pedidos || []).filter(p => ['pronto', 'entregue', 'baixa'].includes(p.status) && p.atualizado_em)
    const tempoMedio = pedidosProcessados.length > 0
      ? pedidosProcessados.reduce((s, p) => s + (new Date(p.atualizado_em) - new Date(p.criado_em)), 0) / pedidosProcessados.length
      : null

    // Gráfico
    const grafico = (() => {
      if (periodo === 'hoje') {
        const horas = {}
        for (let h = 0; h < 24; h++) horas[h] = 0
        ;(pedidos || []).forEach(p => {
          const h = new Date(p.criado_em).getHours()
          horas[h] += Number(p.total)
        })
        return Object.entries(horas)
          .filter(([h]) => Number(h) <= new Date().getHours())
          .map(([h, v]) => ({ label: `${h}h`, valor: Number(v.toFixed(2)) }))
      } else {
        const dias = {}
        ;(pedidos || []).forEach(p => {
          const d = fmtData(p.criado_em)
          dias[d] = (dias[d] || 0) + Number(p.total)
        })
        return Object.entries(dias).map(([d, v]) => ({ label: d, valor: Number(v.toFixed(2)) }))
      }
    })()

    // Top produtos
    const contagem = {}
    const receitaProd = {}
    itensTodos.forEach(i => {
      contagem[i.nome_snapshot]    = (contagem[i.nome_snapshot]    || 0) + i.quantidade
      receitaProd[i.nome_snapshot] = (receitaProd[i.nome_snapshot] || 0) + (Number(i.preco_snapshot) * i.quantidade)
    })
    const topProdutos = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([nome, qtd]) => ({ nome, qtd, receita: receitaProd[nome] || 0 }))

    // Insights
    const insights = gerarInsights({ pedidos: pedidos || [], itens: itensTodos, avaliacoes: avaliacoes || [], produtos: produtos || [], caixas: caixas || [] })

    // Comparativos
    const comp = {
      faturamento: calcVariacao(faturamento, faturamentoAnt),
      pedidos:     calcVariacao(totalPedidos, totalPedidosAnt),
      ticket:      calcVariacao(ticket, ticketAnt),
    }

    setDados({ totalPedidos, faturamento, ticket, totalItens, horaPico, mediaAval, tempoMedio, grafico, topProdutos, caixas: caixas || [], avaliacoes: avaliacoes || [], insights, comp })
    setLoading(false)
  }

  function exportarPDF() {
    window.print()
  }

  return (
    <div className="rel-wrap">

      {/* ── Topbar ── */}
      <div className="rel-topbar">
        <div>
          <h1>📊 Relatórios</h1>
          <p>Análise de desempenho do estabelecimento</p>
        </div>
        <div className="rel-topbar-dir">
          <div className="rel-periodos">
            {PERIODOS.map(p => (
              <button key={p.id} className={`rel-periodo-btn ${periodo === p.id ? 'active' : ''}`} onClick={() => setPeriodo(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="rel-btn-pdf" onClick={exportarPDF}>
            <FileDown size={15}/> Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rel-loading">Carregando relatório...</div>
      ) : (
        <>
          {/* ── Métricas ── */}
          <div className="rel-metrics">
            {[
              { icon: <DollarSign size={18}/>, label: 'Faturamento',     valor: fmt(dados.faturamento),                                   sub: `${dados.totalPedidos} pedidos`,     comp: dados.comp.faturamento },
              { icon: <ShoppingBag size={18}/>,label: 'Pedidos',         valor: dados.totalPedidos,                                        sub: 'no período',                        comp: dados.comp.pedidos },
              { icon: <Receipt size={18}/>,    label: 'Ticket Médio',    valor: dados.totalPedidos > 0 ? fmt(dados.ticket) : '—',          sub: 'por pedido',                        comp: dados.comp.ticket },
              { icon: <Package size={18}/>,    label: 'Itens Vendidos',  valor: dados.totalItens,                                          sub: 'unidades',                          comp: null },
              { icon: <Timer size={18}/>,      label: 'Tempo de Preparo',valor: dados.tempoMedio ? calcDuracao(dados.tempoMedio) : '—',   sub: 'média por pedido',                  comp: null },
              { icon: <Clock size={18}/>,      label: 'Horário de Pico', valor: dados.horaPico ? `${dados.horaPico[0]}h` : '—',           sub: dados.horaPico ? `${dados.horaPico[1]} pedidos` : 'sem dados', comp: null },
              { icon: <Star size={18}/>,       label: 'Avaliação',       valor: dados.mediaAval ? dados.mediaAval.toFixed(1) : '—',       sub: `${dados.avaliacoes.length} avaliações`, comp: null },
            ].map(m => {
              const subindo = m.comp > 0
              const caindo  = m.comp < 0
              return (
                <div key={m.label} className="rel-metric">
                  <div className="rel-metric-topo">
                    <div className="rel-metric-icon">{m.icon}</div>
                    {m.comp !== null && (
                      <div className={`rel-comp ${subindo ? 'rel-comp--up' : caindo ? 'rel-comp--down' : 'rel-comp--neutro'}`}>
                        {subindo ? <TrendingUp size={12}/> : caindo ? <TrendingDown size={12}/> : <Minus size={12}/>}
                        {m.comp !== null ? `${Math.abs(m.comp).toFixed(1)}%` : '—'}
                      </div>
                    )}
                  </div>
                  <div className="rel-metric-label">{m.label}</div>
                  <div className="rel-metric-valor">{m.valor}</div>
                  <div className="rel-metric-sub">{m.sub}</div>
                </div>
              )
            })}
          </div>

          {/* ── Gráfico ── */}
          <div className="rel-card">
            <h3 className="rel-card-titulo"><BarChart2 size={16}/> Faturamento {periodo === 'hoje' ? 'por hora' : 'por dia'}</h3>
            {dados.grafico.length === 0 ? (
              <p className="rel-vazio">Nenhum dado para o período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dados.grafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FFB84D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FFB84D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="label" tick={{ fill: '#555', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }}
                    formatter={v => [fmt(v), 'Faturamento']}
                    labelStyle={{ color: '#FFB84D', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#FFB84D" strokeWidth={2.5} fill="url(#gradFat)" dot={false} activeDot={{ r: 5, fill: '#FFB84D' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rel-grid">

            {/* ── Top Produtos ── */}
            <div className="rel-card">
              <h3 className="rel-card-titulo"><Trophy size={16}/> Produtos Mais Vendidos</h3>
              {dados.topProdutos.length === 0 ? (
                <p className="rel-vazio">Nenhum produto vendido no período.</p>
              ) : (
                <div className="rel-ranking">
                  {dados.topProdutos.map((p, i) => {
                    const max = dados.topProdutos[0].qtd
                    return (
                      <div key={p.nome} className="rel-rank-item">
                        <span className="rel-rank-pos">#{i + 1}</span>
                        <div className="rel-rank-info">
                          <div className="rel-rank-topo">
                            <span className="rel-rank-nome">{p.nome}</span>
                            <span className="rel-rank-receita">{fmt(p.receita)}</span>
                          </div>
                          <div className="rel-rank-bar">
                            <div className="rel-rank-fill" style={{ width: `${(p.qtd / max) * 100}%` }} />
                          </div>
                        </div>
                        <span className="rel-rank-qtd">{p.qtd}x</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Insights ── */}
            <div className="rel-card">
              <h3 className="rel-card-titulo"><Lightbulb size={16}/> Insights & Sugestões</h3>
              <div className="rel-insights">
                {dados.insights.map((ins, i) => (
                  <div key={i} className={`rel-insight rel-insight--${ins.tipo}`}>
                    <span className="rel-insight-icon">{ins.icone}</span>
                    <div>
                      <div className="rel-insight-titulo">{ins.titulo}</div>
                      <div className="rel-insight-texto">{ins.texto}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Avaliações ── */}
          {dados.avaliacoes.length > 0 && (
            <div className="rel-card">
              <h3 className="rel-card-titulo"><Star size={16}/> Avaliações do Período</h3>
              <div className="rel-avals">
                {[
                  { label: '🍽️ Comida',      campo: 'nota_comida' },
                  { label: '😊 Atendimento', campo: 'nota_atendimento' },
                  { label: '🏠 Ambiente',    campo: 'nota_ambiente' },
                ].map(cat => {
                  const media = dados.avaliacoes.reduce((s, a) => s + (a[cat.campo] || 0), 0) / dados.avaliacoes.length
                  return (
                    <div key={cat.label} className="rel-aval-item">
                      <span className="rel-aval-label">{cat.label}</span>
                      <div className="rel-aval-bar">
                        <div className="rel-aval-fill" style={{ width: `${(media / 5) * 100}%` }} />
                      </div>
                      <span className="rel-aval-nota">{media.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Histórico de Caixas ── */}
          {dados.caixas.length > 0 && (
            <div className="rel-card">
              <h3 className="rel-card-titulo"><Archive size={16}/> Histórico de Caixas</h3>
              <table className="rel-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Abertura</th>
                    <th>Fechamento</th>
                    <th>Pedidos</th>
                    <th>Faturamento</th>
                    <th>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.caixas.map(c => (
                    <tr key={c.id}>
                      <td>{fmtData(c.aberto_em)}</td>
                      <td>{fmtHora(c.aberto_em)}</td>
                      <td>{fmtHora(c.fechado_em)}</td>
                      <td>{c.total_pedidos ?? '—'}</td>
                      <td className="rel-table-val">{fmt(c.faturamento ?? 0)}</td>
                      <td>{c.total_pedidos ? fmt((c.faturamento ?? 0) / c.total_pedidos) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </>
      )}
    </div>
  )
}
