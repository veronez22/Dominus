import './ModalProduto.css'
import { X, Check, Plus, Minus, ShoppingCart, ChevronRight, Droplets, Citrus, Flame } from 'lucide-react'
import { useState } from 'react'

const DESCONTO_COMBO         = 4.00
const DESCONTO_COMBO_FAMILIA = 8.00
const QTD_REFRI_FAMILIA      = 2

const TAMANHOS_REFRI = [
  { id: 'lata',  label: 'Lata',  desc: '350 ml' },
  { id: 'ks',    label: 'KS',    desc: '473 ml' },
  { id: '600ml', label: '600 ml',desc: 'Garrafa Pet' },
]

const TURBINAR_LABEL = {
  'esfihas':    'Turbine sua Esfiha',
  'fogazzas':   'Turbine sua Fogazza',
  'kibes':      'Turbine seu Kibe',
  'cigarretes': 'Turbine seu Cigarrete',
  'coxinhas':   'Turbine sua Coxinha',
}

const ADICIONAIS_POOL = [
  { id: 'catupiry', label: 'Catupiry',     preco: 1.50 },
  { id: 'cheddar',  label: 'Cheddar',      preco: 1.50 },
  { id: 'bacon',    label: 'Bacon',        preco: 2.00 },
  { id: 'cebola',   label: 'Cebola extra', preco: 0.50 },
  { id: 'tomate',   label: 'Tomate extra', preco: 0.50 },
]

const INGREDIENTES_BASE = {
  'esfihas':    ['Cebola', 'Tomate', 'Pimenta', 'Cheiro-verde'],
  'fogazzas':   ['Tomate', 'Mussarela', 'Orégano'],
  'kibes':      ['Cebola', 'Hortelã', 'Pimenta'],
  'cigarretes': ['Cream Cheese', 'Presunto'],
  'coxinhas':   ['Cebola', 'Cheiro-verde'],
}

function nomeLow(nome = '') { return nome.toLowerCase() }

function getIngredientesRetirar(produto) {
  const n   = nomeLow(produto.nome)
  const cat = produto.categoria
  const base = [...(INGREDIENTES_BASE[cat] ?? [])]
  if (n.includes('catupiry'))                                   base.push('Catupiry')
  if (n.includes('cheddar'))                                    base.push('Cheddar')
  if (n.includes('bacon'))                                      base.push('Bacon')
  if (n.includes('calabresa'))                                  base.push('Calabresa')
  if (n.includes('mussarela') && !base.includes('Mussarela'))   base.push('Mussarela')
  if (n.includes('presunto')  && !base.includes('Presunto'))    base.push('Presunto')
  if (n.includes('cream cheese') && !base.includes('Cream Cheese')) base.push('Cream Cheese')
  if (n.includes('requeijão'))                                  base.push('Requeijão')
  if (n.includes('frango'))                                     base.push('Frango desfiado')
  if (n.includes('milho'))                                      base.push('Milho')
  return base
}

function getAdicionaisDisponiveis(produto) {
  const n = nomeLow(produto.nome)
  return ADICIONAIS_POOL.filter(a => {
    if (a.id === 'catupiry' && n.includes('catupiry')) return false
    if (a.id === 'cheddar'  && n.includes('cheddar'))  return false
    if (a.id === 'bacon'    && n.includes('bacon'))    return false
    return true
  })
}

function ehRefrigerante(nome = '') {
  const n = nomeLow(nome)
  return !n.includes('suco') && !n.includes('limonada') &&
         !n.includes('água') && !n.includes('agua') &&
         !n.includes('chá')  && !n.includes('cha')
}

function temLimaoNatural(nome = '') {
  const n = nomeLow(nome)
  return n.includes('limonada') || n.includes('limão') || n.includes('suco')
}

