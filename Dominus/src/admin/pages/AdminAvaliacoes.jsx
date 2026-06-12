import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Star, Utensils, CupSoda, Armchair, Smile, Music, Frown } from 'lucide-react'
import './AdminAvaliacoes.css'

function Estrelas({ nota }) {
  return (
    <div className="av-estrelas">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={`av-estrela ${n <= nota ? 'ativa' : ''}`}>★</span>
      ))}
    </div>
  )
}

export default function AdminAvaliacoes() {
  const [avaliacoes,  setAvaliacoes]  = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    carregar()

    const channel = supabase
      .channel('admin-avaliacoes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'avaliacoes' }, carregar)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function carregar() {
    const { data } = await supabase
      .from('avaliacoes')
      .select('*')
      .order('criado_em', { ascending: false })

    if (data) {
      setAvaliacoes(data)

      const media = (campo) =>
        data.length > 0 ? data.reduce((s, a) => s + (a[campo] || 0), 0) / data.length : 0

      setStats({
        total:        data.length,
        media:        media('nota'),
        comida:       media('nota_comida'),
        bebida:       media('nota_bebida'),
        atendimento:  media('nota_atendimento'),
        ambiente:     media('nota_ambiente'),
        musica:       media('nota_musica'),
      })
    }
    setLoading(false)
  }

  const fmtData = (iso) => new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="av-wrap">
      <div className="av-topbar">
        <div>
          <h1><Star size={22} className="av-title-icone" /> Avaliações</h1>
          <p>{stats?.total ?? 0} avaliações recebidas</p>
        </div>
      </div>

      {loading ? (
        <div className="av-loading">Carregando avaliações...</div>
      ) : (
        <>
          {/* ── Resumo ── */}
          {stats && stats.total > 0 && (
            <div className="av-resumo">
              <div className="av-resumo-destaque">
                <span className="av-nota-grande">{stats.media.toFixed(1)}</span>
                <Estrelas nota={Math.round(stats.media)} />
                <span className="av-total-label">{stats.total} avaliações</span>
              </div>
              <div className="av-resumo-categorias">
                {[
                  { label: 'Comida',      Icone: Utensils, val: stats.comida },
                  { label: 'Bebida',      Icone: CupSoda,  val: stats.bebida },
                  { label: 'Atendimento', Icone: Smile,    val: stats.atendimento },
                  { label: 'Ambiente',    Icone: Armchair, val: stats.ambiente },
                  { label: 'Música',      Icone: Music,    val: stats.musica },
                ].map(item => (
                  <div key={item.label} className="av-cat-item">
                    <span className="av-cat-label"><item.Icone size={16} strokeWidth={1.8} /> {item.label}</span>
                    <div className="av-cat-bar">
                      <div className="av-cat-fill" style={{ width: `${(item.val / 5) * 100}%` }} />
                    </div>
                    <span className="av-cat-nota">{item.val.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Lista ── */}
          {avaliacoes.length === 0 ? (
            <div className="av-vazio">
              <Frown size={48} strokeWidth={1.5} />
              <p>Nenhuma avaliação ainda.</p>
            </div>
          ) : (
            <div className="av-lista">
              {avaliacoes.map(a => (
                <div key={a.id} className="av-card">
                  <div className="av-card-topo">
                    <div className="av-card-esquerda">
                      <Estrelas nota={a.nota} />
                      {a.mesa && <span className="av-mesa">Mesa {a.mesa}</span>}
                      {a.comanda && <span className="av-mesa">Comanda {a.comanda}</span>}
                    </div>
                    <span className="av-data">{fmtData(a.criado_em)}</span>
                  </div>

                  {(a.nome || a.email) && (
                    <div className="av-cliente">
                      {a.nome && <span className="av-cliente-nome">{a.nome}</span>}
                      {a.email && <span className="av-cliente-email">{a.email}</span>}
                    </div>
                  )}

                  <div className="av-notas-detalhe">
                    {[
                      { label: 'Comida',      val: a.nota_comida },
                      { label: 'Bebida',      val: a.nota_bebida },
                      { label: 'Atendimento', val: a.nota_atendimento },
                      { label: 'Ambiente',    val: a.nota_ambiente },
                      { label: 'Música',      val: a.nota_musica },
                    ].map(item => item.val ? (
                      <span key={item.label} className="av-nota-tag">
                        {item.label}: {'★'.repeat(item.val)}{'☆'.repeat(5 - item.val)}
                      </span>
                    ) : null)}
                  </div>

                  {a.comentario && (
                    <p className="av-comentario">"{a.comentario}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
