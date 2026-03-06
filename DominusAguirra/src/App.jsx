import { useState } from 'react'
import Header from './components/header'
import Sidebar from './components/Sidebar'
import CardItem from './components/CardItem'
import Carrinho from './components/Carrinho'

const cardapio = [
  { id: 1, nome: 'Carne', preco: 5.15, descricao: 'Carne moída temperada com cebola e tomate.', imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', categoria: 'esfihas', subcategoria: 'Salgadas' },
  { id: 2, nome: 'Carne c/ Catupiry', preco: 5.75, descricao: 'Carne moída com catupiry cremoso.', imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200', categoria: 'esfihas', subcategoria: 'Salgadas' },
  { id: 3, nome: 'Queijo', preco: 4.50, descricao: 'Mussarela derretida com orégano fresco.', imagem: 'https://images.unsplash.com/photo-1548340748-6af6c8b46424?w=200', categoria: 'esfihas', subcategoria: 'Salgadas' },
  { id: 4, nome: 'Banana c/ Canela', preco: 4.50, descricao: 'Banana com canela e leite condensado.', imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200', categoria: 'esfihas', subcategoria: 'Doces' },
]

function App() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('esfihas')
  const [subcategoriaAtiva, setSubcategoriaAtiva] = useState('Salgadas')
  const [carrinho, setCarrinho] = useState([])

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

  // Filtra os itens pela categoria e subcategoria ativas
  const itensFiltrados = cardapio.filter((item) => {
    if (item.categoria !== categoriaAtiva) return false
    if (subcategoriaAtiva && item.subcategoria) {
      return item.subcategoria === subcategoriaAtiva
    }
    return true
  })

  function mudarCategoria(id) {
    setCategoriaAtiva(id)
    setSubcategoriaAtiva(null) // reseta subcategoria ao trocar categoria
  }

  return (
    <div>
      <Header mesa="04" />
      <Sidebar
        categoriaAtiva={categoriaAtiva}
        onMudar={mudarCategoria}
        subcategoriaAtiva={subcategoriaAtiva}
        onMudarSub={setSubcategoriaAtiva}
      />

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

      <Carrinho itens={carrinho} onRemover={removerItem} />
    </div>
  )
}

export default App