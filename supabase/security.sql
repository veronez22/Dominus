-- ═══════════════════════════════════════════════
--  DOMINUS — Políticas de Segurança (RLS)
--  Cole no Supabase > SQL Editor > Run
--  Substitui as políticas abertas do schema.sql
-- ═══════════════════════════════════════════════

-- Remove as políticas abertas temporárias
drop policy if exists "public_all_restaurantes"  on restaurantes;
drop policy if exists "public_all_categorias"    on categorias;
drop policy if exists "public_all_produtos"      on produtos;
drop policy if exists "public_all_mesas"         on mesas;
drop policy if exists "public_all_pedidos"       on pedidos;
drop policy if exists "public_all_itens_pedido"  on itens_pedido;
drop policy if exists "public_all_avaliacoes"    on avaliacoes;

-- ─────────────────────────────────────────
--  RESTAURANTES
--  Só leitura pública. Escrita = admin autenticado.
-- ─────────────────────────────────────────
create policy "restaurantes_leitura_publica"
  on restaurantes for select using (true);

create policy "restaurantes_escrita_admin"
  on restaurantes for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  CATEGORIAS
--  Leitura pública (tablete precisa listar).
--  Escrita somente autenticado (gerente).
-- ─────────────────────────────────────────
create policy "categorias_leitura_publica"
  on categorias for select using (ativo = true);

create policy "categorias_escrita_admin"
  on categorias for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  PRODUTOS
--  Leitura pública (tablete exibe o cardápio).
--  Escrita somente autenticado (gerente).
-- ─────────────────────────────────────────
create policy "produtos_leitura_publica"
  on produtos for select using (true);

create policy "produtos_escrita_admin"
  on produtos for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  MESAS
--  Leitura pública (tablete precisa saber sua mesa).
--  Escrita somente autenticado.
-- ─────────────────────────────────────────
create policy "mesas_leitura_publica"
  on mesas for select using (ativo = true);

create policy "mesas_escrita_admin"
  on mesas for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  PEDIDOS
--  INSERT público — cliente envia o pedido sem login.
--  SELECT/UPDATE somente autenticado — cozinha e gerente.
-- ─────────────────────────────────────────
create policy "pedidos_insert_publico"
  on pedidos for insert with check (true);

create policy "pedidos_leitura_admin"
  on pedidos for select
  using (auth.role() = 'authenticated');

create policy "pedidos_update_admin"
  on pedidos for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  ITENS DO PEDIDO
--  INSERT público (junto com o pedido).
--  SELECT/UPDATE somente autenticado.
-- ─────────────────────────────────────────
create policy "itens_insert_publico"
  on itens_pedido for insert with check (true);

create policy "itens_leitura_admin"
  on itens_pedido for select
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
--  AVALIAÇÕES
--  INSERT público — cliente avalia sem login.
--  SELECT somente autenticado — gerente analisa métricas.
-- ─────────────────────────────────────────
create policy "avaliacoes_insert_publico"
  on avaliacoes for insert with check (true);

create policy "avaliacoes_leitura_admin"
  on avaliacoes for select
  using (auth.role() = 'authenticated');
