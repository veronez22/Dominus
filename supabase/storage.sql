-- ── Bucket público para imagens de produtos ──
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

-- Qualquer um pode ver as imagens (público)
create policy "imagens_publicas"
  on storage.objects for select
  using ( bucket_id = 'produtos' );

-- Só autenticado pode fazer upload
create policy "upload_autenticado"
  on storage.objects for insert
  with check ( bucket_id = 'produtos' and auth.role() = 'authenticated' );

-- Só autenticado pode deletar
create policy "delete_autenticado"
  on storage.objects for delete
  using ( bucket_id = 'produtos' and auth.role() = 'authenticated' );
