import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminProdutos.css'

export default function AdminProdutos() {
  const [produtos,   setProdutos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtro,     setFiltro]     = useState('todos')
  const [busca,      setBusca]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)  // null | 'novo' | produto
  const [salvando,   setSalvando]   = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('produtos').select('*, categorias(slug, nome)').order('ordem'),
      supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
    ])
    setProdutos(prods ?? [])
    setCategorias(cats ?? [])
    setLoading(false)
  }

  async function toggleDisponivel(produto) {
    await supabase.from('produtos').update({ disponivel: !produto.disponivel }).eq('id', produto.id)
    setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p))
  }

  async function excluir(id) {
    if (!confirm('Excluir este produto?')) return
    await supabase.from('produtos').delete().eq('id', id)
    setProdutos(prev => prev.filter(p => p.id !== id))
  }

  async function salvar(dados) {
    setSalvando(true)
    if (dados.id) {
      await supabase.from('produtos').update(dados).eq('id', dados.id)
    } else {
      const { data: rest } = await supabase.from('restaurantes').select('id').single()
      await supabase.from('produtos').insert({ ...dados, restaurante_id: rest.id })
    }
    await carregar()
    setModal(null)
    setSalvando(false)
  }

  const produtosFiltrados = produtos
    .filter(p => filtro === 'todos' || (filtro === 'indisp' ? !p.disponivel : p.categorias?.slug === filtro))
    .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="prod-wrap">
      <div className="prod-topbar">
        <div>
          <h1>Gestão do Cardápio</h1>
          <p>{produtos.length} produtos · {produtos.filter(p=>!p.disponivel).length} indisponíveis</p>
        </div>
        <button className="btn-add" onClick={() => setModal({})}>+ Adicionar Produto</button>
      </div>

      <div className="prod-filtros-row">
        <div className="prod-filtros">
          <button className={filtro==='todos'?'fil active':'fil'} onClick={()=>setFiltro('todos')}>Todos</button>
          {categorias.map(c => (
            <button key={c.slug} className={filtro===c.slug?'fil active':'fil'} onClick={()=>setFiltro(c.slug)}>{c.nome}</button>
          ))}
          <button className={filtro==='indisp'?'fil active':'fil'} onClick={()=>setFiltro('indisp')}>⚠️ Indisponíveis</button>
        </div>
        <input className="prod-busca" placeholder="🔍 Buscar produto..." value={busca} onChange={e=>setBusca(e.target.value)} />
      </div>

      {loading ? (
        <div className="prod-loading">Carregando produtos...</div>
      ) : (
        <div className="prod-grid">
          {produtosFiltrados.map(p => (
            <div key={p.id} className={`prod-card${!p.disponivel?' indisp':''}`}>
              <div className="pc-img">
                {p.imagem_url ? <img src={p.imagem_url} alt={p.nome}/> : <span>🍕</span>}
                {p.badge && <span className="pc-badge">{p.badge}</span>}
                <button
                  className="pc-toggle"
                  title={p.disponivel ? 'Marcar indisponível' : 'Marcar disponível'}
                  onClick={() => toggleDisponivel(p)}
                >
                  {p.disponivel ? '👁' : '🚫'}
                </button>
              </div>
              <div className="pc-info">
                <h4>{p.nome}</h4>
                <div className="pc-cat">{p.categorias?.nome}</div>
                <div className="pc-preco">R$ {Number(p.preco).toFixed(2).replace('.',',')}</div>
                {!p.disponivel && <span className="pc-indisp-tag">⚠️ Indisponível</span>}
                <div className="pc-actions">
                  <button className="pc-btn edit" onClick={() => setModal(p)}>✏️ Editar</button>
                  <button className="pc-btn del"  onClick={() => excluir(p.id)}>🗑 Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ModalProduto
          produto={modal}
          categorias={categorias}
          salvando={salvando}
          onSalvar={salvar}
          onFechar={() => setModal(null)}
        />
      )}
    </div>
  )
}

/* ── Modal de criação/edição ── */
function ModalProduto({ produto, categorias, salvando, onSalvar, onFechar }) {
  const [form, setForm] = useState({
    nome:               produto.nome               ?? '',
    descricao:          produto.descricao          ?? '',
    preco:              produto.preco              ?? '',
    preco_promocional:  produto.preco_promocional  ?? '',
    imagem_url:         produto.imagem_url         ?? '',
    categoria_id:       produto.categoria_id       ?? categorias[0]?.id ?? '',
    badge:              produto.badge              ?? '',
    disponivel:         produto.disponivel         ?? true,
    destaque:           produto.destaque           ?? false,
  })
  const [preview,    setPreview]    = useState(produto.imagem_url ?? '')
  const [uploading,  setUploading]  = useState(false)
  const inputFileRef = useRef()

  const set = (k, v) => setForm(f => {
    const novo = { ...f, [k]: v }
    // Badge automático ao definir/limpar preço promocional
    if (k === 'preco_promocional') {
      if (v !== '' && v !== null) {
        novo.badge = 'Oferta'
      } else if (f.badge === 'Oferta') {
        novo.badge = ''
      }
    }
    return novo
  })

  async function handleArquivo(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    // Preview local imediato
    setPreview(URL.createObjectURL(arquivo))
    setUploading(true)

    const ext      = arquivo.name.split('.').pop()
    const caminho  = `${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('produtos')
      .upload(caminho, arquivo, { upsert: true })

    if (error) {
      alert('Erro ao enviar imagem: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(data.path)
    set('imagem_url', publicUrl)
    setPreview(publicUrl)
    setUploading(false)
  }

  function handleUrl(e) {
    set('imagem_url', e.target.value)
    setPreview(e.target.value)
  }

  function submit(e) {
    e.preventDefault()
    onSalvar({
      ...form,
      preco: parseFloat(form.preco),
      preco_promocional: form.preco_promocional !== '' ? parseFloat(form.preco_promocional) : null,
      id: produto.id,
    })
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>{produto.id ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="mf-row">
            <div className="mf-campo">
              <label>Nome *</label>
              <input value={form.nome} onChange={e=>set('nome',e.target.value)} required placeholder="Ex: Esfiha de Carne"/>
            </div>
            <div className="mf-campo">
              <label>Preço *</label>
              <input type="number" step="0.01" min="0" value={form.preco} onChange={e=>set('preco',e.target.value)} required placeholder="0,00"/>
            </div>
          </div>

          <div className="mf-campo">
            <label>Preço Promocional <span style={{color:'#666', fontWeight:400}}>(deixe vazio para remover)</span></label>
            <input
              type="number" step="0.01" min="0"
              value={form.preco_promocional}
              onChange={e=>set('preco_promocional', e.target.value)}
              placeholder="Ex: 2,00 — risca o preço original e destaca em amarelo"
            />
          </div>

          <div className="mf-campo">
            <label>Descrição</label>
            <textarea value={form.descricao} onChange={e=>set('descricao',e.target.value)} rows={2} placeholder="Descreva o produto..."/>
          </div>

          {/* ── Imagem ── */}
          <div className="mf-campo">
            <label>Imagem do Produto</label>
            <div className="img-upload-area" onClick={() => inputFileRef.current.click()}>
              {preview
                ? <img src={preview} alt="preview" className="img-preview"/>
                : <div className="img-placeholder">📷<span>Clique para enviar<br/><small>PNG, JPG ou WEBP</small></span></div>
              }
              {uploading && <div className="img-uploading">Enviando...</div>}
            </div>
            <input ref={inputFileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleArquivo}/>
            <div className="img-ou">ou cole uma URL</div>
            <input
              value={form.imagem_url}
              onChange={handleUrl}
              placeholder="https://... (opcional)"
              className="img-url-input"
            />
          </div>

          <div className="mf-row">
            <div className="mf-campo">
              <label>Categoria</label>
              <select value={form.categoria_id} onChange={e=>set('categoria_id',e.target.value)}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="mf-campo">
              <label>Badge</label>
              <select value={form.badge} onChange={e=>set('badge',e.target.value)}>
                <option value="">Nenhum</option>
                <option value="Mais Pedido">Mais Pedido</option>
                <option value="Novo">Novo</option>
                <option value="Oferta">Oferta</option>
              </select>
            </div>
          </div>

          <div className="mf-checks">
            <label className="mf-check">
              <input type="checkbox" checked={form.disponivel} onChange={e=>set('disponivel',e.target.checked)}/>
              Disponível
            </label>
            <label className="mf-check">
              <input type="checkbox" checked={form.destaque} onChange={e=>set('destaque',e.target.checked)}/>
              Destaque
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={salvando || uploading}>
              {salvando ? 'Salvando...' : produto.id ? 'Salvar alterações' : 'Adicionar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
