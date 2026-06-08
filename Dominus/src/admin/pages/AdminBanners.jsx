import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AdminBanners.css'

const MAX_MB     = 2
const MIN_W      = 1280
const MIN_H      = 480
const MAX_W      = 1920
const MAX_H      = 720
const FORMATOS   = ['image/jpeg', 'image/png', 'image/webp']

export default function AdminBanners() {
  const [banners,        setBanners]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [modal,          setModal]          = useState(false)
  const [bannerEditando, setBannerEditando] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const { data: rest } = await supabase.from('restaurantes').select('id').single()
    const { data } = await supabase
      .from('banners')
      .select('*')
      .eq('restaurante_id', rest.id)
      .order('ordem')
    setBanners(data ?? [])
    setLoading(false)
  }

  async function toggleAtivo(banner) {
    await supabase.from('banners').update({ ativo: !banner.ativo }).eq('id', banner.id)
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, ativo: !b.ativo } : b))
  }

  async function excluir(banner) {
    if (!confirm('Excluir este banner?')) return
    await supabase.from('banners').delete().eq('id', banner.id)
    setBanners(prev => prev.filter(b => b.id !== banner.id))
  }

  async function moverOrdem(banner, direcao) {
    const idx     = banners.findIndex(b => b.id === banner.id)
    const idxAlvo = idx + direcao
    if (idxAlvo < 0 || idxAlvo >= banners.length) return

    const nova = [...banners]
    ;[nova[idx], nova[idxAlvo]] = [nova[idxAlvo], nova[idx]]

    await Promise.all(nova.map((b, i) =>
      supabase.from('banners').update({ ordem: i }).eq('id', b.id)
    ))
    setBanners(nova)
  }

  function fecharModal() {
    setModal(false)
    setBannerEditando(null)
  }

  return (
    <div className="ban-wrap">
      <div className="ban-topbar">
        <div>
          <h1>Banners do Carrossel</h1>
          <p>{banners.length} banner{banners.length !== 1 ? 's' : ''} cadastrado{banners.length !== 1 ? 's' : ''} · aparecem na tela de Destaques do tablet</p>
        </div>
        <button className="btn-add-ban" onClick={() => setModal(true)}>+ Adicionar Banner</button>
      </div>

      {/* Guia de tamanho */}
      <div className="ban-guia">
        <span>📐</span>
        <div>
          <strong>Especificações de imagem:</strong>
          {' '}Proporção horizontal (paisagem) · Mín. 1280×480px · Máx. 1920×720px · Até 2MB · JPG, PNG ou WEBP
        </div>
      </div>

      {loading ? (
        <div className="ban-loading">Carregando banners...</div>
      ) : banners.length === 0 ? (
        <div className="ban-vazio">
          <span>🖼️</span>
          <p>Nenhum banner cadastrado ainda</p>
          <button className="btn-add-ban" onClick={() => setModal(true)}>+ Adicionar primeiro banner</button>
        </div>
      ) : (
        <div className="ban-lista">
          {banners.map((b, idx) => (
            <div key={b.id} className={`ban-card${!b.ativo ? ' inativo' : ''}`}>
              <div className="ban-preview">
                <img src={b.imagem_url} alt={b.titulo || 'Banner'} />
                {!b.ativo && <div className="ban-inativo-tag">Inativo</div>}
              </div>
              <div className="ban-info">
                <div className="ban-textos">
                  <div className="ban-titulo">{b.titulo || <span className="ban-sem-texto">Sem título</span>}</div>
                  <div className="ban-subtitulo">{b.subtitulo || <span className="ban-sem-texto">Sem subtítulo</span>}</div>
                  {b.btn_texto && <div className="ban-btn-preview">🔘 Botão: "{b.btn_texto}"</div>}
                </div>
                <div className="ban-actions">
                  <div className="ban-ordem">
                    <button onClick={() => moverOrdem(b, -1)} disabled={idx === 0} title="Mover para cima">↑</button>
                    <span>{idx + 1}</span>
                    <button onClick={() => moverOrdem(b, 1)} disabled={idx === banners.length - 1} title="Mover para baixo">↓</button>
                  </div>
                  <button
                    className="ban-btn edit"
                    onClick={() => setBannerEditando(b)}
                    title="Editar"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={`ban-btn toggle ${b.ativo ? 'ativo' : 'inativo'}`}
                    onClick={() => toggleAtivo(b)}
                    title={b.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {b.ativo ? '👁 Visível' : '🚫 Oculto'}
                  </button>
                  <button className="ban-btn del" onClick={() => excluir(b)}>🗑 Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal || bannerEditando) && (
        <ModalBanner
          banner={bannerEditando}
          onSalvar={async () => { await carregar(); fecharModal() }}
          onFechar={fecharModal}
        />
      )}
    </div>
  )
}

/* ── Modal de novo / editar banner ── */
function ModalBanner({ banner, onSalvar, onFechar }) {
  const editando = !!banner

  const [form,      setForm]      = useState({
    titulo:      banner?.titulo      ?? '',
    subtitulo:   banner?.subtitulo   ?? '',
    imagem_url:  banner?.imagem_url  ?? '',
    btn_texto:   banner?.btn_texto   ?? '',
    btn_destino: banner?.btn_destino ?? 'cardapio',
    produto_id:  banner?.produto_id  ?? '',
  })
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    supabase.from('produtos').select('id, nome').eq('disponivel', true).order('nome')
      .then(({ data }) => setProdutos(data ?? []))
  }, [])
  const [preview,   setPreview]   = useState(banner?.imagem_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [erro,      setErro]      = useState('')
  const [salvando,  setSalvando]  = useState(false)
  const inputRef = useRef()

  async function handleArquivo(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return
    setErro('')

    // Valida formato
    if (!FORMATOS.includes(arquivo.type)) {
      setErro('Formato inválido. Use JPG, PNG ou WEBP.')
      return
    }

    // Valida dimensões
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.src = url
    await new Promise(res => { img.onload = res })

    if (img.width < MIN_W || img.height < MIN_H) {
      setErro(`Imagem muito pequena. Mínimo ${MIN_W}×${MIN_H}px. A sua tem ${img.width}×${img.height}px.`)
      URL.revokeObjectURL(url)
      return
    }
    if (img.width > MAX_W || img.height > MAX_H) {
      setErro(`Imagem muito grande. Máximo ${MAX_W}×${MAX_H}px. A sua tem ${img.width}×${img.height}px.`)
      URL.revokeObjectURL(url)
      return
    }
    if (img.width < img.height * 1.5) {
      setErro('A imagem deve ser horizontal (paisagem). Imagens verticais ou quadradas não são aceitas.')
      URL.revokeObjectURL(url)
      return
    }

    setPreview(url)
    setUploading(true)

    const ext     = arquivo.name.split('.').pop()
    const caminho = `banner-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('banners')
      .upload(caminho, arquivo, { upsert: true })

    if (error) {
      setErro('Erro ao enviar imagem: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(data.path)
    setForm(f => ({ ...f, imagem_url: publicUrl }))
    setUploading(false)
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.imagem_url) { setErro('Adicione uma imagem antes de salvar.'); return }
    setSalvando(true)

    const temProduto = form.btn_texto && form.btn_destino === 'produto' && form.produto_id
    const payload = {
      imagem_url:  form.imagem_url,
      titulo:      form.titulo    || null,
      subtitulo:   form.subtitulo || null,
      btn_texto:   form.btn_texto    || null,
      btn_destino: form.btn_texto ? (form.btn_destino || 'cardapio') : null,
      produto_id:  temProduto ? form.produto_id : null,
    }

    if (editando) {
      await supabase.from('banners').update(payload).eq('id', banner.id)
    } else {
      const { data: rest } = await supabase.from('restaurantes').select('id').single()
      const { data: ultimos } = await supabase.from('banners').select('ordem').order('ordem', { ascending: false }).limit(1)
      const proximaOrdem = (ultimos?.[0]?.ordem ?? -1) + 1
      await supabase.from('banners').insert({ ...payload, restaurante_id: rest.id, ordem: proximaOrdem, ativo: true })
    }

    await onSalvar()
    setSalvando(false)
  }

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2>{editando ? 'Editar Banner' : 'Novo Banner'}</h2>
          <button className="modal-fechar" onClick={onFechar}>✕</button>
        </div>

        <form className="modal-form" onSubmit={submit}>

          {/* Área de upload */}
          <div className="mf-campo">
            <label>Imagem do Banner {!editando && '*'}</label>

            <div className="ban-proporcao-guia">
              <div className="ban-proporcao-box">
                {preview
                  ? <img src={preview} alt="preview" className="ban-proporcao-preview"/>
                  : <span>16:9 / 21:9</span>
                }
                {uploading && <div className="ban-uploading-overlay">Enviando...</div>}
              </div>
              <div className="ban-proporcao-dicas">
                <p>✅ Horizontal (paisagem)</p>
                <p>✅ Mínimo 1280 × 480px</p>
                <p>✅ Máximo 1920 × 720px</p>
                <p>✅ Até 2MB — JPG, PNG, WEBP</p>
                <p>❌ Vertical ou quadrada</p>
                <button type="button" className="ban-btn-escolher" onClick={() => inputRef.current.click()}>
                  📁 {editando ? 'Trocar imagem' : 'Escolher imagem'}
                </button>
              </div>
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleArquivo}/>

            {erro && <div className="ban-erro">⚠️ {erro}</div>}
          </div>

          {/* Título e subtítulo */}
          <div className="mf-campo">
            <label>Título <span className="opcional">(opcional)</span></label>
            <input
              value={form.titulo}
              onChange={e => setForm(f => ({...f, titulo: e.target.value}))}
              placeholder="Ex: MONTE DO SEU JEITO"
            />
          </div>
          <div className="mf-campo">
            <label>Subtítulo <span className="opcional">(opcional)</span></label>
            <input
              value={form.subtitulo}
              onChange={e => setForm(f => ({...f, subtitulo: e.target.value}))}
              placeholder="Ex: Salgadas, doces e bebidas para todos os gostos."
            />
          </div>
          <div className="mf-campo">
            <label>Texto do Botão <span className="opcional">(opcional — aparece no banner do tablet)</span></label>
            <input
              value={form.btn_texto}
              onChange={e => setForm(f => ({...f, btn_texto: e.target.value}))}
              placeholder="Ex: Ver Cardápio, Aproveite!, Ver Combos"
            />
          </div>
          {form.btn_texto && (
            <div className="mf-campo">
              <label>Destino do Botão</label>
              <select value={form.btn_destino} onChange={e => setForm(f => ({...f, btn_destino: e.target.value, produto_id: ''}))}>
                <option value="destaques">Destaques</option>
                <option value="cardapio">Cardápio (Esfihas)</option>
                <option value="combos">Combos</option>
                <option value="bebidas">Bebidas</option>
                <option value="esfihas-doces">Esfihas Doces</option>
                <option value="fogazzas">Fogazzas</option>
                <option value="coxinhas">Coxinhas</option>
                <option value="cigarretes">Cigarretes</option>
                <option value="kibes">Kibes</option>
                <option value="diversos">Diversos</option>
                <option value="produto">🛍 Produto específico</option>
              </select>
            </div>
          )}
          {form.btn_texto && form.btn_destino === 'produto' && (
            <div className="mf-campo">
              <label>Selecionar Produto</label>
              <select value={form.produto_id} onChange={e => setForm(f => ({...f, produto_id: e.target.value}))}>
                <option value="">-- Escolha um produto --</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-salvar" disabled={salvando || uploading}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Adicionar banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