/* ═══════════════════════════════════════════ */
function ModalProduto({ produto, produtos = [], onFechar, onAdicionar }) {
  const ehBebida  = produto.categoria === 'bebidas'
  const ehDoce    = produto.categoria === 'esfihas-doces'
  const ehSalgada = produto.categoria === 'esfihas'
  const temCombo  = ehSalgada || ehDoce

  // Turbinar e Retirar: esfihas salgadas, fogazzas, kibes, cigarretes, coxinhas (NÃO doces)
  const temTurbinar = ['esfihas', 'fogazzas', 'kibes', 'cigarretes', 'coxinhas'].includes(produto.categoria)
  const temRetirar  = ['esfihas', 'fogazzas', 'kibes', 'cigarretes', 'coxinhas'].includes(produto.categoria)
  const isRefri     = ehBebida && ehRefrigerante(produto.nome)

  const ingredientesRetirar   = temRetirar  ? getIngredientesRetirar(produto)    : []
  const adicionaisDisponiveis = temTurbinar ? getAdicionaisDisponiveis(produto)   : []

  /* estado geral */
  const [passo,      setPasso]      = useState(0)
  const [adicionais, setAdicionais] = useState([])
  const [retirados,  setRetirados]  = useState([])
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState('')

  /* bebida principal */
  const [tamanho, setTamanho] = useState(null)
  const [copos,   setCopos]   = useState(1)
  const [gelo,    setGelo]    = useState(false)
  const [limao,   setLimao]   = useState(false)

  /* combo normal */
  const [tipoCombo,     setTipoCombo]     = useState(null)
  const [comboEsfihas,  setComboEsfihas]  = useState([])
  const [comboBebida,   setComboBebida]   = useState(null)
  const [comboTamanho,  setComboTamanho]  = useState(null)
  const [comboCopos,    setComboCopos]    = useState(1)
  const [comboGelo,     setComboGelo]     = useState(false)
  const [comboLimao,    setComboLimao]    = useState(false)
  const [comboSubPasso, setComboSubPasso] = useState(null)

  /* combo família */
  const [familiaEsfihas,   setFamiliaEsfihas]   = useState([])
  const [familiaRefris,    setFamiliaRefris]     = useState([])
  const [familiaRefriOpts, setFamiliaRefriOpts]  = useState({})
  const [familiaSubPasso,  setFamiliaSubPasso]   = useState(null)

  /* listas */
  const esfihasCombo    = produtos.filter(p => p.disponivel !== false && p.id !== produto.id &&
    (ehDoce ? p.categoria === 'esfihas' : p.categoria === 'esfihas-doces'))
  const esfihasSalgadas = produtos.filter(p => p.disponivel !== false && p.id !== produto.id && p.categoria === 'esfihas')
  const bebidas         = produtos.filter(p => p.disponivel !== false && p.categoria === 'bebidas')

  /* passos dinâmicos */
  const passos = [
    ...(temTurbinar && adicionaisDisponiveis.length > 0
      ? [{ id: 'turbinar', label: TURBINAR_LABEL[produto.categoria] ?? 'Turbine seu lanche', sub: 'Opcional' }] : []),
    ...(temRetirar
      ? [{ id: 'retirar',       label: 'Retirar ingredientes',  sub: 'Opcional' }] : []),
    ...(temCombo
      ? [{ id: 'combo',         label: 'Transformar em Combo',  sub: 'Opcional' }] : []),
    ...(ehBebida
      ? [{ id: 'bebida-opcoes', label: 'Personalizar bebida',   sub: 'Opcional' }] : []),
    { id: 'quantidade', label: 'Quantidade', sub: 'Selecione' },
  ]
  const passoAtual = passos[passo]

  /* preços */
  const precoBase = produto.precoPromo ?? produto.preco
  const totalAdicionais = adicionais.reduce((s, id) => {
    const a = ADICIONAIS_POOL.find(x => x.id === id); return s + (a?.preco ?? 0)
  }, 0)

  function calcPrecoCombo() {
    if (tipoCombo === 'normal') {
      const pEsf = comboEsfihas.reduce((s, id) => { const p = produtos.find(x => x.id === id); return s + (p?.precoPromo ?? p?.preco ?? 0) }, 0)
      const pBeb = (() => { const b = produtos.find(x => x.id === comboBebida); return b ? (b.precoPromo ?? b.preco) : 0 })()
      return pEsf + pBeb - ((comboEsfihas.length > 0 || comboBebida) ? DESCONTO_COMBO : 0)
    }
    if (tipoCombo === 'familia') {
      const pEsf = familiaEsfihas.reduce((s, id) => { const p = produtos.find(x => x.id === id); return s + (p?.precoPromo ?? p?.preco ?? 0) }, 0)
      const pBeb = familiaRefris.reduce((s, id) => { const b = produtos.find(x => x.id === id); return s + (b?.precoPromo ?? b?.preco ?? 0) }, 0)
      return pEsf + pBeb - ((familiaEsfihas.length > 0 || familiaRefris.length > 0) ? DESCONTO_COMBO_FAMILIA : 0)
    }
    return 0
  }

  const precoUnit  = precoBase + totalAdicionais + calcPrecoCombo()
  const precoTotal = precoUnit * quantidade

  /* helpers */
  function toggleAdicional(id)  { setAdicionais(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]) }
  function toggleRetirar(ing)   { setRetirados(p  => p.includes(ing) ? p.filter(i => i !== ing) : [...p, ing]) }
  function toggleComboEsfiha(id){ setComboEsfihas(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]) }
  function toggleFamiliaEsfiha(id){ setFamiliaEsfihas(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]) }

  function toggleFamiliaRefri(id) {
    setFamiliaRefris(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= QTD_REFRI_FAMILIA) return prev
      return [...prev, id]
    })
    setFamiliaRefriOpts(prev => ({ ...prev, [id]: prev[id] ?? { tamanho: null, copos: 1, gelo: false, limao: false } }))
  }
  function updateFamiliaOpt(id, key, val) {
    setFamiliaRefriOpts(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }))
  }

  function selecionarComboBebida(id) {
    if (comboBebida === id) { setComboBebida(null); setComboSubPasso(null); setComboTamanho(null); return }
    setComboBebida(id); setComboSubPasso('bebida-opts'); setComboTamanho(null)
  }
  function selecionarFamiliaRefri(id) {
    const jaEsta = familiaRefris.includes(id)
    toggleFamiliaRefri(id)
    if (!jaEsta) setFamiliaSubPasso(id)
  }

  const comboPronto = (() => {
    if (!tipoCombo) return true
    if (tipoCombo === 'normal')  return comboEsfihas.length > 0 && !!comboBebida && comboSubPasso !== 'bebida-opts'
    if (tipoCombo === 'familia') return familiaEsfihas.length > 0 && familiaRefris.length === QTD_REFRI_FAMILIA && !familiaSubPasso
    return false
  })()

  function avancar() { passo < passos.length - 1 ? setPasso(p => p + 1) : confirmar() }

  function confirmar() {
    const itensCombo = tipoCombo === 'normal'
      ? [
          ...comboEsfihas.map(id => produtos.find(p => p.id === id)).filter(Boolean),
          comboBebida ? { ...produtos.find(p => p.id === comboBebida), tamanho: comboTamanho, copos: comboCopos, gelo: comboGelo, limao: comboLimao } : null,
        ].filter(Boolean)
      : tipoCombo === 'familia'
      ? [
          ...familiaEsfihas.map(id => produtos.find(p => p.id === id)).filter(Boolean),
          ...familiaRefris.map(id => {
            const b = produtos.find(p => p.id === id)
            const opt = familiaRefriOpts[id] ?? {}
            return b ? { ...b, tamanho: opt.tamanho, copos: opt.copos ?? 1, gelo: opt.gelo ?? false, limao: opt.limao ?? false } : null
          }).filter(Boolean),
        ]
      : []

    const adicionaisObjs = adicionais.map(id => ADICIONAIS_POOL.find(a => a.id === id)).filter(Boolean)

    onAdicionar({
      ...produto, quantidade, preco: precoUnit,
      extras: { adicionais: adicionaisObjs, retirados, tipoCombo, itensCombo,
        tamanho: ehBebida ? tamanho : undefined,
        copos:   ehBebida ? copos   : undefined,
        gelo:    ehBebida ? gelo    : undefined,
        limao:   ehBebida ? limao   : undefined,
        observacao },
    })
    onFechar()
  }

  const bebidaComboObj = produtos.find(p => p.id === comboBebida)

  /* ─── render bebida opts (reutilizado em combo e bebida principal) ─── */
  function renderBebidaOpts({ nomeBebida, isRefriLocal, semLimaoLocal, tamAtual, setTam, copasAtual, setCopas, geloAtual, setGeloL, limaoAtual, setLimaoL, onConfirmar }) {
    return (
      <div className="mp-combo-wrap">
        {onConfirmar && <p className="mp-bebida-opts-nome">{nomeBebida}</p>}

        {isRefriLocal && (
          <div className="mp-tamanho-grupo">
            <p className="mp-tamanho-label">Qual tamanho?</p>
            <div className="mp-tamanho-grid">
              {TAMANHOS_REFRI.map(t => (
                <button key={t.id}
                  className={`mp-tamanho-btn ${onConfirmar ? '' : 'mp-tamanho-btn--lg'} ${tamAtual === t.id ? 'mp-tamanho-btn--ativo' : ''}`}
                  onClick={() => setTam(t.id)}>
                  <span className="mp-tamanho-nome">{t.label}</span>
                  <span className="mp-tamanho-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mp-bebida-opts">
          <div className="mp-bebida-opts-linha">
            <span className="mp-bebida-opts-label">Quantidade de copos</span>
            <div className="mp-mini-contador">
              <button className="mp-mini-btn" onClick={() => setCopas(c => Math.max(1, c - 1))}><Minus size={13} /></button>
              <span className="mp-mini-num">{copasAtual}</span>
              <button className="mp-mini-btn" onClick={() => setCopas(c => c + 1)}><Plus size={13} /></button>
            </div>
          </div>
          <div className="mp-bebida-opts-toggles">
            <button className={`mp-toggle ${onConfirmar ? '' : 'mp-toggle--lg'} ${geloAtual ? 'mp-toggle--ativo' : ''}`}
              onClick={() => setGeloL(v => !v)}>
              <Droplets size={onConfirmar ? 14 : 16} /> Gelo
            </button>
            {!semLimaoLocal && (
              <button className={`mp-toggle ${onConfirmar ? '' : 'mp-toggle--lg'} ${limaoAtual ? 'mp-toggle--ativo' : ''}`}
                onClick={() => setLimaoL(v => !v)}>
                <Citrus size={onConfirmar ? 14 : 16} /> Limão
              </button>
            )}
          </div>
        </div>

        {onConfirmar && (
          <button className="mp-btn-confirmar-bebida" onClick={onConfirmar}>
            <Check size={16} /> Confirmar bebida
          </button>
        )}
      </div>
    )
  }

  /* ═══════════════ RENDER PRINCIPAL ═══════════════ */
  return (
    <div className="mp-overlay" onClick={onFechar}>
      <div className="mp-sheet" onClick={e => e.stopPropagation()}>

        <button className="mp-fechar" onClick={onFechar}><X size={16} /></button>

        {/* ══ ESQUERDA ══ */}
        <div className="mp-esq">
          <div className="mp-foto-wrap">
            {produto.imagem
              ? <img src={produto.imagem} alt={produto.nome} className="mp-foto-img" />
              : <div className="mp-foto-placeholder">🫓</div>}
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
                  <div className="mp-etapa-num">{estado === 'feito' ? <Check size={12} /> : i + 1}</div>
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

          <div className="mp-passo-header">
            {passoAtual?.id === 'turbinar' && <>
              <h3 className="mp-passo-titulo"><Flame size={20} style={{display:'inline',marginRight:8,color:'var(--cor-primaria)'}}/>{TURBINAR_LABEL[produto.categoria] ?? 'Turbine seu lanche'}!</h3>
              <p className="mp-passo-sub">Opcional · adicione ingredientes extras</p>
            </>}
            {passoAtual?.id === 'retirar' && <>
              <h3 className="mp-passo-titulo">Deseja retirar algo?</h3>
              <p className="mp-passo-sub">Opcional · selecione o que não quer</p>
            </>}
            {passoAtual?.id === 'combo' && <>
              <h3 className="mp-passo-titulo">Monte seu Combo! 🔥</h3>
              <p className="mp-passo-sub">
                {comboSubPasso === 'bebida-opts' ? `Personalize sua ${bebidaComboObj?.nome ?? 'bebida'}`
                  : familiaSubPasso ? `Personalize: ${produtos.find(p => p.id === familiaSubPasso)?.nome ?? 'bebida'}`
                  : 'Escolha o tipo de combo'}
              </p>
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

          <div className="mp-passo-corpo">

            {/* ── Turbine ── */}
            {passoAtual?.id === 'turbinar' && (
              <div className="mp-opcoes">
                {adicionaisDisponiveis.map(a => {
                  const ativo = adicionais.includes(a.id)
                  return (
                    <div key={a.id} className={`mp-opcao ${ativo ? 'mp-opcao--ativa' : ''}`} onClick={() => toggleAdicional(a.id)}>
                      <div className="mp-opcao-esq">
                        <div className="mp-check">{ativo && <Check size={11} />}</div>
                        <span className="mp-opcao-texto">{a.label}</span>
                      </div>
                      <span className="mp-opcao-preco">+ R$ {a.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Retirar ── */}
            {passoAtual?.id === 'retirar' && (
              <div className="mp-opcoes">
                {ingredientesRetirar.map(ing => {
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
            {passoAtual?.id === 'combo' && (() => {

              /* sub-passo: bebida combo normal */
              if (comboSubPasso === 'bebida-opts') {
                const opt = familiaRefriOpts[comboBebida] ?? {}
                return renderBebidaOpts({
                  nomeBebida:   bebidaComboObj?.nome,
                  isRefriLocal: ehRefrigerante(bebidaComboObj?.nome),
                  semLimaoLocal: temLimaoNatural(bebidaComboObj?.nome),
                  tamAtual: comboTamanho, setTam: setComboTamanho,
                  copasAtual: comboCopos, setCopas: setComboCopos,
                  geloAtual: comboGelo,   setGeloL: setComboGelo,
                  limaoAtual: comboLimao, setLimaoL: setComboLimao,
                  onConfirmar: () => setComboSubPasso(null),
                })
              }

              /* sub-passo: bebida família */
              if (familiaSubPasso) {
                const bObj = produtos.find(p => p.id === familiaSubPasso)
                const opt  = familiaRefriOpts[familiaSubPasso] ?? { tamanho: null, copos: 1, gelo: false, limao: false }
                return renderBebidaOpts({
                  nomeBebida:   bObj?.nome,
                  isRefriLocal: ehRefrigerante(bObj?.nome),
                  semLimaoLocal: temLimaoNatural(bObj?.nome),
                  tamAtual: opt.tamanho, setTam: v => updateFamiliaOpt(familiaSubPasso, 'tamanho', v),
                  copasAtual: opt.copos, setCopas: v => updateFamiliaOpt(familiaSubPasso, 'copos', typeof v === 'function' ? v(opt.copos) : v),
                  geloAtual: opt.gelo,   setGeloL: v => updateFamiliaOpt(familiaSubPasso, 'gelo', typeof v === 'function' ? v(opt.gelo) : v),
                  limaoAtual: opt.limao, setLimaoL: v => updateFamiliaOpt(familiaSubPasso, 'limao', typeof v === 'function' ? v(opt.limao) : v),
                  onConfirmar: () => setFamiliaSubPasso(null),
                })
              }

              /* tela principal combo */
              return (
                <div className="mp-combo-wrap">
                  <div className="mp-opcoes">
                    <div className={`mp-opcao ${tipoCombo === 'normal' ? 'mp-opcao--ativa' : ''}`}
                      onClick={() => { setTipoCombo(t => t === 'normal' ? null : 'normal'); setComboEsfihas([]); setComboBebida(null); setComboSubPasso(null); setComboTamanho(null) }}>
                      <div className="mp-opcao-esq">
                        <div className="mp-radio">{tipoCombo === 'normal' && <div className="mp-radio-dot" />}</div>
                        <div>
                          <div className="mp-opcao-texto">Combo — Esfiha + Bebida</div>
                          <div className="mp-opcao-extra">Escolha {ehSalgada ? 'esfiha doce' : 'esfiha salgada'} + 1 bebida · economize R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    </div>
                    <div className={`mp-opcao ${tipoCombo === 'familia' ? 'mp-opcao--ativa' : ''}`}
                      onClick={() => { setTipoCombo(t => t === 'familia' ? null : 'familia'); setFamiliaEsfihas([]); setFamiliaRefris([]); setFamiliaSubPasso(null) }}>
                      <div className="mp-opcao-esq">
                        <div className="mp-radio">{tipoCombo === 'familia' && <div className="mp-radio-dot" />}</div>
                        <div>
                          <div className="mp-opcao-texto">Combo Família 👨‍👩‍👧‍👦</div>
                          <div className="mp-opcao-extra">Esfihas salgadas à escolha + {QTD_REFRI_FAMILIA} refrigerantes lata · economize R$ {DESCONTO_COMBO_FAMILIA.toFixed(2).replace('.', ',')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tipoCombo === 'normal' && <>
                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">{ehSalgada ? '🍬 Esfihas Doces' : '🧅 Esfihas Salgadas'}</p>
                      <div className="mp-combo-grid">
                        {esfihasCombo.map(p => {
                          const sel = comboEsfihas.includes(p.id)
                          return (
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`} onClick={() => toggleComboEsfiha(p.id)}>
                              {p.imagem ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" /> : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🫓</div>}
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
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`} onClick={() => selecionarComboBebida(p.id)}>
                              {p.imagem ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" /> : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🥤</div>}
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
                    {(comboEsfihas.length > 0 || comboBebida) && (
                      <div className="mp-combo-resumo">
                        <span>🎉 Desconto aplicado:</span>
                        <span className="mp-combo-resumo-val">− R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </>}

                  {tipoCombo === 'familia' && <>
                    <div className="mp-combo-secao">
                      <p className="mp-combo-secao-titulo">🧅 Esfihas Salgadas (à vontade)</p>
                      <div className="mp-combo-grid">
                        {esfihasSalgadas.map(p => {
                          const sel = familiaEsfihas.includes(p.id)
                          return (
                            <div key={p.id} className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''}`} onClick={() => toggleFamiliaEsfiha(p.id)}>
                              {p.imagem ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" /> : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🫓</div>}
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
                          const sel  = familiaRefris.includes(p.id)
                          const bloq = !sel && familiaRefris.length >= QTD_REFRI_FAMILIA
                          const opt  = familiaRefriOpts[p.id]
                          return (
                            <div key={p.id}
                              className={`mp-combo-card ${sel ? 'mp-combo-card--ativo' : ''} ${bloq ? 'mp-combo-card--bloqueado' : ''}`}
                              onClick={() => !bloq && selecionarFamiliaRefri(p.id)}>
                              {p.imagem ? <img src={p.imagem} alt={p.nome} className="mp-combo-card-img" /> : <div className="mp-combo-card-img mp-combo-card-img--placeholder">🥤</div>}
                              <div className="mp-combo-card-info">
                                <span className="mp-combo-card-nome">{p.nome}</span>
                                <span className="mp-combo-card-preco">R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}</span>
                                {sel && opt && (
                                  <span className="mp-combo-card-opts">
                                    {opt.tamanho ? opt.tamanho.toUpperCase() : ''}
                                    {opt.copos > 1 ? ` · ${opt.copos} copos` : ''}
                                    {opt.gelo  ? ' · gelo'  : ''}
                                    {opt.limao ? ' · limão' : ''}
                                  </span>
                                )}
                              </div>
                              {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {(familiaEsfihas.length > 0 || familiaRefris.length > 0) && (
                      <div className="mp-combo-resumo">
                        <span>🎉 Desconto Família:</span>
                        <span className="mp-combo-resumo-val">− R$ {DESCONTO_COMBO_FAMILIA.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </>}
                </div>
              )
            })()}

            {/* ── Bebida principal ── */}
            {passoAtual?.id === 'bebida-opcoes' && renderBebidaOpts({
              nomeBebida: produto.nome,
              isRefriLocal: isRefri,
              semLimaoLocal: temLimaoNatural(produto.nome),
              tamAtual: tamanho,  setTam:   setTamanho,
              copasAtual: copos,  setCopas: setCopos,
              geloAtual: gelo,    setGeloL: setGelo,
              limaoAtual: limao,  setLimaoL: setLimao,
              onConfirmar: null,
            })}

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
                  (passoAtual?.id === 'turbinar'      && adicionais.length > 0) ||
                  (passoAtual?.id === 'retirar'       && retirados.length > 0)  ||
                  (passoAtual?.id === 'combo'         && tipoCombo && comboPronto) ||
                  (passoAtual?.id === 'bebida-opcoes' && (gelo || limao || copos > 1 || tamanho))
                    ? 'mp-btn-pular--ativo' : ''
                }`}
                disabled={
                  (passoAtual?.id === 'combo' && tipoCombo && !comboPronto) ||
                  (passoAtual?.id === 'combo' && (comboSubPasso === 'bebida-opts' || !!familiaSubPasso))
                }
                onClick={avancar}
              >
                {passoAtual?.id === 'combo' && (comboSubPasso === 'bebida-opts' || familiaSubPasso)
                  ? 'Confirme sua bebida para continuar'
                  : passoAtual?.id === 'combo' && tipoCombo && !comboPronto
                    ? tipoCombo === 'familia'
                      ? `Faltam ${QTD_REFRI_FAMILIA - familiaRefris.length} refrigerante(s)`
                      : 'Escolha esfiha e bebida'
                  : (adicionais.length > 0 || retirados.length > 0 || (tipoCombo && comboPronto) || gelo || limao || copos > 1 || tamanho)
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
