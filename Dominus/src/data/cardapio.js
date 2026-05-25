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
  { id: 1,  nome: 'Carne',               preco: 5.15,  descricao: 'Carne bovina cuidadosamente temperada, preparada com ingredientes frescos e assada em massa artesanal.',      imagem: '/produtos/esfihasSalgadas/esfihaCarne.png', categoria: 'esfihas'      },
  { id: 2,  nome: 'Carne c/ Catupiry',   preco: 5.75,  descricao: 'Carne bovina temperada e Catupiry® cremoso, combinando tradição e sabor em cada pedaço.',               imagem: '/produtos/esfihasSalgadas/esfihaCarneCatupiry.jpg', categoria: 'esfihas',       badge: 'Mais Pedido' },
  { id: 3,  nome: 'Calabresa c/ catupiry',              preco: 4.50,  descricao: 'O sabor intenso da calabresa unido à cremosidade do Catupiry® para uma combinação perfeita.',         imagem: '/produtos/esfihasSalgadas/esfihaCalabresaCatupiry.png', categoria: 'esfihas',       badge: 'Mais Pedido' },
  { id: 4,  nome: 'Calabresa', preco: 5.50,  descricao: 'Calabresa selecionada, levemente temperada, em uma massa dourada e macia.',          imagem: '/produtos/esfihasSalgadas/esfihaCalabresa.png', categoria: 'esfihas'    },

  // ── Esfihas Doces ──
  { id: 5,  nome: 'Banana c/ Canela',    preco: 4.50,  descricao: 'Banana caramelizada com toque de canela, trazendo aroma e sabor irresistíveis.',           imagem: '/produtos/esfihasDoces/esfihaBananaCanela.png', categoria: 'esfihas-doces',  badge:'Novo'               },
  { id: 6,  nome: 'Chocolate',           preco: 4.50,  descricao: 'Chocolate cremoso e derretido em uma deliciosa massa assada.',          imagem: '/produtos/esfihasDoces/esfihaChocolate.png', categoria: 'esfihas-doces',      badge:'Mais Pedido'                 },
  { id: 14, nome: 'Romeu e Julieta',     preco: 4.50,  descricao: 'Queijo suave e goiabada selecionada na combinação brasileira mais amada.',              imagem: '/produtos/esfihasDoces/esfihaRomeu.png', categoria: 'esfihas-doces'                       },

  // ── Fogazzas ──
  { id: 15, nome: 'Fogazza de Frango',   preco: 8.90,  descricao: 'Frango desfiado temperado com ingredientes selecionados, envolto em uma massa dourada e crocante que conquista no primeiro pedaço.',     imagem: '/produtos/fogazzas/fogazzaFrango.png', categoria: 'fogazzas'                            },
  { id: 16, nome: 'Fogazza de Carne',    preco: 8.90,  descricao: 'Carne bovina cuidadosamente temperada, envolta em uma massa dourada e crocante.',       imagem: '/produtos/fogazzas/fogazzaCarne.png', categoria: 'fogazzas'                            },
  { id: 17, nome: 'Fogazza de Queijo',   preco: 7.90,  descricao: 'Queijo cremoso e derretido, envolto em uma massa leve, dourada e irresistivelmente crocante.',    imagem: '/produtos/fogazzas/fogazzaQueijo.png', categoria: 'fogazzas'                            },

  // ── Kibes ──
  { id: 18, nome: 'Kibe c/queijo',         preco: 5.50,  descricao: 'Tradicional kibe frito, preparado com carne selecionada e queijo, oferecendo sabor e maciez em cada pedaço.',        imagem: '/produtos/kibe/kibe.png', categoria: 'kibes'                               },


  // ── Cigarretes ──
  { id: 7,  nome: 'Cigarrete de Carne c/Queijo',  preco: 6.50,  descricao: 'Carne bovina cuidadosamente temperada, com queijo, envolta em uma massa leve e crocante que valoriza cada sabor.',    imagem: '/produtos/cigarrete/cigarreteCarne.png', categoria: 'cigarretes',          },
  { id: 8,  nome: 'Cigarrete de Frango', preco: 6.50,  descricao: 'Frango desfiado e temperado com ingredientes selecionados, envolto em uma massa fina e crocante, dourada na medida certa.',  imagem: '/produtos/cigarrete/cigarreteFrango.png', categoria: 'cigarretes'                          },
  { id: 21, nome: 'Cigarrete de Queijo', preco: 6.00,  descricao: 'Queijo cremoso e derretido, envolto em uma massa fina e crocante para uma experiência irresistível.',   imagem: '/produtos/cigarrete/cigarreteQueijo.png', categoria: 'cigarretes'                          },

  // ── Coxinhas ──
  { id: 22, nome: 'Coxinha de Frango',   preco: 6.00,  descricao: 'Frango desfiado e temperado com ingredientes selecionados, envolvido por uma massa macia e dourada, com sabor irresistível em cada mordida.',        imagem: '/produtos/coxinha/coxinhaFrango.png', categoria: 'coxinhas',      badge: 'Novo'        },


  // ── Bebidas ──
  { id: 9,  nome: 'Coca-Cola',           preco: 5.00,  descricao: 'O sabor clássico e refrescante da Coca-Cola, perfeita para acompanhar qualquer pedido.',                               imagem: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=85', categoria: 'bebidas',       formatos: ['Lata 350ml', '2 Litros'] },
  { id: 10, nome: 'Suco de Laranja',     preco: 7.50,  descricao: 'Suco de laranja refrescante, preparado para realçar o sabor natural e cítrico da fruta.',                 imagem: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=85', categoria: 'bebidas',      formatos: ['Copo 300ml']             },
  { id: 11, nome: 'Limonada Suíça',      preco: 9.00,  descricao: 'Preparada com limões frescos e batida na hora, oferecendo equilíbrio perfeito entre refrescância e cremosidade.',           imagem: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=85', categoria: 'bebidas',      formatos: ['Copo 300ml', '2 Litros'], badge: 'Novo' },

  // ── Diversos ──
  { id: 25, nome: 'Pão de Queijo',       preco: 4.00,  descricao: 'Pão de queijo quentinho, crocante por fora.',     imagem: '/produtos/paoDeQueijo.jpg', categoria: 'diversos'                            },
  // ── Combos ──
  { id: 12, nome: 'Combo Família',       preco: 49.90, descricao: '10 esfihas à escolha + 2 refrigerantes lata.',   imagem: '/banners/comboFamilia.jpg', categoria: 'combos',        badge: 'Oferta'      },
  { id: 13, nome: 'Combo Casal',         preco: 27.90, descricao: '4 esfihas à escolha + 2 refrigerantes lata.',    imagem: '/produtos/combao.jpg', categoria: 'combos'                              },
  { id: 28, nome: 'Combo Amigos',        preco: 39.90, descricao: '6 esfihas + 2 cigarretes + 2 refrigerantes.',    imagem: '/banners/esfihas.jpg', categoria: 'combos'                              },
]