import './ModalProduto.css'
import { X, Check, Plus, Minus, ShoppingCart, ChevronRight, Droplets, Citrus } from 'lucide-react'
import { useState } from 'react'

const DESCONTO_COMBO        = 4.00
const DESCONTO_COMBO_FAMILIA = 8.00
const QTD_REFRI_FAMILIA      = 2

function ModalProduto({ produto, produtos = [], onFechar, onAdicionar }) {
  const ehBebida  = produto.categoria === 'bebidas'
  const ehDoce    = produto.categoria === 'esfihas-doces'
  const ehSalgada = produto.categoria === 'esfihas'
  const temCombo  = ehDoce || ehSalgada

  /* ── estado geral ── */
  const [passo,       setPasso]       = useState(0)
  const [retirados,   setRetirados]   = useState([])
  const [quantidade,  setQuantidade]  = useState(1)
  const [observacao,  setObservacao]  = useState('')

  /* ── bebida principal ── */
  const [copos,  setCopos]  = useState(1)
  const [gelo,   setGelo]   = useState(false)
  const [limao,  setLimao]  = useState(false)

  /* ── combo normal ── */
  const [tipoCombo,     setTipoCombo]     = useState(null) // null | 'normal' | 'familia'
  const [comboEsfihas,  setComboEsfihas]  = useState([])
  const [comboBebida,   setComboBebida]   = useState(null)
  const [comboCopos,    setComboCopos]    = useState(1)
  const [comboGelo,     setComboGelo]     = useState(false)
  const [comboLimao,    setComboLimao]    = useState(false)

  /* ── combo família ── */
  const [familiaEsfihas,  setFamiliaEsfihas]  = useState([])
  const [familiaRefris,   setFamiliaRefris]   = useState([])   // até 2 escolhidos
  const [familiaRefriOpts, setFamiliaRefriOpts] = useState({}) // { [id]: { copos, gelo, limao } }

  /* ── listas de produtos ── */
  const esfihasCombo = produtos.filter(p =>
    p.disponivel !== false && p.id !== produto.id &&
    (ehDoce ? p.categoria === 'esfihas' : p.categoria === 'esfihas-doces')
  )
  const esfihasSalgadas = produtos.filter(p =>
    p.disponivel !== false && p.id !== produto.id && p.categoria === 'esfihas'
  )
  const bebidas = produtos.filter(p => p.disponivel !== false && p.categoria === 'bebidas')

  /* ── ingredientes padrão ── */
  const ingredientes = Array.isArray(produto.ingredientes) && produto.ingredientes.length > 0
    ? produto.ingredientes
    : ['Cebola', 'Tomate', 'Pimenta', 'Salsa']

  /* ── passos dinâmicos ── */
  const passos = [
    { id: 'retirar',    label: 'Retirar ingredientes', sub: 'Opcional'  },
    ...(temCombo ? [{ id: 'combo', label: 'Transformar em Combo', sub: 'Opcional' }] : []),
    ...(ehBebida ? [{ id: 'bebida-opcoes', label: 'Personalizar bebida', sub: 'Opcional' }] : []),
    { id: 'quantidade', label: 'Quantidade', sub: 'Selecione' },
  ]
  const passoAtual = passos[passo]

  /* ── preços ── */
  const precoBase = produto.precoPromo ?? produto.preco

  function calcPrecoCombo() {
    if (tipoCombo === 'normal') {
      const pEsf = comboEsfihas.reduce((s, id) => {
        const p = produtos.find(x => x.id === id)
        return s + (p?.precoPromo ?? p?.preco ?? 0)
      }, 0)
      const pBeb = (() => { const b = produtos.find(x => x.id === comboBebida); return b ? (b.precoPromo ?? b.preco) : 0 })()
      const temSelecao = comboEsfihas.length > 0 || comboBebida
      return pEsf + pBeb - (temSelecao ? DESCONTO_COMBO : 0)
    }
    if (tipoCombo === 'familia') {
      const pEsf = familiaEsfihas.reduce((s, id) => {
        const p = produtos.find(x => x.id === id)
        return s + (p?.precoPromo ?? p?.preco ?? 0)
      }, 0)
      const pBeb = familiaRefris.reduce((s, id) => {
        const b = produtos.find(x => x.id === id)
        return s + (b?.precoPromo ?? b?.preco ?? 0)
      }, 0)
      const temSelecao = familiaEsfihas.length > 0 || familiaRefris.length > 0
      return pEsf + pBeb - (temSelecao ? DESCONTO_COMBO_FAMILIA : 0)
    }
    return 0
  }

  const precoUnit  = precoBase + calcPrecoCombo()
  const precoTotal = precoUnit * quantidade

  /* ── helpers ── */
  function toggleRetirar(ing) {
    setRetirados(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing])
  }
  function toggleComboEsfiha(id) {
    setComboEsfihas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  function toggleFamiliaEsfiha(id) {
    setFamiliaEsfihas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  function toggleFamiliaRefri(id) {
    setFamiliaRefris(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= QTD_REFRI_FAMILIA) return prev
      return [...prev, id]
    })
    setFamiliaRefriOpts(prev => ({
      ...prev,
      [id]: prev[id] ?? { copos: 1, gelo: false, limao: false }
    }))
  }
  function updateFamiliaRefriOpt(id, key, val) {
    setFamiliaRefriOpts(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }))
  }

  /* ── validação do passo combo ── */
  const comboPronto = (() => {
    if (!tipoCombo) return true // vai pular
    if (tipoCombo === 'normal')  return comboEsfihas.length > 0 && !!comboBebida
    if (tipoCombo === 'familia') return familiaEsfihas.length > 0 && familiaRefris.length === QTD_REFRI_FAMILIA
    return false
  })()

  function avancar() {
    if (passo < passos.length - 1) setPasso(p => p + 1)
    else confirmar()
  }

  function confirmar() {
    const itensCombo = tipoCombo === 'normal'
      ? [
          ...comboEsfihas.map(id => produtos.find(p => p.id === id)).filter(Boolean),
          comboBebida ? { ...produtos.find(p => p.id === comboBebida), copos: comboCopos, gelo: comboGelo, limao: comboLimao } : null,
        ].filter(Boolean)
      : tipoCombo === 'familia'
      ? [
          ...familiaEsfihas.map(id => produtos.find(p => p.id === id)).filter(Boolean),
          ...familiaRefris.map(id => {
            const b = produtos.find(p => p.id === id)
            const opt = familiaRefriOpts[id] ?? {}
            return b ? { ...b, copos: opt.copos ?? 1, gelo: opt.gelo ?? false, limao: opt.limao ?? false } : null
          }).filter(Boolean),
        ]
      : []

    onAdicionar({
      ...produto,
      quantidade,
      preco: precoUnit,
      extras: {
        retirados,
        tipoCombo,
        itensCombo,
        copos:  ehBebida ? copos  : undefined,
        gelo:   ehBebida ? gelo   : undefined,
        limao:  ehBebida ? limao  : undefined,
        observacao,
      },
    })
    onFechar()
  }

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="mp-overlay" onClick={onFechar}>
      <div className="mp-sheet" onClick={e => e.stopPropagation()}>

        <button className="mp-fechar" onClick={onFechar}><X size={16} /></button>

        {/* ══ ESQUERDA ══ */}
        <div className="mp-esq">
          <div className="mp-foto-wrap">
            {produto.imagem
              ? <img src={produto.imagem} alt={produto.nome} className="mp-foto-img" />
              : <div className="mp-foto-placeholder">🫓</div>
            }
            {produto.badge && <span className="mp-badge">{produto.badge}</span>}
          </div>

          <div className="mp-info">
            <p className="mp-categoria">{produto.categoria}</p>
            <h2 className="mp-nome">{produto.nome}</h2>
            {produto.descricao && <p className="mp-desc">{produto.descricao}</p>}
          </div>

          <div className="mp-etapas">
            {passos.map((p, i) => {
              const estado = i < passo ? 'feito' : i === passo ? 'ativo' : 'pendente'
              return (
                <div key={p.id} className={`mp-etapa mp-etapa--${estado}`}>
                  <div className="mp-etapa-num">
                    {estado === 'feito' ? <Check size={12} /> : i + 1}
                  </div>
                  <div className="mp-etapa-texto">
                    <span className="mp-etapa-label">{p.label}</span>
                    <span className="mp-etapa-sub">{p.sub}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mp-subtotal">
            <span className="mp-subtotal-label">Subtotal</span>
            <span className="mp-subtotal-valor">R$ {precoTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* ══ DIREITA ══ */}
        <div className="mp-dir">

          {/* cabeçalho */}
          <div className="mp-passo-header">
            {passoAtual?.id === 'retirar' && <>
              <h3 className="mp-passo-titulo">Deseja retirar algo?</h3>
              <p className="mp-passo-sub">Opcional · selecione os ingredientes que deseja remover</p>
            </>}
            {passoAtual?.id === 'combo' && <>
              <h3 className="mp-passo-titulo">Monte seu Combo! 🔥</h3>
              <p className="mp-passo-sub">Escolha o tipo de combo e personalize do seu jeito</p>
            </>}
            {passoAtual?.id === 'bebida-opcoes' && <>
              <h3 className="mp-passo-titulo">Personalizar bebida</h3>
              <p className="mp-passo-sub">Opcional · customize como você prefere</p>
            </>}
            {passoAtual?.id === 'quantidade' && <>
              <h3 className="mp-passo-titulo">Quantidade</h3>
              <p className="mp-passo-sub">Quantas unidades você quer?</p>
            </>}
          </div>

          {/* corpo */}
          <div className="mp-passo-corpo">

            {/* ── Retirar ingredientes ── */}
            {passoAtual?.id === 'retirar' && (
              <div className="mp-opcoes">
                {ingredientes.map(ing => {
                  const ativo = retirados.includes(ing)
                  return (
                    <div key={ing} className={`mp-opcao ${ativo ? 'mp-opcao--ativa' : ''}`} onClick={() => toggleRetirar(ing)}>
                      <div className="mp-opcao-esq">
                        <div className="mp-check">{ativo && <Check size={11} />}</div>
                        <span className="mp-opcao-texto">Sem {ing.toLowerCase()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Combo ── */}
            {passoAtual?.id === 'combo' && (
              <div className="mp-combo-wrap">

                {/* Tipo de combo */}
                <div className="mp-opcoes">
                  {/* Combo Normal */}
                  <div className={`mp-opcao ${tipoCombo === 'normal' ? 'mp-opcao--ativa' : ''}`}
                    onClick={() => { setTipoCombo(t => t === 'normal' ? null : 'normal'); setComboEsfihas([]); setComboBebida(null) }}>
                    <div className="mp-opcao-esq">
                      <div className="mp-radio">{tipoCombo === 'normal' && <div className="mp-radio-dot" />}</div>
                      <div>
                        <div className="mp-opcao-texto">Combo — Esfiha + Bebida</div>
                        <div className="mp-opcao-extra">Escolha {ehSalgada ? 'esfiha doce' : 'esfiha salgada'} + 1 bebida · economize R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Combo Família */}
                  <div className={`mp-opcao ${tipoCombo === 'familia' ? 'mp-opcao--ativa' : ''}`}
                    onClick={() => { setTipoCombo(t => t === 'familia' ? null : 'familia'); setFamiliaEsfihas([]); setFamiliaRefris([]) }}>
                    <div className="mp-opcao-esq">
                      <div className="mp-radio">{tipoCombo === 'familia' && <div className="mp-radio-dot" />}</div>
                      <div>
                        <div className="mp-opcao-texto">Combo Família 👨‍👩‍👧‍👦</div>
                        <div className="mp-opcao-extra">Esfihas salgadas à escolha + {QTD_REFRI_FAMILIA} refrigerantes lata · economize R$ {DESCONTO_COMBO_FAMILIA.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Seleção Combo Normal ── */}
                {tipoCombo === 'normal' && (
                  <>
                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">{ehSalgada ? '🍬 Esfihas Doces' : '🧅 Esfihas Salgadas'}</p>
                      <div className="mp-combo-grid">
                        {esfihasCombo.map(p => {
                          const sel = comboEsfihas.includes(p.id)
                          return (
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`}
                              onClick={() => toggleComboEsfiha(p.id)}>
                              {p.imagem
                                ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" />
                                : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🫓</div>
                              }
                              <div className="mp-combo-card-info">
                                <span className="mp-combo-card-nome">{p.nome}</span>
                                <span className="mp-combo-card-preco">R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}</span>
                              </div>
                              {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">🥤 Bebida</p>
                      <div className="mp-combo-grid">
                        {bebidas.map(p => {
                          const sel = comboBebida === p.id
                          return (
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`}
                              onClick={() => setComboBebida(sel ? null : p.id)}>
                              {p.imagem
                                ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" />
                                : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🥤</div>
                              }
                              <div className="mp-combo-card-info">
                                <span className="mp-combo-card-nome">{p.nome}</span>
                                <span className="mp-combo-card-preco">R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}</span>
                              </div>
                              {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Opções da bebida do combo normal */}
                    {comboBebida && (
                      <div className="mp-bebida-opts">
                        <p className="mp-combo-secao-titulo">⚙️ Opções da bebida</p>
                        <div className="mp-bebida-opts-linha">
                          <span className="mp-bebida-opts-label">Copos</span>
                          <div className="mp-mini-contador">
                            <button className="mp-mini-btn" onClick={() => setComboCopos(c => Math.max(1, c - 1))}><Minus size={13} /></button>
                            <span className="mp-mini-num">{comboCopos}</span>
                            <button className="mp-mini-btn" onClick={() => setComboCopos(c => c + 1)}><Plus size={13} /></button>
                          </div>
                        </div>
                        <div className="mp-bebida-opts-toggles">
                          <button className={`mp-toggle ${comboGelo ? 'mp-toggle--ativo' : ''}`} onClick={() => setComboGelo(v => !v)}>
                            <Droplets size={14} /> Gelo
                          </button>
                          <button className={`mp-toggle ${comboLimao ? 'mp-toggle--ativo' : ''}`} onClick={() => setComboLimao(v => !v)}>
                            <Citrus size={14} /> Limão
                          </button>
                        </div>
                      </div>
                    )}

                    {(comboEsfihas.length > 0 || comboBebida) && (
                      <div className="mp-combo-resumo">
                        <span>🎉 Desconto aplicado:</span>
                        <span className="mp-combo-resumo-val">− R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </>
                )}

                {/* ── Seleção Combo Família ── */}
                {tipoCombo === 'familia' && (
                  <>
                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">🧅 Esfihas Salgadas (à vontade)</p>
                      <div className="mp-combo-grid">
                        {esfihasSalgadas.map(p => {
                          const sel = familiaEsfihas.includes(p.id)
                          return (
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`}
                              onClick={() => toggleFamiliaEsfiha(p.id)}>
                              {p.imagem
                                ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" />
                                : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🫓</div>
                              }
                              <div className="mp-combo-card-info">
                                <span className="mp-combo-card-nome">{p.nome}</span>
                                <span className="mp-combo-card-preco">R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}</span>
                              </div>
                              {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">🥤 Refrigerantes Lata — escolha {QTD_REFRI_FAMILIA} ({familiaRefris.length}/{QTD_REFRI_FAMILIA})</p>
                      <div className="mp-combo-grid">
                        {bebidas.map(p => {
                          const sel = familiaRefris.includes(p.id)
                          const bloqueado = !sel && familiaRefris.length >= QTD_REFRI_FAMILIA
                          return (
                            <div key={p.id}
                              className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''} ${bloqueado ? 'mp-combo-card--bloqueado' : ''}`}
                              onClick={() => !bloqueado && toggleFamiliaRefri(p.id)}>
                              {p.imagem
                                ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" />
                                : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🥤</div>
                              }
                              <div className="mp-combo-card-info">
                                <span className="mp-combo-card-nome">{p.nome}</span>
                                <span className="mp-combo-card-preco">R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}</span>
                              </div>
                              {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Opções de cada bebida família */}
                    {familiaRefris.length > 0 && (
                      <div className="mp-combo-secao">
                        <p className="mp-combo-secao-titulo">⚙️ Opções das bebidas</p>
                        {familiaRefris.map(id => {
                          const b   = produtos.find(p => p.id === id)
                          const opt = familiaRefriOpts[id] ?? { copos: 1, gelo: false, limao: false }
                          return (
                            <div key={id} className="mp-bebida-opts">
                              <p className="mp-bebida-opts-nome">{b?.nome}</p>
                              <div className="mp-bebida-opts-linha">
                                <span className="mp-bebida-opts-label">Copos</span>
                                <div className="mp-mini-contador">
                                  <button className="mp-mini-btn" onClick={() => updateFamiliaRefriOpt(id, 'copos', Math.max(1, opt.copos - 1))}><Minus size={13} /></button>
                                  <span className="mp-mini-num">{opt.copos}</span>
                                  <button className="mp-mini-btn" onClick={() => updateFamiliaRefriOpt(id, 'copos', opt.copos + 1)}><Plus size={13} /></button>
                                </div>
                              </div>
                              <div className="mp-bebida-opts-toggles">
                                <button className={`mp-toggle ${opt.gelo ? 'mp-toggle--ativo' : ''}`} onClick={() => updateFamiliaRefriOpt(id, 'gelo', !opt.gelo)}>
                                  <Droplets size={14} /> Gelo
                                </button>
                                <button className={`mp-toggle ${opt.limao ? 'mp-toggle--ativo' : ''}`} onClick={() => updateFamiliaRefriOpt(id, 'limao', !opt.limao)}>
                                  <Citrus size={14} /> Limão
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {(familiaEsfihas.length > 0 || familiaRefris.length > 0) && (
                      <div className="mp-combo-resumo">
                        <span>🎉 Desconto Família aplicado:</span>
                        <span className="mp-combo-resumo-val">− R$ {DESCONTO_COMBO_FAMILIA.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </>
                )}

              </div>
            )}

            {/* ── Bebida principal ── */}
            {passoAtual?.id === 'bebida-opcoes' && (
              <div className="mp-bebida-principal">
                <div className="mp-bebida-opts">
                  <div className="mp-bebida-opts-linha">
                    <span className="mp-bebida-opts-label">Quantidade de copos</span>
                    <div className="mp-mini-contador">
                      <button className="mp-mini-btn" onClick={() => setCopos(c => Math.max(1, c - 1))}><Minus size={13} /></button>
                      <span className="mp-mini-num">{copos}</span>
                      <button className="mp-mini-btn" onClick={() => setCopos(c => c + 1)}><Plus size={13} /></button>
                    </div>
                  </div>
                  <div className="mp-bebida-opts-toggles">
                    <button className={`mp-toggle mp-toggle--lg ${gelo ? 'mp-toggle--ativo' : ''}`} onClick={() => setGelo(v => !v)}>
                      <Droplets size={16} /> Gelo
                    </button>
                    <button className={`mp-toggle mp-toggle--lg ${limao ? 'mp-toggle--ativo' : ''}`} onClick={() => setLimao(v => !v)}>
                      <Citrus size={16} /> Limão
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quantidade ── */}
            {passoAtual?.id === 'quantidade' && (
              <div className="mp-qtd-wrap">
                <div className="mp-contador">
                  <button className="mp-contador-btn" onClick={() => setQuantidade(q => Math.max(1, q - 1))}><Minus size={18} /></button>
                  <span className="mp-contador-num">{quantidade}</span>
                  <button className="mp-contador-btn" onClick={() => setQuantidade(q => q + 1)}><Plus size={18} /></button>
                </div>
                <textarea
                  className="mp-obs"
                  placeholder="Alguma observação? Ex: sem molho, bem assada..."
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                />
              </div>
            )}

          </div>

          {/* rodapé */}
          <div className="mp-passo-footer">
            {passoAtual?.id === 'quantidade' ? (
              <button className="mp-btn-principal" onClick={confirmar}>
                <ShoppingCart size={18} />
                Adicionar ao Carrinho · R$ {precoTotal.toFixed(2).replace('.', ',')}
              </button>
            ) : (
              <button
                className={`mp-btn-pular ${
                  (passoAtual?.id === 'retirar'      && retirados.length > 0) ||
                  (passoAtual?.id === 'combo'        && tipoCombo && comboPronto) ||
                  (passoAtual?.id === 'bebida-opcoes' && (gelo || limao || copos > 1))
                    ? 'mp-btn-pular--ativo' : ''
                }`}
                disabled={passoAtual?.id === 'combo' && tipoCombo && !comboPronto}
                onClick={avancar}
              >
                {passoAtual?.id === 'combo' && tipoCombo && !comboPronto
                  ? tipoCombo === 'familia'
                    ? `Escolha ${familiaEsfihas.length === 0 ? 'esfihas e ' : ''}${familiaRefris.length < QTD_REFRI_FAMILIA ? `${QTD_REFRI_FAMILIA - familiaRefris.length} refrigerante(s)` : ''}`
                    : 'Escolha esfiha e bebida'
                  : (retirados.length > 0 || (tipoCombo && comboPronto) || gelo || limao || copos > 1)
                    ? <><span>Avançar</span><ChevronRight size={16} /></>
                    : 'Pular'
                }
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default ModalProduto
