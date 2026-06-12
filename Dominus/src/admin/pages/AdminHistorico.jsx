import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getExtrasLinhas } from '../../lib/formatExtras'
import './AdminHistorico.css'

const fmt     = (v)   => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function inicioDia(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function fimDia(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}
function diasAtras(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export default function AdminHistorico() {
  const [sessoes,   setSessoes]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtro,    setFiltro]    = useState('hoje')
  const [dataCustom, setDataCustom] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { carregar() }, [filtro, dataCustom])

  async function carregar() {
    setLoading(true)
    const { data: rest } = await supabase.from('restaurantes').select('id').eq('slug', 'dominus').single()

    let de, ate
    const hoje = new Date()

    if (filtro === 'hoje') {
      de  = inicioDia(hoje)
      ate = fimDia(hoje)
    } else if (filtro === 'ontem') {
      const ontem = diasAtras(1)
      de  = inicioDia(ontem)
      ate = fimDia(ontem)
    } else if (filtro === '7dias') {
      de  = inicioDia(diasAtras(6))
      ate = fimDia(hoje)
    } else if (filtro === '30dias') {
      de  = inicioDia(diasAtras(29))
      ate = fimDia(hoje)
    } else if (filtro === 'custom') {
      de  = inicioDia(new Date(dataCustom + 'T12:00:00'))
      ate = fimDia(new Date(dataCustom + 'T12:00:00'))
    }

    const { data } = await supabase
      .from('sessoes_comanda')
      .select('*, pedidos(*, itens_pedido(*))')
      .eq('restaurante_id', rest.id)
      .not('encerrada_em', 'is', null)
      .gte('encerrada_em', de)
      .lte('encerrada_em', ate)
      .order('encerrada_em', { ascending: false })

    const com_total = (data || []).map(s => ({
      ...s,
      pedidos: (s.pedidos || []).sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em)),
      total: (s.pedidos || []).reduce((acc, p) => acc + Number(p.total), 0),
    }))

    setSessoes(com_total)
    setLoading(false)
  }

  const totalArrecadado = sessoes.reduce((acc, s) => acc + s.total, 0)
  const ticketMedio     = sessoes.length > 0 ? totalArrecadado / sessoes.length : 0

  return (
    <div className="hist-wrap">
      <div className="hist-topbar">
        <div>
          <h1>📋 Histórico de Comandas</h1>
          <p>Todas as comandas encerradas · filtre por data</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="hist-filtros">
        {[
          { key: 'hoje',   label: 'Hoje' },
          { key: 'ontem',  label: 'Ontem' },
          { key: '7dias',  label: '7 dias' },
          { key: '30dias', label: '30 dias' },
        ].map(f => (
          <button
            key={f.key}
            className={`hist-fil-btn${filtro === f.key ? ' active' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
        <input
          className="hist-fil-data"
          type="date"
          value={dataCustom}
          onChange={e => { setDataCustom(e.target.value); setFiltro('custom') }}
        />
      </div>

      {/* Resumo */}
      <div className="hist-resumo">
        <div className="hist-res-card">
          <div className="hist-res-label">Total arrecadado</div>
          <div className="hist-res-valor amarelo">{fmt(totalArrecadado)}</div>
        </div>
        <div className="hist-res-card">
          <div class="hist-res-label">Comandas atendidas</div>
          <div className="hist-res-valor branco">{sessoes.length}</div>
        </div>
        <div className="hist-res-card">
          <div className="hist-res-label">Ticket médio</div>
          <div className="hist-res-valor verde">{fmt(ticketMedio)}</div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="hist-loading">Carregando histórico...</div>
      ) : sessoes.length === 0 ? (
        <div className="hist-vazio">
          <span>📭</span>
          <p>Nenhuma comanda encerrada neste período.</p>
        </div>
      ) : (
        <div className="hist-lista">
          {sessoes.map(sessao => (
            <div key={sessao.id} className="hist-card">
              <div className="hist-card-header">
                <div className="hist-card-esq">
                  <span className="hist-cod">{sessao.codigo}</span>
                  {sessao.mesa && <span className="hist-mesa">Mesa {sessao.mesa}</span>}
                </div>
                <div className="hist-card-dir">
                  <span className="hist-horario">
                    {fmtHora(sessao.aberta_em)} → {fmtHora(sessao.encerrada_em)}
                  </span>
                  <span className="hist-total">{fmt(sessao.total)}</span>
                  <span className="hist-enc-tag">Encerrada</span>
                </div>
              </div>

              <div className="hist-itens">
                {sessao.pedidos.flatMap(p => p.itens_pedido || []).map(item => (
                  <div key={item.id} className="hist-item">
                    <div className="hist-item-linha">
                      <span className="hist-item-qtd">{item.quantidade}x</span>
                      <span className="hist-item-nome">{item.nome_snapshot}</span>
                      {item.observacao && <span className="hist-item-obs">— {item.observacao}</span>}
                      <span className="hist-item-preco">{fmt(Number(item.preco_snapshot) * item.quantidade)}</span>
                    </div>
                    {getExtrasLinhas(item.extras).map((linha, idx) => (
                      <div key={idx} className="hist-item-extra">{linha}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
