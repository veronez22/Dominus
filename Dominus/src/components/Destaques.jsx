import { useState, useEffect } from 'react'
import { cardapio } from '../data/cardapio'
import './Destaques.css'

// Slide 1 — item do cardápio (dinâmico)
const itemPrincipal = cardapio.find(item => item.badge === 'Mais Pedido') || cardapio.find(item => item.badge)

// Slides promocionais — fixos, sem botão
const slidesPromo = [
  {
    id: 'promo-1',
    imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80',
    titulo: 'Terça é dia de Esfiha em Dobro',
    subtitulo: 'Peça 10 e leve 20. Todo terceiro dia da semana.',
    tipo: 'promo',
  },
  {
    id: 'promo-2',
    imagem: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
    titulo: 'Quarta-feira do Vinho',
    subtitulo: 'Harmonize sua esfiha favorita com um bom vinho.',
    tipo: 'promo',
  },
  {
    id: 'promo-3',
    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    titulo: 'Combo Família',
    subtitulo: '10 esfihas + 2 refrigerantes por R$ 49,90.',
    tipo: 'promo',
  },
]

// Todos os slides juntos — item principal primeiro
const slides = [
  { ...itemPrincipal, tipo: 'produto' },
  ...slidesPromo,
]

// Itens dos cards (todos com badge)
const itensDestaque = cardapio.filter(item => item.badge)

function Destaques({ onAdicionar }) {
  const [slideAtivo, setSlideAtivo] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideAtivo(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[slideAtivo]

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
              <h1 className="destaques-banner-titulo">{slide.titulo}</h1>
              <p className="destaques-banner-descricao">{slide.subtitulo}</p>
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
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="destaques-card-imagem"
                />
                <span className="destaques-card-badge">{item.badge}</span>
              </div>
              <div className="destaques-card-info">
                <p className="destaques-card-nome">{item.nome}</p>
                <span className="destaques-card-preco">
                  R$ {item.preco.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <button
                className="destaques-card-btn"
                onClick={() => onAdicionar(item)}
              >
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