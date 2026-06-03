-- ── Tabela de banners ──
create table if not exists banners (
  id              uuid primary key default uuid_generate_v4(),
  restaurante_id  uuid references restaurantes(id) on delete cascade,
  imagem_url      text not null,
  titulo          text,
  subtitulo       text,
  ordem           int default 0,
  ativo           boolean default true,
  criado_em       timestamptz default now()
);

alter table banners enable row level security;

create policy "banners_leitura_publica"
  on banners for select using (ativo = true);

create policy "banners_escrita_admin"
  on banners for all
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Bucket para banners ──
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "banners_imagens_publicas"
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "banners_upload_autenticado"
  on storage.objects for insert
  with check ( bucket_id = 'banners' and auth.role() = 'authenticated' );

create policy "banners_delete_autenticado"
  on storage.objects for delete
  using ( bucket_id = 'banners' and auth.role() = 'authenticated' );
