import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import CardItem from './components/CardItem'
import Carrinho from './components/Carrinho'
import { cardapio } from './data/cardapio'
import './App.css'

function App() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('esfihas')
  const [subcategoriaAtiva, setSubcategoriaAtiva] = useState('Salgadas')
  const [carrinho, setCarrinho] = useState([])

  // Calcula total de itens pro badge do header
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

  function mudarCategoria(id) {
    setCategoriaAtiva(id)
    setSubcategoriaAtiva(null)
  }

  const itensFiltrados = cardapio.filter((item) => {
    if (item.categoria !== categoriaAtiva) return false
    if (subcategoriaAtiva && item.subcategoria) {
      return item.subcategoria === subcategoriaAtiva
    }
    return true
  })

  return (
  <div className="app">
    <Header
      mesa="04"
      totalItens={totalItens}
      onAbrirCarrinho={() => alert('carrinho!')}
    />

    <div className="app-body">
      <Sidebar
        categoriaAtiva={categoriaAtiva}
        onMudar={mudarCategoria}
        subcategoriaAtiva={subcategoriaAtiva}
        onMudarSub={setSubcategoriaAtiva}
      />

      <main className="app-conteudo">
        {itensFiltrados.map((item) => (
          <CardItem
            key={item.id}
            nome={item.nome}
            preco={item.preco}
            descricao={item.descricao}
            imagem={item.imagem}
            onAdicionar={() => adicionarItem(item)}
          />
        ))}
      </main>
    </div>

    <Carrinho itens={carrinho} onRemover={removerItem} />
  </div>
)
}

export default App