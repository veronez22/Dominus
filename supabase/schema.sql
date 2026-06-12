-- ═══════════════════════════════════════════════
--  DOMINUS — Schema do Banco de Dados
--  Cole este SQL no Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════

-- ── Extensões ──
create extension if not exists "uuid-ossp";

-- ── Restaurantes (base do multi-tenant futuro) ──
create table if not exists restaurantes (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null,
  slug       text unique not null,
  ativo      boolean default true,
  criado_em  timestamptz default now()
);

-- Insere o restaurante padrão
insert into restaurantes (nome, slug)
values ('Dominus', 'dominus')
on conflict (slug) do nothing;

-- ── Categorias ──
create table if not exists categorias (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  nome            text not null,
  slug            text not null,
  ordem           int default 0,
  ativo           boolean default true,
  unique(restaurante_id, slug)
);

-- ── Produtos ──
create table if not exists produtos (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  categoria_id    uuid references categorias(id) on delete set null,
  nome            text not null,
  descricao       text,
  preco           numeric(10,2) not null,
  imagem_url      text,
  disponivel      boolean default true,
  destaque        boolean default false,
  badge           text,        -- 'Mais Pedido' | 'Novo' | 'Oferta' | null
  ordem           int default 0,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- ── Mesas ──
create table if not exists mesas (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  numero          int not null,
  qrcode_url      text,
  ativo           boolean default true,
  unique(restaurante_id, numero)
);

-- ── Pedidos ──
create table if not exists pedidos (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  mesa_id         uuid references mesas(id) on delete set null,
  comanda         text,                    -- ex: CMD-0042
  status          text default 'recebido', -- recebido | preparo | pronto | entregue
  total           numeric(10,2) default 0,
  sincronizado    boolean default true,    -- false = veio do modo offline
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- ── Itens do Pedido ──
create table if not exists itens_pedido (
  id              uuid primary key default uuid_generate_v4(),
  pedido_id       uuid references pedidos(id) on delete cascade,
  produto_id      uuid references produtos(id) on delete set null,
  nome_snapshot   text not null,           -- nome do produto no momento do pedido
  preco_snapshot  numeric(10,2) not null,  -- preço no momento do pedido
  quantidade      int not null default 1,
  observacao      text,
  extras          jsonb -- adicionais, removidos, opções de bebida e itens de combo
);

-- ── Avaliações ──
create table if not exists avaliacoes (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  pedido_id       uuid references pedidos(id) on delete set null,
  mesa_id         uuid references mesas(id) on delete set null,
  nota            int check (nota between 1 and 5),
  comentario      text,
  criado_em       timestamptz default now()
);

-- ═══════════════════════════════════════════════
--  RLS (Row Level Security) — por enquanto aberto
--  Vamos fechar quando implementar autenticação
-- ═══════════════════════════════════════════════
alter table restaurantes  enable row level security;
alter table categorias    enable row level security;
alter table produtos      enable row level security;
alter table mesas         enable row level security;
alter table pedidos       enable row level security;
alter table itens_pedido  enable row level security;
alter table avaliacoes    enable row level security;

-- Políticas abertas temporariamente (leitura e escrita públicas)
create policy "public_all_restaurantes"  on restaurantes  for all using (true) with check (true);
create policy "public_all_categorias"    on categorias    for all using (true) with check (true);
create policy "public_all_produtos"      on produtos      for all using (true) with check (true);
create policy "public_all_mesas"         on mesas         for all using (true) with check (true);
create policy "public_all_pedidos"       on pedidos       for all using (true) with check (true);
create policy "public_all_itens_pedido"  on itens_pedido  for all using (true) with check (true);
create policy "public_all_avaliacoes"    on avaliacoes    for all using (true) with check (true);

-- ═══════════════════════════════════════════════
--  Trigger: atualiza atualizado_em automaticamente
-- ═══════════════════════════════════════════════
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_produtos_atualizado_em
  before update on produtos
  for each row execute function set_atualizado_em();

create trigger trg_pedidos_atualizado_em
  before update on pedidos
  for each row execute function set_atualizado_em();
