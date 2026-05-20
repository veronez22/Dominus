// ── Categorias principais (aside principal) ──
export const categoriasPrincipais = [
  { id: 'destaques', label: 'Destaques' },
  { id: 'cardapio',  label: 'Cardápio'  },
  { id: 'combos',    label: 'Combos'    },
]

// ── Subcategorias (sub-aside) — só aparece ao clicar em Cardápio ──
export const subcategorias = [
  { id: 'esfihas',        label: 'Esfihas',        grupo: 'cardapio' },
  { id: 'esfihas-doces',  label: 'Esfihas Doces',  grupo: 'cardapio' },
  { id: 'fogazzas',       label: 'Fogazzas',        grupo: 'cardapio' },
  { id: 'kibes',          label: 'Kibes',           grupo: 'cardapio' },
  { id: 'cigarretes',     label: 'Cigarretes',      grupo: 'cardapio' },
  { id: 'coxinhas',       label: 'Coxinhas',        grupo: 'cardapio' },
  { id: 'bebidas',        label: 'Bebidas',         grupo: 'cardapio' },
  { id: 'diversos',       label: 'Diversos',        grupo: 'cardapio' },
]

// ── Mantém compatibilidade com o restante do app ──
export const categorias = [
  { id: 'destaques',     label: 'Destaques'     },
  { id: 'esfihas',       label: 'Esfihas'       },
  { id: 'esfihas-doces', label: 'Esfihas Doces' },
  { id: 'fogazzas',      label: 'Fogazzas'      },
  { id: 'kibes',         label: 'Kibes'         },
  { id: 'cigarretes',    label: 'Cigarretes'    },
  { id: 'coxinhas',      label: 'Coxinhas'      },
  { id: 'bebidas',       label: 'Bebidas'       },
  { id: 'diversos',      label: 'Diversos'      },
  { id: 'combos',        label: 'Combos'        },
]

