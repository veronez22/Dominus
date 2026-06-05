import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Destaques.css'

function Destaques({ onAdicionar, produtos = [], onNavegar }) {
  const [bannersDB,  setBannersDB]  = useState([])
  const [slideAtivo, setSlideAtivo] = useState(0)

  // Busca banners do banco + Realtime
  useEffect(() => {
    async function carregarBanners() {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('ativo', true)
        .order('ordem')
      setBannersDB(data ?? [])
    }

    carregarBanners()

    // Atualiza em tempo real quando admin muda ativo/ordem
    const canal = supabase
      .channel('banners-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        carregarBanners()
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  // Reinicia o slide quando banners mudam
  useEffect(() => {
    setSlideAtivo(0)
  }, [bannersDB.length])

  const itemPrincipal = produtos.find(p => p.badge === 'Mais Pedido') || produtos.find(p => p.badge)
  const itensDestaque = produtos.filter(p => p.badge)

  // Slides: produto destaque (se existir) + banners do banco
  const slidesPromo = bannersDB.map(b => ({
    id:          b.id,
    imagem:      b.imagem_url,
    titulo:      b.titulo,
    subtitulo:   b.subtitulo,
    btn_texto:   b.btn_texto,
    btn_destino: b.btn_destino,
    tipo:        'promo',
  }))

  const slides = itemPrincipal
    ? [{ ...itemPrincipal, tipo: 'produto' }, ...slidesPromo]
    : slidesPromo

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setSlideAtivo(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  const slide = slides[slideAtivo] ?? slides[0]

  return (
    <div className="destaques">
      <div
        className="destaques-banner"
        style={{ backgroundImage: `url(${slide.imagem})` }}
      >
        <div className="destaques-banner-overlay" />

        <div className="destaques-banner-conteudo" key={slideAtivo}>
          {slide.tipo === 'produto' ? (
            <>
              <span className="destaques-banner-badge">{slide.badge}</span>
              <h1 className="destaques-banner-titulo">{slide.nome}</h1>
              <p className="destaques-banner-descricao">{slide.descricao}</p>
              <button
                className="destaques-banner-btn"
                onClick={() => onAdicionar(slide)}
              >
                Adicionar · R$ {slide.preco.toFixed(2).replace('.', ',')}
              </button>
            </>
          ) : (
            <>
              {slide.titulo    && <h1 className="destaques-banner-titulo">{slide.titulo}</h1>}
              {slide.subtitulo && <p className="destaques-banner-descricao">{slide.subtitulo}</p>}
              {slide.btn_texto && (
                <button className="destaques-banner-btn" onClick={() => onNavegar?.(slide.btn_destino)}>
                  {slide.btn_texto}
                </button>
              )}
            </>
          )}
        </div>

        <div className="destaques-indicadores">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`destaques-indicador ${i === slideAtivo ? 'ativo' : ''}`}
              onClick={() => setSlideAtivo(i)}
            />
          ))}
        </div>
      </div>

      <div className="destaques-secao">
        <h2 className="destaques-secao-titulo">Destaques</h2>
        <div className="destaques-cards">
          {itensDestaque.map((item) => (
            <div key={item.id} className="destaques-card">
              <div className="destaques-card-imagem-wrapper">
                <img src={item.imagem} alt={item.nome} className="destaques-card-imagem" />
                <span className="destaques-card-badge">{item.badge}</span>
              </div>
              <div className="destaques-card-info">
                <p className="destaques-card-nome">{item.nome}</p>
                <div className="destaques-card-precos">
                  {item.precoPromo
                    ? <>
                        <span className="destaques-card-preco-original">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                        <span className="destaques-card-preco">R$ {item.precoPromo.toFixed(2).replace('.', ',')}</span>
                      </>
                    : <span className="destaques-card-preco">R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                  }
                </div>
              </div>
              <button className="destaques-card-btn" onClick={() => onAdicionar(item)}>
                + Adicionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Destaques
