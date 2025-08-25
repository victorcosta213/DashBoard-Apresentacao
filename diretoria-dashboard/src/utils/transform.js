import dayjs from 'dayjs'

export function processData(rows) {
  const norm = rows.map((r) => {
    const nome = (r['NOME'] || '').trim()
    const lotacao = (r['LOTAÇÃO'] || r['LOTACAO'] || '').trim()
    const funcao = (r['FUNÇÃO'] || r['FUNCAO'] || '').trim()

    // Normalização forte de CARGO
    let cargo = (r['CARGO'] || '').trim().toUpperCase()
    cargo = cargo
      .replace('COMISSIONADA', 'COMISSIONADO')
      .replace('EFETIVA', 'EFETIVO')
      .replace('ESTÁGIO', 'ESTAGIÁRIO')
      .replace('ESTAGIARIO', 'ESTAGIÁRIO')
      .replace('ESTAGIÁRIA', 'ESTAGIÁRIO')

    const validos = new Set(['EFETIVO', 'COMISSIONADO', 'ESTAGIÁRIO'])
    if (!validos.has(cargo)) {
      // qualquer coisa fora do padrão vira OUTROS (ex.: "INSS")
      cargo = 'OUTROS'
    }

    const adm = parseDate(r['DATA ADMISSÃO'])
    const dem = parseDate(r['DATA DEMISSÃO'])
    const ativo = !dem

    return {
      NOME: nome,
      LOTAÇÃO: lotacao,
      FUNÇÃO: funcao,
      CARGO: cargo,
      DATA_ADMISSAO: adm,
      DATA_DEMISSAO: dem,
      ATIVO: ativo,
    }
  })

  const total = norm.length
  const ativos = norm.filter((c) => c.ATIVO).length
  const desligados = total - ativos

  const porCargo = groupCount(norm, (c) => c.CARGO).map(([name, value]) => ({ name, value }))
  const porLotacao = groupCount(norm, (c) => c.LOTAÇÃO)
    .map(([lot, qtd]) => ({ lot, qtd }))
    .sort((a, b) => b.qtd - a.qtd)

  const serieMap = new Map()
  for (const c of norm) {
    if (c.DATA_ADMISSAO) bump(serieMap, dayjs(c.DATA_ADMISSAO).format('YYYY-MM'), 'adm')
    if (c.DATA_DEMISSAO) bump(serieMap, dayjs(c.DATA_DEMISSAO).format('YYYY-MM'), 'dem')
  }
  const serieMensal = [...serieMap.values()].sort((a, b) => a.mes.localeCompare(b.mes))

  return { colaboradores: norm, serieMensal, porCargo, porLotacao, kpis: { total, ativos, desligados } }
}

function parseDate(v) {
  if (!v) return null
  const str = String(v).trim()
  if (!str || str === '***') return null
  const d = dayjs(str)
  return d.isValid() ? d.toDate() : null
}

function groupCount(arr, keyFn) {
  const m = new Map()
  arr.forEach((x) => {
    const k = keyFn(x) || '—'
    m.set(k, (m.get(k) || 0) + 1)
  })
  return [...m.entries()]
}
function bump(map, key, field) {
  const cur = map.get(key) || { mes: key, adm: 0, dem: 0 }
  cur[field] += 1
  map.set(key, cur)
}
