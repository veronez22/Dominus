-- ═══════════════════════════════════════════════
--  DOMINUS — Seed: Categorias + Produtos
--  Rode DEPOIS do schema.sql
-- ═══════════════════════════════════════════════

-- Pega o ID do restaurante Dominus
do $$
declare
  rest_id  uuid;
  cat_esfihas       uuid;
  cat_esfihas_doces uuid;
  cat_fogazzas      uuid;
  cat_kibes         uuid;
  cat_cigarretes    uuid;
  cat_coxinhas      uuid;
  cat_bebidas       uuid;
  cat_diversos      uuid;
  cat_combos        uuid;
begin

  select id into rest_id from restaurantes where slug = 'dominus';

  -- ── Categorias ──
  insert into categorias (restaurante_id, nome, slug, ordem)
  values
    (rest_id, 'Esfihas Salgadas', 'esfihas',        1),
    (rest_id, 'Esfihas Doces',    'esfihas-doces',  2),
    (rest_id, 'Fogazzas',         'fogazzas',        3),
    (rest_id, 'Kibes',            'kibes',           4),
    (rest_id, 'Cigarretes',       'cigarretes',      5),
    (rest_id, 'Coxinhas',         'coxinhas',        6),
    (rest_id, 'Bebidas',          'bebidas',         7),
    (rest_id, 'Diversos',         'diversos',        8),
    (rest_id, 'Combos',           'combos',          9)
  on conflict (restaurante_id, slug) do nothing;

  select id into cat_esfihas       from categorias where restaurante_id = rest_id and slug = 'esfihas';
  select id into cat_esfihas_doces from categorias where restaurante_id = rest_id and slug = 'esfihas-doces';
  select id into cat_fogazzas      from categorias where restaurante_id = rest_id and slug = 'fogazzas';
  select id into cat_kibes         from categorias where restaurante_id = rest_id and slug = 'kibes';
  select id into cat_cigarretes    from categorias where restaurante_id = rest_id and slug = 'cigarretes';
  select id into cat_coxinhas      from categorias where restaurante_id = rest_id and slug = 'coxinhas';
  select id into cat_bebidas       from categorias where restaurante_id = rest_id and slug = 'bebidas';
  select id into cat_diversos      from categorias where restaurante_id = rest_id and slug = 'diversos';
  select id into cat_combos        from categorias where restaurante_id = rest_id and slug = 'combos';

  -- ── Produtos ──
  insert into produtos (restaurante_id, categoria_id, nome, descricao, preco, imagem_url, badge, destaque, ordem) values

  -- Esfihas Salgadas
  (rest_id, cat_esfihas, 'Carne',
   'Carne bovina cuidadosamente temperada, preparada com ingredientes frescos e assada em massa artesanal.',
   5.15, '/produtos/esfihasSalgadas/esfihaCarne.png', null, false, 1),

  (rest_id, cat_esfihas, 'Carne c/ Catupiry',
   'Carne bovina temperada e Catupiry® cremoso, combinando tradição e sabor em cada pedaço.',
   5.75, '/produtos/esfihasSalgadas/esfihaCarneCatupiry.jpg', 'Mais Pedido', true, 2),

  (rest_id, cat_esfihas, 'Calabresa c/ Catupiry',
   'O sabor intenso da calabresa unido à cremosidade do Catupiry® para uma combinação perfeita.',
   4.50, '/produtos/esfihasSalgadas/esfihaCalabresaCatupiry.png', 'Mais Pedido', true, 3),

  (rest_id, cat_esfihas, 'Calabresa',
   'Calabresa selecionada, levemente temperada, em uma massa dourada e macia.',
   5.50, '/produtos/esfihasSalgadas/esfihaCalabresa.png', null, false, 4),

  -- Esfihas Doces
  (rest_id, cat_esfihas_doces, 'Banana c/ Canela',
   'Banana caramelizada com toque de canela, trazendo aroma e sabor irresistíveis.',
   4.50, '/produtos/esfihasDoces/esfihaBananaCanela.png', 'Novo', false, 1),

  (rest_id, cat_esfihas_doces, 'Chocolate',
   'Chocolate cremoso e derretido em uma deliciosa massa assada.',
   4.50, '/produtos/esfihasDoces/esfihaChocolate.png', 'Mais Pedido', true, 2),

  (rest_id, cat_esfihas_doces, 'Romeu e Julieta',
   'Queijo suave e goiabada selecionada na combinação brasileira mais amada.',
   4.50, '/produtos/esfihasDoces/esfihaRomeu.png', null, false, 3),

  -- Fogazzas
  (rest_id, cat_fogazzas, 'Fogazza de Frango',
   'Frango desfiado temperado com ingredientes selecionados, envolto em uma massa dourada e crocante.',
   8.90, '/produtos/fogazzas/fogazzaFrango.png', null, false, 1),

  (rest_id, cat_fogazzas, 'Fogazza de Carne',
   'Carne bovina cuidadosamente temperada, envolta em uma massa dourada e crocante.',
   8.90, '/produtos/fogazzas/fogazzaCarne.png', null, false, 2),

  (rest_id, cat_fogazzas, 'Fogazza de Queijo',
   'Queijo cremoso e derretido, envolto em uma massa leve, dourada e irresistivelmente crocante.',
   7.90, '/produtos/fogazzas/fogazzaQueijo.png', null, false, 3),

  -- Kibes
  (rest_id, cat_kibes, 'Kibe c/ Queijo',
   'Tradicional kibe frito, preparado com carne selecionada e queijo, oferecendo sabor e maciez em cada pedaço.',
   5.50, '/produtos/kibe/kibe.png', null, false, 1),

  -- Cigarretes
  (rest_id, cat_cigarretes, 'Cigarrete de Carne c/ Queijo',
   'Carne bovina cuidadosamente temperada, com queijo, envolta em uma massa leve e crocante.',
   6.50, '/produtos/cigarrete/cigarreteCarne.png', null, false, 1),

  (rest_id, cat_cigarretes, 'Cigarrete de Frango',
   'Frango desfiado e temperado com ingredientes selecionados, envolto em uma massa fina e crocante.',
   6.50, '/produtos/cigarrete/cigarreteFrango.png', null, false, 2),

  (rest_id, cat_cigarretes, 'Cigarrete de Queijo',
   'Queijo cremoso e derretido, envolto em uma massa fina e crocante para uma experiência irresistível.',
   6.00, '/produtos/cigarrete/cigarreteQueijo.png', null, false, 3),

  -- Coxinhas
  (rest_id, cat_coxinhas, 'Coxinha de Frango',
   'Frango desfiado e temperado com ingredientes selecionados, envolvido por uma massa macia e dourada.',
   6.00, '/produtos/coxinha/coxinhaFrango.png', 'Novo', false, 1),

  -- Bebidas
  (rest_id, cat_bebidas, 'Coca-Cola',
   'O sabor clássico e refrescante da Coca-Cola, perfeita para acompanhar qualquer pedido.',
   5.00, '/produtos/coca.jpg', null, false, 1),

  (rest_id, cat_bebidas, 'Suco de Laranja',
   'Suco de laranja refrescante, preparado para realçar o sabor natural e cítrico da fruta.',
   7.50, '/produtos/suco.jpg', null, false, 2),

  (rest_id, cat_bebidas, 'Limonada Suíça',
   'Preparada com limões frescos e batida na hora, oferecendo equilíbrio perfeito entre refrescância e cremosidade.',
   9.00, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=85', 'Novo', false, 3),

  -- Diversos
  (rest_id, cat_diversos, 'Pão de Queijo',
   'Pão de queijo quentinho, crocante por fora.',
   4.00, '/produtos/paoDeQueijo.jpg', null, false, 1),

  -- Combos
  (rest_id, cat_combos, 'Combo Família',
   '10 esfihas à escolha + 2 refrigerantes lata.',
   49.90, '/banners/comboFamilia.jpg', 'Oferta', true, 1),

  (rest_id, cat_combos, 'Combo Casal',
   '4 esfihas à escolha + 2 refrigerantes lata.',
   27.90, '/produtos/combao.jpg', null, false, 2),

  (rest_id, cat_combos, 'Combo Amigos',
   '6 esfihas + 2 cigarretes + 2 refrigerantes.',
   39.90, '/banners/esfihas.jpg', null, false, 3);

  -- Mesas padrão (1 a 10)
  insert into mesas (restaurante_id, numero)
  select rest_id, generate_series(1, 10)
  on conflict (restaurante_id, numero) do nothing;

end $$;
