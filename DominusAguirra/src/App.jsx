import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CardItem from './components/CardItem'
import Banner from './components/Banner'
import Carrinho from './components/Carrinho'
import ModalProduto from './components/ModalProduto'
import { cardapio, categorias } from './data/cardapio'
import './App.css'

function App() {
  const [carrinho, setCarrinho] = useState([])
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [categoriaVisivel, setCategoriaVisivel] = useState('destaques')
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const refs = useRef({})
  const bannerRefs = useRef({})  // ← refs só dos banners

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCategoriaVisivel(entry.target.dataset.categoria)
        }
      })
    },
    { threshold: 0.5 }
  )

  Object.entries(bannerRefs.current).forEach(([id, el]) => {
    if (el) {
      el.dataset.categoria = id
      observer.observe(el)
    }
  })

  return () => observer.disconnect()
}, [])

  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0)

  function adicionarItem(item) {
    setCarrinho((prev) => {
      const jaExiste = prev.find((i) => i.id === item.id)
      if (jaExiste) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, { ...item, quantidade: 1 }]
    })
  }

  function removerItem(id) {
    setCarrinho((prev) => prev.filter((i) => i.id !== id))
  }

  function scrollParaCategoria(id) {
    refs.current[id]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Header
        totalItens={totalItens}
        onAbrirCarrinho={() => setCarrinhoAberto(true)}
      />

      <div className="app-body">
        <Sidebar
          onMudar={scrollParaCategoria}
          categoriaVisivel={categoriaVisivel}
        />

        <main className="app-conteudo">
  {categorias.map((cat) => {
    const itensDaCategoria = cardapio.filter(i => i.categoria === cat.id)
    return (
      <div key={cat.id} ref={(el) => refs.current[cat.id] = el}>

        {/* ref no banner pra detectar qual categoria tá visível */}
        <div ref={(el) => bannerRefs.current[cat.id] = el}>
          <Banner categoria={cat} />
        </div>

        {itensDaCategoria.map((item) => (
          <CardItem
            key={item.id}
            nome={item.nome}
            preco={item.preco}
            descricao={item.descricao}
            imagem={item.imagem}
            onAdicionar={() => setProdutoSelecionado(item)}
          />
        ))}
      </div>
    )
  })}
</main>
      </div>

      {carrinhoAberto && (
        <Carrinho
          itens={carrinho}
          onFechar={() => setCarrinhoAberto(false)}
          onRemover={removerItem}
        />
      )}
      {produtoSelecionado && (
  <ModalProduto
    produto={produtoSelecionado}
    onFechar={() => setProdutoSelecionado(null)}
    onAdicionar={adicionarItem}
  />
)}
    </div>
  )
}

export default App