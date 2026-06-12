const TAMANHO_LABEL = { lata: 'Lata 350ml', ks: 'KS 473ml', '600ml': 'Garrafa Pet 600ml' }

function bebidaDetalhes({ tamanho, gelo, limao, copos }) {
  const partes = []
  if (tamanho) partes.push(TAMANHO_LABEL[tamanho] ?? tamanho)
  if (copos > 1) partes.push(`${copos} copos`)
  if (gelo) partes.push('gelo')
  if (limao) partes.push('limão')
  return partes.join(' · ')
}

// Retorna as linhas extras de um item de pedido (adicionais, removidos, bebida, combo)
// a partir do objeto `extras` salvo em itens_pedido.
export function getExtrasLinhas(extras) {
  if (!extras) return []
  const linhas = []

  for (const a of extras.adicionais || []) {
    linhas.push(`+ ${a.label ?? a}`)
  }
  for (const r of extras.retirados || []) {
    linhas.push(`- Sem ${r.toLowerCase()}`)
  }

  const bebida = bebidaDetalhes(extras)
  if (bebida) linhas.push(bebida)

  const itensCombo = extras.itensCombo || []
  if (extras.tipoCombo && itensCombo.length > 0) {
    linhas.push('Combo:')
    for (const ci of itensCombo) {
      const nome = ci.quantidade > 1 ? `${ci.quantidade}x ${ci.nome}` : `+ ${ci.nome}`
      const detalhes = bebidaDetalhes(ci)
      linhas.push(detalhes ? `  ${nome} (${detalhes})` : `  ${nome}`)
    }
  }

  return linhas
}
