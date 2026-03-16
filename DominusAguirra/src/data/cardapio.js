export const categorias = [
  {
    id: 'esfihas',
    label: 'Esfihas',
    icon: '🫓',
    subcategorias: ['Salgadas', 'Doces'],
    banner: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80',
  },
  {
    id: 'cigarretes',
    label: 'Cigarretes',
    icon: '🥐',
    banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    icon: '🥤',
    banner: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&q=80',
  },
  {
    id: 'combos',
    label: 'Combos',
    icon: '📦',
    banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
  },
  {
    id: 'destaques',
    label: 'Destaques',
    icon: '⭐',
    banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80',
  },
]

export const cardapio = [
  // Esfihas Salgadas
  { id: 1, nome: 'Carne',               preco: 5.15, descricao: 'Carne moída temperada com cebola e tomate.',        imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', categoria: 'esfihas',    subcategoria: 'Salgadas' },
  { id: 2, nome: 'Carne c/ Catupiry',   preco: 5.75, descricao: 'Carne moída com catupiry cremoso.',                 imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200', categoria: 'esfihas',    subcategoria: 'Salgadas' },
  { id: 3, nome: 'Queijo',              preco: 4.50, descricao: 'Mussarela derretida com orégano fresco.',           imagem: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&q=80', categoria: 'esfihas',    subcategoria: 'Salgadas' },
  { id: 4, nome: 'Frango c/ Requeijão', preco: 5.50, descricao: 'Frango desfiado com requeijão cremoso.',            imagem: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200', categoria: 'esfihas',    subcategoria: 'Salgadas' },
  // Esfihas Doces
  { id: 5, nome: 'Banana c/ Canela',    preco: 4.50, descricao: 'Banana com canela e leite condensado.',             imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200', categoria: 'esfihas',    subcategoria: 'Doces'    },
  { id: 6, nome: 'Chocolate',           preco: 4.50, descricao: 'Recheio cremoso de chocolate ao leite.',            imagem: 'https://images.unsplash.com/photo-1548340748-6af6c8b46424?w=200', categoria: 'esfihas',    subcategoria: 'Doces'    },
  // Cigarretes
  { id: 7, nome: 'Cigarrete de Carne',  preco: 6.50, descricao: 'Massa crocante recheada com carne temperada.',      imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200', categoria: 'cigarretes', subcategoria: null       },
  { id: 8, nome: 'Cigarrete de Frango', preco: 6.50, descricao: 'Massa crocante com frango desfiado e catupiry.',    imagem: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200', categoria: 'cigarretes', subcategoria: null       },
  // Bebidas
  { id: 9,  nome: 'Coca-Cola Lata',     preco: 5.00, descricao: 'Coca-Cola gelada 350ml.',                           imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200', categoria: 'bebidas',    subcategoria: null       },
  { id: 10, nome: 'Suco de Laranja',    preco: 7.50, descricao: 'Suco natural espremido na hora 300ml.',             imagem: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200', categoria: 'bebidas',    subcategoria: null       },
  { id: 11, nome: 'Limonada Suíça',     preco: 9.00, descricao: 'Limonada cremosa com limão siciliano.',             imagem: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=200', categoria: 'bebidas',    subcategoria: null       },
  // Combos
  { id: 12, nome: 'Combo Família',      preco: 49.90, descricao: '10 esfihas à escolha + 2 refrigerantes lata.',     imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=200', categoria: 'combos',     subcategoria: null       },
  { id: 13, nome: 'Combo Casal',        preco: 27.90, descricao: '4 esfihas à escolha + 2 refrigerantes lata.',      imagem: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200', categoria: 'combos',     subcategoria: null       },
]