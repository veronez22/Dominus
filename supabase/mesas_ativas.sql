-- ═══════════════════════════════════════════════
--  DOMINUS — Controle de mesas ativas por tablet
--  Cole este SQL no Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════

-- Cada linha representa "este tablet (device_id) está usando esta mesa agora".
-- Impede que dois tablets fiquem configurados com o mesmo número de mesa.
create table if not exists mesas_ativas (
  restaurante_id  uuid not null references restaurantes(id) on delete cascade,
  mesa            int not null,
  device_id       text not null,
  atualizado_em   timestamptz default now(),
  primary key (restaurante_id, mesa)
);

alter table mesas_ativas enable row level security;

create policy "public_all_mesas_ativas" on mesas_ativas for all using (true) with check (true);
