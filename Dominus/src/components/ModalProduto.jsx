import './ModalProduto.css'
import { X, Check, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

/* ─── Upsell após adicionar ─── */
const UPSELL = {
  titulo:  'Que tal uma bebida gelada?',
  desc:    'Coca-Cola, Guaraná ou Suco Natural. O acompanhamento perfeito para a sua esfiha!',
  preco:   'A partir de R$ 4,00',
  emoji:   '🥤',
}

const CATEGORIAS_UPSELL = ['esfihas', 'esfihas-doces', 'fogazzas', 'kibes', 'cigarretes', 'coxinhas']

function ModalProduto({ produto, onFechar, onAdicionar, onPedirAgora }) {
  const [passo,           setPasso]           = useState(0)
  const [retirados,       setRetirados]       = useState([])
  const [comboAtivo,      setComboAtivo]      = useState(false)
  const [quantidade,      setQuantidade]      = useState(1)
  const [observacao,      setObservacao]      = useState('')
  const [upsellVisivel,   setUpsellVisivel]   = useState(false)

  const temIngredientes = Array.isArray(produto.ingredientes) && produto.ingredientes.length > 0
  const temCombo        = !!produto.combo_preco || produto.categoria === 'esfihas' || produto.categoria === 'esfihas-doces'
  const temUpsell       = CATEGORIAS_UPSELL.includes(produto.categoria)

  // Monta os passos dinamicamente
  const passos = [
    ...(temIngredientes ? [{ id: 'retirar', label: 'Retirar ingredientes', sub: 'Opcional' }] : []),
    ...(temCombo        ? [{ id: 'combo',   label: 'Transformar em Combo', sub: 'Opcional' }] : []),
    { id: 'quantidade', label: 'Quantidade', sub: 'Selecione' },
  ]

  const passoAtual = passos[passo]

  const precoBase  = produto.precoPromo ?? produto.preco
  const precoCombo = produto.combo_preco ?? 5.00
  const precoUnit  = precoBase + (comboAtivo ? precoCombo : 0)
  const precoTotal = precoUnit * quantidade

  function toggleRetirar(ing) {
    setRetirados(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    )
  }

  function avancar() {
    if (passo < passos.length - 1) {
      setPasso(p => p + 1)
    } else {
      confirmar()
    }
  }

  function confirmar() {
    onAdicionar({
      ...produto,
      quantidade,
      preco: precoUnit,
      extras: {
        retirados,
        combo: comboAtivo,
        observacao,
      }
    })
    if (temUpsell) {
      setUpsellVisivel(true)
    } else {
      onFechar()
    }
  }

  function fecharUpsell(aceito) {
    setUpsellVisivel(false)
    onFechar()
    if (aceito) onPedirAgora?.()
  }

  // Ingredientes padrão se não tiver no produto
  const ingredientes = temIngredientes
    ? produto.ingredientes
    : ['Cebola', 'Tomate', 'Pimenta', 'Salsa']

  return (
    <>
      {/* ── Overlay principal ── */}
      <div className="mp-overlay" onClick={onFechar}>
        <div className="mp-sheet" onClick={e => e.stopPropagation()}>

          {/* Botão fechar */}
          <button className="mp-fechar" onClick={onFechar}>
            <X size={16} />
          </button>

          {/* ══ Painel esquerdo ══ */}
          <div className="mp-esq">

            {/* Foto */}
            <div className="mp-foto-wrap">
              {produto.imagem
                ? <img src={produto.imagem} alt={produto.nome} className="mp-foto-img" />
                : <div className="mp-foto-placeholder">🫓</div>
              }
              {produto.badge && <span className="mp-badge">{produto.badge}</span>}
            </div>

            {/* Info */}
            <div className="mp-info">
              <p className="mp-categoria">{produto.categoria}</p>
              <h2 className="mp-nome">{produto.nome}</h2>
              {produto.descricao && <p className="mp-desc">{produto.descricao}</p>}
            </div>

            {/* Etapas */}
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

            {/* Subtotal */}
            <div className="mp-subtotal">
              <span className="mp-subtotal-label">Subtotal</span>
              <span className="mp-subtotal-valor">
                R$ {precoTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* ══ Painel direito ══ */}
          <div className="mp-dir">

            {/* Cabeçalho do passo */}
            <div className="mp-passo-header">
              {passoAtual?.id === 'retirar' && (
                <>
                  <h3 className="mp-passo-titulo">Deseja retirar algo?</h3>
                  <p className="mp-passo-sub">Você pode escolher até {ingredientes.length} itens · Opcional</p>
                </>
              )}
              {passoAtual?.id === 'combo' && (
                <>
                  <h3 className="mp-passo-titulo">Transforme em Combo! 🔥</h3>
                  <p className="mp-passo-sub">Adicione uma bebida e aproveite mais</p>
                </>
              )}
              {passoAtual?.id === 'quantidade' && (
                <>
                  <h3 className="mp-passo-titulo">Quantidade</h3>
                  <p className="mp-passo-sub">Quantas unidades você quer?</p>
                </>
              )}
            </div>

            {/* Conteúdo do passo */}
            <div className="mp-passo-corpo">

              {/* Passo: retirar ingredientes */}
              {passoAtual?.id === 'retirar' && (
                <div className="mp-opcoes">
                  {ingredientes.map(ing => {
                    const ativo = retirados.includes(ing)
                    return (
                      <div
                        key={ing}
                        className={`mp-opcao ${ativo ? 'mp-opcao--ativa' : ''}`}
                        onClick={() => toggleRetirar(ing)}
                      >
                        <div className="mp-opcao-esq">
                          <div className="mp-check">
                            {ativo && <Check size={11} />}
                          </div>
                          <span className="mp-opcao-texto">Sem {ing.toLowerCase()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Passo: combo */}
              {passoAtual?.id === 'combo' && (
                <div className="mp-opcoes">
                  <div
                    className={`mp-opcao ${comboAtivo ? 'mp-opcao--ativa' : ''}`}
                    onClick={() => setComboAtivo(v => !v)}
                  >
                    <div className="mp-opcao-esq">
                      <div className="mp-radio">
                        {comboAtivo && <div className="mp-radio-dot" />}
                      </div>
                      <div>
                        <div className="mp-opcao-texto">Combo — Esfiha + Bebida</div>
                        <div className="mp-opcao-extra">Refrigerante lata 350ml à sua escolha</div>
                      </div>
                    </div>
                    <span className="mp-opcao-preco">
                      + R$ {precoCombo.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}

              {/* Passo: quantidade */}
              {passoAtual?.id === 'quantidade' && (
                <div className="mp-qtd-wrap">
                  <div className="mp-contador">
                    <button
                      className="mp-contador-btn"
                      onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="mp-contador-num">{quantidade}</span>
                    <button
                      className="mp-contador-btn"
                      onClick={() => setQuantidade(q => q + 1)}
                    >
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

            {/* Rodapé do passo */}
            <div className="mp-passo-footer">
              {passoAtual?.id === 'quantidade' ? (
                <button className="mp-btn-principal" onClick={confirmar}>
                  <ShoppingCart size={18} />
                  Adicionar ao Carrinho · R$ {precoTotal.toFixed(2).replace('.', ',')}
                </button>
              ) : (
                <button
                  className={`mp-btn-pular ${retirados.length > 0 || comboAtivo ? 'mp-btn-pular--ativo' : ''}`}
                  onClick={avancar}
                >
                  {(passoAtual?.id === 'retirar' && retirados.length > 0) ||
                   (passoAtual?.id === 'combo' && comboAtivo)
                    ? <>Avançar <ChevronRight size={16} /></>
                    : 'Pular'
                  }
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Modal Upsell ── */}
      {upsellVisivel && (
        <div className="mp-upsell-overlay" onClick={() => fecharUpsell(false)}>
          <div className="mp-upsell" onClick={e => e.stopPropagation()}>
            <div className="mp-upsell-topo">
              <span className="mp-upsell-emoji">{UPSELL.emoji}</span>
            </div>
            <div className="mp-upsell-corpo">
              <h3 className="mp-upsell-titulo">{UPSELL.titulo}</h3>
              <p className="mp-upsell-desc">{UPSELL.desc}</p>
              <p className="mp-upsell-preco">{UPSELL.preco}</p>
              <div className="mp-upsell-btns">
                <button className="mp-upsell-btn mp-upsell-btn--nao" onClick={() => fecharUpsell(false)}>
                  Não, obrigado
                </button>
                <button className="mp-upsell-btn mp-upsell-btn--sim" onClick={() => fecharUpsell(true)}>
                  <Check size={16} /> SIM, quero!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ModalProduto
