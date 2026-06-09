import './ModalProduto.css'
import { X, Check, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react'
import { useState } from 'react'

/* Desconto fixo do combo (R$) */
const DESCONTO_COMBO = 4.00

function ModalProduto({ produto, produtos = [], onFechar, onAdicionar, onPedirAgora }) {
  const [passo,      setPasso]      = useState(0)
  const [retirados,  setRetirados]  = useState([])
  const [comboAtivo, setComboAtivo] = useState(false)
  const [comboEsfihas, setComboEsfihas] = useState([])   // ids das esfihas do combo
  const [comboBebida,  setComboBebida]  = useState(null) // id da bebida do combo
  const [quantidade,   setQuantidade]   = useState(1)
  const [observacao,   setObservacao]   = useState('')

  /* ── Produtos disponíveis para o combo ── */
  const ehDoce    = produto.categoria === 'esfihas-doces'
  const ehSalgada = produto.categoria === 'esfihas'

  const esfihasCombo = produtos.filter(p =>
    p.disponivel !== false &&
    p.id !== produto.id &&
    (ehDoce    ? p.categoria === 'esfihas'       :
     ehSalgada ? p.categoria === 'esfihas-doces' : false)
  )

  const bebidasCombo = produtos.filter(p =>
    p.disponivel !== false && p.categoria === 'bebidas'
  )

  /* ── Passos dinâmicos ── */
  const temCombo = ehDoce || ehSalgada

  const passos = [
    { id: 'retirar',    label: 'Retirar ingredientes', sub: 'Opcional' },
    ...(temCombo ? [{ id: 'combo', label: 'Transformar em Combo', sub: 'Opcional' }] : []),
    { id: 'quantidade', label: 'Quantidade', sub: 'Selecione' },
  ]

  const passoAtual = passos[passo]

  /* ── Preços ── */
  const precoBase = produto.precoPromo ?? produto.preco

  const precoItensCombo = comboAtivo
    ? comboEsfihas.reduce((s, id) => {
        const p = produtos.find(p => p.id === id)
        return s + (p?.precoPromo ?? p?.preco ?? 0)
      }, 0)
      + (comboBebida ? (() => {
          const b = produtos.find(p => p.id === comboBebida)
          return b?.precoPromo ?? b?.preco ?? 0
        })() : 0)
    : 0

  const descontoCombo  = comboAtivo && (comboEsfihas.length > 0 || comboBebida) ? DESCONTO_COMBO : 0
  const precoUnit      = precoBase + precoItensCombo - descontoCombo
  const precoTotal     = precoUnit * quantidade

  /* ── Helpers ── */
  const ingredientes = Array.isArray(produto.ingredientes) && produto.ingredientes.length > 0
    ? produto.ingredientes
    : ['Cebola', 'Tomate', 'Pimenta', 'Salsa']

  function toggleRetirar(ing) {
    setRetirados(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing])
  }

  function toggleComboEsfiha(id) {
    setComboEsfihas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function avancar() {
    if (passo < passos.length - 1) setPasso(p => p + 1)
    else confirmar()
  }

  function confirmar() {
    const itensCombo = [
      ...comboEsfihas.map(id => produtos.find(p => p.id === id)).filter(Boolean),
      comboBebida ? produtos.find(p => p.id === comboBebida) : null,
    ].filter(Boolean)

    onAdicionar({
      ...produto,
      quantidade,
      preco: precoUnit,
      extras: { retirados, combo: comboAtivo, itensCombo, observacao },
    })
    onFechar()
  }

  const comboPronto = !comboAtivo || (comboEsfihas.length > 0 && comboBebida)

  return (
    <div className="mp-overlay" onClick={onFechar}>
      <div className="mp-sheet" onClick={e => e.stopPropagation()}>

        <button className="mp-fechar" onClick={onFechar}><X size={16} /></button>

        {/* ══ Painel esquerdo ══ */}
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
            <span className="mp-subtotal-valor">
              R$ {precoTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* ══ Painel direito ══ */}
        <div className="mp-dir">

          {/* Cabeçalho */}
          <div className="mp-passo-header">
            {passoAtual?.id === 'retirar' && <>
              <h3 className="mp-passo-titulo">Deseja retirar algo?</h3>
              <p className="mp-passo-sub">Opcional · selecione os ingredientes que deseja remover</p>
            </>}
            {passoAtual?.id === 'combo' && <>
              <h3 className="mp-passo-titulo">Monte seu Combo! 🔥</h3>
              <p className="mp-passo-sub">
                Escolha {ehSalgada ? 'esfihas doces' : 'esfihas salgadas'} e uma bebida · economize R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}
              </p>
            </>}
            {passoAtual?.id === 'quantidade' && <>
              <h3 className="mp-passo-titulo">Quantidade</h3>
              <p className="mp-passo-sub">Quantas unidades você quer?</p>
            </>}
          </div>

          {/* Corpo */}
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

                {/* Toggle ativar combo */}
                <div className={`mp-opcao mp-opcao--combo-toggle ${comboAtivo ? 'mp-opcao--ativa' : ''}`}
                  onClick={() => { setComboAtivo(v => !v); setComboEsfihas([]); setComboBebida(null) }}>
                  <div className="mp-opcao-esq">
                    <div className="mp-radio">{comboAtivo && <div className="mp-radio-dot" />}</div>
                    <div>
                      <div className="mp-opcao-texto">Quero montar um Combo!</div>
                      <div className="mp-opcao-extra">Economize R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')} ao adicionar esfihas + bebida</div>
                    </div>
                  </div>
                </div>

                {/* Seleção de esfihas do combo */}
                {comboAtivo && esfihasCombo.length > 0 && (
                  <div className="mp-combo-secao">
                    <p className="mp-combo-secao-titulo">
                      {ehSalgada ? '🍬 Esfihas Doces' : '🧅 Esfihas Salgadas'}
                    </p>
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
                              <span className="mp-combo-card-preco">
                                R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Seleção de bebida */}
                {comboAtivo && bebidasCombo.length > 0 && (
                  <div className="mp-combo-secao">
                    <p className="mp-combo-secao-titulo">🥤 Bebida</p>
                    <div className="mp-combo-grid">
                      {bebidasCombo.map(p => {
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
                              <span className="mp-combo-card-preco">
                                R$ {(p.precoPromo ?? p.preco).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            {sel && <div className="mp-combo-card-check"><Check size={13} /></div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resumo do desconto */}
                {comboAtivo && (comboEsfihas.length > 0 || comboBebida) && (
                  <div className="mp-combo-resumo">
                    <span>🎉 Desconto aplicado:</span>
                    <span className="mp-combo-resumo-val">− R$ {DESCONTO_COMBO.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

              </div>
            )}

            {/* ── Quantidade ── */}
            {passoAtual?.id === 'quantidade' && (
              <div className="mp-qtd-wrap">
                <div className="mp-contador">
                  <button className="mp-contador-btn" onClick={() => setQuantidade(q => Math.max(1, q - 1))}>
                    <Minus size={18} />
                  </button>
                  <span className="mp-contador-num">{quantidade}</span>
                  <button className="mp-contador-btn" onClick={() => setQuantidade(q => q + 1)}>
                    <Plus size={18} />
                  </button>
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

          {/* Rodapé */}
          <div className="mp-passo-footer">
            {passoAtual?.id === 'quantidade' ? (
              <button className="mp-btn-principal" onClick={confirmar}>
                <ShoppingCart size={18} />
                Adicionar ao Carrinho · R$ {precoTotal.toFixed(2).replace('.', ',')}
              </button>
            ) : (
              <button
                className={`mp-btn-pular ${
                  (passoAtual?.id === 'retirar' && retirados.length > 0) ||
                  (passoAtual?.id === 'combo' && comboPronto && comboAtivo)
                    ? 'mp-btn-pular--ativo' : ''
                }`}
                onClick={avancar}
                disabled={passoAtual?.id === 'combo' && comboAtivo && !comboPronto}
              >
                {passoAtual?.id === 'combo' && comboAtivo && !comboPronto
                  ? 'Escolha esfiha e bebida para continuar'
                  : (retirados.length > 0 || (comboAtivo && comboPronto))
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
