-- ═══════════════════════════════════════════════
--  Salva adicionais, removidos, opções de bebida e
--  itens de combo de cada item do pedido, para que
--  a cozinha e a notinha impressa mostrem tudo.
--  Idempotente (if not exists).
--  Rodar no Supabase → SQL Editor.
-- ═══════════════════════════════════════════════

alter table itens_pedido add column if not exists extras jsonb;
