-- ═══════════════════════════════════════════════
--  Feature #6 — Avaliação granular
--  Adiciona notas por categoria + dados do cliente
--  na tabela `avaliacoes`. Idempotente (if not exists).
--  Rodar no Supabase → SQL Editor.
-- ═══════════════════════════════════════════════

-- Notas por categoria (1 a 5). comida/ambiente/atendimento
-- podem já existir; o "if not exists" garante segurança.
alter table avaliacoes add column if not exists nota_comida      int check (nota_comida      between 1 and 5);
alter table avaliacoes add column if not exists nota_bebida      int check (nota_bebida      between 1 and 5);
alter table avaliacoes add column if not exists nota_ambiente    int check (nota_ambiente    between 1 and 5);
alter table avaliacoes add column if not exists nota_atendimento int check (nota_atendimento between 1 and 5);
alter table avaliacoes add column if not exists nota_musica      int check (nota_musica      between 1 and 5);

-- Dados opcionais do cliente (do formulário do modal)
alter table avaliacoes add column if not exists nome    text;
alter table avaliacoes add column if not exists email   text;
alter table avaliacoes add column if not exists comanda text;