export const cardapio = [
  // ── Esfihas Salgadas ──
  { id: 1,  nome: 'Carne',               preco: 5.15,  descricao: 'Carne moída temperada com cebola e tomate.',      imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', categoria: 'esfihas',       badge: 'Novo'        },
  { id: 2,  nome: 'Carne c/ Catupiry',   preco: 5.75,  descricao: 'Carne moída com catupiry cremoso.',               imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85', categoria: 'esfihas',       badge: 'Mais Pedido' },
  { id: 3,  nome: 'Queijo',              preco: 4.50,  descricao: 'Mussarela derretida com orégano fresco.',         imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85', categoria: 'esfihas',       badge: 'Mais Pedido' },
  { id: 4,  nome: 'Frango c/ Requeijão', preco: 5.50,  descricao: 'Frango desfiado com requeijão cremoso.',          imagem: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=85', categoria: 'esfihas',       badge: 'Favorito'    },
  // ── Esfihas Doces ──
  { id: 5,  nome: 'Banana c/ Canela',    preco: 4.50,  descricao: 'Banana com canela e leite condensado.',           imagem: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=85', categoria: 'esfihas-doces'                       },
  { id: 6,  nome: 'Chocolate',           preco: 4.50,  descricao: 'Recheio cremoso de chocolate ao leite.',          imagem: 'https://images.unsplash.com/photo-1548340748-6af6c8b46424?w=600&q=85', categoria: 'esfihas-doces'                       },
  { id: 14, nome: 'Romeu e Julieta',     preco: 4.50,  descricao: 'Goiabada cremosa com queijo minas.',              imagem: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=85', categoria: 'esfihas-doces'                       },
  // ── Fogazzas ──
  { id: 15, nome: 'Fogazza de Frango',   preco: 8.90,  descricao: 'Pão fofinho recheado com frango e catupiry.',     imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85', categoria: 'fogazzas'                            },
  { id: 16, nome: 'Fogazza de Carne',    preco: 8.90,  descricao: 'Pão fofinho recheado com carne temperada.',       imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', categoria: 'fogazzas'                            },
  { id: 17, nome: 'Fogazza de Queijo',   preco: 7.90,  descricao: 'Pão fofinho com queijo derretido por dentro.',    imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85', categoria: 'fogazzas'                            },
  // ── Kibes ──
  { id: 18, nome: 'Kibe Assado',         preco: 5.50,  descricao: 'Kibe assado no forno com hortelã fresca.',        imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', categoria: 'kibes'                               },
  { id: 19, nome: 'Kibe Frito',          preco: 5.50,  descricao: 'Kibe frito crocante por fora, suculento por dentro.', imagem: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=85', categoria: 'kibes'                       },
  { id: 20, nome: 'Kibe c/ Catupiry',    preco: 6.50,  descricao: 'Kibe frito recheado com catupiry cremoso.',       imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85', categoria: 'kibes',         badge: 'Novo'        },
  // ── Cigarretes ──
  { id: 7,  nome: 'Cigarrete de Carne',  preco: 6.50,  descricao: 'Massa crocante recheada com carne temperada.',    imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85', categoria: 'cigarretes',    badge: 'Novo'        },
  { id: 8,  nome: 'Cigarrete de Frango', preco: 6.50,  descricao: 'Massa crocante com frango desfiado e catupiry.',  imagem: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=85', categoria: 'cigarretes'                          },
  { id: 21, nome: 'Cigarrete de Queijo', preco: 6.00,  descricao: 'Massa crocante recheada com queijo derretido.',   imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85', categoria: 'cigarretes'                          },
  // ── Coxinhas ──
  { id: 22, nome: 'Coxinha de Frango',   preco: 6.00,  descricao: 'Coxinha tradicional com frango desfiado.',        imagem: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=85', categoria: 'coxinhas',      badge: 'Novo'        },
  { id: 23, nome: 'Coxinha c/ Catupiry', preco: 6.50,  descricao: 'Coxinha de frango com catupiry cremoso.',         imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85', categoria: 'coxinhas'                            },
  { id: 24, nome: 'Coxinha de Carne',    preco: 6.50,  descricao: 'Coxinha recheada com carne moída temperada.',     imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=85', categoria: 'coxinhas'                            },
  // ── Bebidas ──
  { id: 9,  nome: 'Coca-Cola',           preco: 5.00,  descricao: 'Coca-Cola gelada.',                               imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=85', categoria: 'bebidas',       formatos: ['Lata 350ml', '2 Litros'] },
  { id: 10, nome: 'Suco de Laranja',     preco: 7.50,  descricao: 'Suco natural espremido na hora.',                 imagem: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=85', categoria: 'bebidas',      formatos: ['Copo 300ml']             },
  { id: 11, nome: 'Limonada Suíça',      preco: 9.00,  descricao: 'Limonada cremosa com limão siciliano.',           imagem: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=85', categoria: 'bebidas',      formatos: ['Copo 300ml', '2 Litros'], badge: 'Novo' },
  // ── Diversos ──
  { id: 25, nome: 'Pão de Queijo',       preco: 4.00,  descricao: 'Pão de queijo quentinho, crocante por fora.',     imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85', categoria: 'diversos'                            },
  { id: 26, nome: 'Pastel de Forno',     preco: 5.50,  descricao: 'Pastel assado com recheio a escolha.',            imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85', categoria: 'diversos'                            },
  { id: 27, nome: 'Bolinha de Queijo',   preco: 5.00,  descricao: 'Bolinha frita recheada com queijo cremoso.',      imagem: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=85', categoria: 'diversos'                            },
  // ── Combos ──
  { id: 12, nome: 'Combo Família',       preco: 49.90, descricao: '10 esfihas à escolha + 2 refrigerantes lata.',   imagem: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=85', categoria: 'combos',        badge: 'Oferta'      },
  { id: 13, nome: 'Combo Casal',         preco: 27.90, descricao: '4 esfihas à escolha + 2 refrigerantes lata.',    imagem: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85', categoria: 'combos'                              },
  { id: 28, nome: 'Combo Amigos',        preco: 39.90, descricao: '6 esfihas + 2 cigarretes + 2 refrigerantes.',    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85', categoria: 'combos'                              },
]