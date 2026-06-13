// Script de TESTE de carga: insere vários pedidos numa comanda fixa (CMD-9999).
// Usa a mesma cadeia de tabelas que o app: sessoes_comanda -> pedidos -> itens_pedido.
// Limpeza: node scripts/teste-comanda.mjs limpar
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(Boolean).map(l => {
      const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const COMANDA = 'CMD-9999'
const MESA = '99'
const acao = process.argv[2] || 'inserir'
const N_PEDIDOS = parseInt(process.argv[3]) || 8

async function getRest() {
  const { data, error } = await supabase.from('restaurantes').select('id').eq('slug', 'dominus').single()
  if (error) throw error
  return data.id
}

async function limpar() {
  const restId = await getRest()
  // acha pedidos da comanda de teste
  const { data: peds } = await supabase.from('pedidos').select('id').eq('comanda', COMANDA).eq('restaurante_id', restId)
  const ids = (peds || []).map(p => p.id)
  if (ids.length) {
    await supabase.from('itens_pedido').delete().in('pedido_id', ids)
    await supabase.from('pedidos').delete().in('id', ids)
  }
  await supabase.from('sessoes_comanda').delete().eq('codigo', COMANDA).eq('restaurante_id', restId)
  console.log(`Limpeza: ${ids.length} pedidos + itens + sessao da comanda ${COMANDA} removidos.`)
}

async function inserir() {
  const t0 = Date.now()
  const restId = await getRest()

  const { data: produtos, error: prodErr } = await supabase
    .from('produtos').select('id, nome, preco').eq('disponivel', true).limit(12)
  if (prodErr) throw prodErr
  if (!produtos?.length) throw new Error('Sem produtos disponíveis')

  // sessão da comanda (cria se não existir)
  let { data: sessao } = await supabase.from('sessoes_comanda')
    .select('id').eq('codigo', COMANDA).eq('restaurante_id', restId).is('encerrada_em', null).maybeSingle()
  if (!sessao) {
    const { data, error } = await supabase.from('sessoes_comanda')
      .insert({ restaurante_id: restId, codigo: COMANDA, mesa: MESA }).select('id').single()
    if (error) throw error
    sessao = data
  }

  const tempos = []
  for (let p = 0; p < N_PEDIDOS; p++) {
    const tp = Date.now()
    // 1 a 4 itens variados por pedido
    const qtdItens = 1 + (p % 4)
    const itens = Array.from({ length: qtdItens }, (_, k) => produtos[(p + k) % produtos.length])
    const total = itens.reduce((s, i) => s + Number(i.preco), 0)

    const { data: pedido, error: pedErr } = await supabase.from('pedidos').insert({
      restaurante_id: restId, comanda: COMANDA, sessao_id: sessao.id,
      total, status: 'recebido', mesa: MESA,
    }).select().single()
    if (pedErr) throw pedErr

    const itensSup = itens.map(i => ({
      pedido_id: pedido.id, produto_id: i.id, nome_snapshot: i.nome,
      preco_snapshot: i.preco, quantidade: 1,
      extras: { adicionais: [], retirados: [], tamanho: null, gelo: false, limao: false, copos: null, tipoCombo: null, itensCombo: [] },
    }))
    const { error: itensErr } = await supabase.from('itens_pedido').insert(itensSup)
    if (itensErr) throw itensErr
    tempos.push(Date.now() - tp)
  }

  console.log(JSON.stringify({
    comanda: COMANDA, pedidosCriados: N_PEDIDOS,
    msTotal: Date.now() - t0,
    msPorPedido: Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length),
    piorPedidoMs: Math.max(...tempos),
  }, null, 2))
}

if (acao === 'limpar') await limpar()
else await inserir()
