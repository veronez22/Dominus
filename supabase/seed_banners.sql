-- Migra os banners estáticos existentes para a tabela banners
do $$
declare
  rest_id uuid;
begin
  select id into rest_id from restaurantes where slug = 'dominus';

  insert into banners (restaurante_id, imagem_url, titulo, subtitulo, ordem, ativo)
  values
    (rest_id, '/banners/monte.png',    'MONTE DO SEU JEITO',   'Salgadas, doces e bebidas para todos os gostos.', 0, true),
    (rest_id, '/banners/catupiry.png', 'MAIS CREMOSIDADE ?',   'Adicione catupiry ao seu pedido',                 1, true),
    (rest_id, '/banners/familia.png',  'Combo Família',         'Perfeito para compartilhar com quem você ama.',   2, true),
    (rest_id, '/banners/doce.png',     'FINALIZE COM UM DOCE', 'Experimente nossas esfihas doces irresistíveis.', 3, true);
end $$;
