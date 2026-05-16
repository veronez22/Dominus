export const categorias = [
  {
    id: 'destaques',
    label: 'Destaques',
    descricao: 'Os favoritos de quem já provou',
    banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80',
  },
  {
    id: 'esfihas',
    label: 'Esfihas',
    descricao: 'Tradição e sabor em cada mordida',
    subcategorias: ['Salgadas', 'Doces'],
    banner: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80',
  },
  {
    id: 'cigarretes',
    label: 'Cigarretes',
    descricao: 'Crocantes por fora, irresistíveis por dentro',
    banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
  },
  {
    id: 'bebidas',
    label: 'Bebidas',
    descricao: 'Geladas para acompanhar',
    banner: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900&q=80',
  },
  {
    id: 'combos',
    label: 'Combos',
    descricao: 'Mais sabor, melhor preço',
    banner: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80',
  },
]

export const cardapio = [
  // Esfihas Salgadas
  { id: 1,  nome: 'Carne',               preco: 5.15,  descricao: 'Carne moída temperada com cebola e tomate.',       imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Salgadas', badge: 'Novo'        },
  { id: 2,  nome: 'Carne c/ Catupiry',   preco: 5.75,  descricao: 'Carne moída com catupiry cremoso.',                imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Salgadas', badge: 'Mais Pedido' },
  { id: 3,  nome: 'Queijo',              preco: 4.50,  descricao: 'Mussarela derretida com orégano fresco.',          imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Salgadas', badge: 'Mais Pedido' },
  { id: 4,  nome: 'Frango c/ Requeijão', preco: 5.50,  descricao: 'Frango desfiado com requeijão cremoso.',           imagem: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Salgadas', badge: 'Favorito'    },
  // Esfihas Doces
  { id: 5,  nome: 'Banana c/ Canela',    preco: 4.50,  descricao: 'Banana com canela e leite condensado.',            imagem: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Doces'                         },
  { id: 6,  nome: 'Chocolate',           preco: 4.50,  descricao: 'Recheio cremoso de chocolate ao leite.',           imagem: 'https://images.unsplash.com/photo-1548340748-6af6c8b46424?w=600&q=85', categoria: 'esfihas',    subcategoria: 'Doces'                         },
  // Cigarretes
  { id: 7,  nome: 'Cigarrete de Carne',  preco: 6.50,  descricao: 'Massa crocante recheada com carne temperada.',     imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85', categoria: 'cigarretes', subcategoria: null,       badge: 'Novo'        },
  { id: 8,  nome: 'Cigarrete de Frango', preco: 6.50,  descricao: 'Massa crocante com frango desfiado e catupiry.',   imagem: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=85', categoria: 'cigarretes', subcategoria: null                            },
  // Bebidas
  { id: 9,  nome: 'Coca-Cola',           preco: 5.00,  descricao: 'Coca-Cola gelada.',                                imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=85', categoria: 'bebidas',    subcategoria: null,       formatos: ['Lata 350ml', '2 Litros'] },
  { id: 10, nome: 'Suco de Laranja',     preco: 7.50,  descricao: 'Suco natural espremido na hora.',                  imagem: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=85', categoria: 'bebidas',   subcategoria: null,       formatos: ['Copo 300ml']             },
  { id: 11, nome: 'Limonada Suíça',      preco: 9.00,  descricao: 'Limonada cremosa com limão siciliano.',            imagem: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=85', categoria: 'bebidas',    subcategoria: null,       formatos: ['Copo 300ml', '2 Litros'], badge: 'Novo' },
  // Combos
  { id: 12, nome: 'Combo Família',       preco: 49.90, descricao: '10 esfihas à escolha + 2 refrigerantes lata.',    imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85', categoria: 'combos',    subcategoria: null,       badge: 'Oferta'      },
  { id: 13, nome: 'Combo Casal',         preco: 27.90, descricao: '4 esfihas à escolha + 2 refrigerantes lata.',     imagem: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85', categoria: 'combos',    subcategoria: null                            },
]