import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { Layout, Typography, Space, ConfigProvider, Grid, theme as AntTheme } from 'antd'
import Papa from 'papaparse'

// Dayjs + plugins
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import minMax from 'dayjs/plugin/minMax'
dayjs.extend(isBetween); dayjs.extend(isSameOrBefore); dayjs.extend(minMax)

import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'

import './styles.css'
import { processData } from './utils/transform'
import { PALETTE } from './theme'

import KpiCards from './components/KpiCards'
import Filters from './components/Filters'
import { ChartsRow, LotacaoBar, ActiveByLocationBar } from './components/Charts'
import PeriodBalance from './components/PeriodBalance'
import Turnover from './components/Turnover'
import HeadcountStacked from './components/HeadcountStacked'
import DataTable from './components/DataTable'
import OverlaySpinner from './components/OverlaySpinner'
import DashboardSkeleton from './components/DashboardSkeleton'
import EfetivosCohortTable from './components/EfetivosCohortTable'

// 👇 NOVO
import VariaRemuneracao from './components/VariaRemuneracao'

const { Header, Content } = Layout
const { Title, Text } = Typography

export default function App() {
  // ===== Tema (claro/escuro) =====
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme-mode')
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme-mode', dark ? 'dark' : 'light')
  }, [dark])

  // ===== Responsividade =====
  const screens = Grid.useBreakpoint()
  const isMobile = !!screens.xs
  const chartH = isMobile ? 220 : 320
  const smallChartH = isMobile ? 200 : 280

  // ===== Carregamento do CSV =====
  const [csvLoading, setCsvLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  useEffect(() => {
    setCsvLoading(true)
    Papa.parse('/data/dados_diretoria_limpos.csv', {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data as any[])
        setTimeout(() => setCsvLoading(false), 250)
      },
      error: () => setCsvLoading(false),
    })
  }, [])

  // ===== Estados de filtros + transição suave =====
  const [cargoFilter, _setCargoFilter] = useState<string | undefined>()
  const [lotacaoFilter, _setLotacaoFilter] = useState<string | undefined>()
  const [periodo, _setPeriodo] = useState<any[] | undefined>() // [dayjs, dayjs] | undefined
  const [isPending, startTransition] = useTransition()

  const setCargoFilter = (v?: string) => startTransition(() => _setCargoFilter(v))
  const setLotacaoFilter = (v?: string) => startTransition(() => _setLotacaoFilter(v))
  const setPeriodo = (v?: any[]) => startTransition(() => _setPeriodo(v))

  // ===== Transformações =====
  const { colaboradores, serieMensal, porCargo, porLotacao, kpis } = useMemo(
    () => processData(rows),
    [rows]
  )

  const cargos = useMemo(
    () => [...new Set(colaboradores.map((c: any) => c.CARGO).filter(Boolean))],
    [colaboradores]
  )
  const lotacoes = useMemo(
    () => [...new Set(colaboradores.map((c: any) => c.LOTAÇÃO).filter(Boolean))],
    [colaboradores]
  )

  const hasValidPeriodo = useMemo(() => (
    Array.isArray(periodo) &&
    periodo[0] != null &&
    periodo[1] != null &&
    dayjs(periodo[0]).isValid() &&
    dayjs(periodo[1]).isValid()
  ), [periodo])

  const periodMetrics = useMemo(() => {
    if (!hasValidPeriodo) return { admissoes: 0, desligamentos: 0, saldo: 0 }
    const ini = dayjs(periodo![0]).startOf('day')
    const fim = dayjs(periodo![1]).endOf('day')
    let adm = 0, dem = 0
    for (const c of colaboradores as any[]) {
      if (c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isBetween(ini, fim, 'day', '[]')) adm++
      if (c.DATA_DEMISSAO && dayjs(c.DATA_DEMISSAO).isBetween(ini, fim, 'day', '[]')) dem++
    }
    return { admissoes: adm, desligamentos: dem, saldo: adm - dem }
  }, [colaboradores, periodo, hasValidPeriodo])

  const saldoMensal = useMemo(() => {
    return (serieMensal || []).map(({ mes, adm, dem }: any) => ({
      mes, saldo: (adm || 0) - (dem || 0),
    }))
  }, [serieMensal])

  const monthsGlobal = useMemo(() => {
    if (!(colaboradores as any[]).length) return []
    const allDates: dayjs.Dayjs[] = []
    ;(colaboradores as any[]).forEach(c => {
      if (c.DATA_ADMISSAO) allDates.push(dayjs(c.DATA_ADMISSAO))
      if (c.DATA_DEMISSAO) allDates.push(dayjs(c.DATA_DEMISSAO))
    })
    const start = (allDates.length ? dayjs.min(allDates)! : dayjs()).startOf('month')
    const end = (allDates.length ? dayjs.max(allDates)! : dayjs()).endOf('month')

    const months: string[] = []
    let cursor = start.startOf('month')
    while (cursor.isBefore(end, 'month') || cursor.isSame(end, 'month')) {
      months.push(cursor.format('YYYY-MM'))
      cursor = cursor.add(1, 'month')
    }
    return months
  }, [colaboradores])

  const monthlyHeadcount = useMemo(() => {
    if (!monthsGlobal.length) return []
    return monthsGlobal.map(ym => {
      const endOfMonth = dayjs(ym + '-01').endOf('month')
      const headcount = (colaboradores as any[]).reduce((acc, c) => {
        const admitted = !!c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isSameOrBefore(endOfMonth, 'day')
        const notTerminated = !c.DATA_DEMISSAO || dayjs(c.DATA_DEMISSAO).isAfter(endOfMonth, 'day')
        return acc + (admitted && notTerminated ? 1 : 0)
      }, 0)
      return { mes: ym, headcount }
    })
  }, [monthsGlobal, colaboradores])

  const stackedByLocation = useMemo(() => {
    if (!monthsGlobal.length) return { data: [], keys: [] as string[] }
    const rows = monthsGlobal.map(ym => {
      const endOfMonth = dayjs(ym + '-01').endOf('month')
      const map = new Map<string, number>()
      ;(colaboradores as any[]).forEach(c => {
        const admitted = !!c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isSameOrBefore(endOfMonth, 'day')
        const notTerminated = !c.DATA_DEMISSAO || dayjs(c.DATA_DEMISSAO).isAfter(endOfMonth, 'day')
        if (admitted && notTerminated) {
          const loc = c.LOTAÇÃO || '—'
          map.set(loc, (map.get(loc) || 0) + 1)
        }
      })
      const obj: Record<string, any> = { mes: ym }
      for (const [k, v] of map) obj[k] = v
      return obj
    })
    const totals = new Map<string, number>()
    rows.forEach(r => {
      Object.keys(r).forEach(k => {
        if (k === 'mes') return
        totals.set(k, (totals.get(k) || 0) + (r[k] || 0))
      })
    })
    const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
    const topKeys = sorted.slice(0, 5).map(([k]) => k)
    const keys = [...topKeys, 'OUTRAS']
    const data = rows.map(r => {
      const o: Record<string, any> = { mes: r.mes }
      let outras = 0
      Object.keys(r).forEach(k => {
        if (k === 'mes') return
        if (topKeys.includes(k)) o[k] = r[k]
        else outras += r[k] || 0
      })
      o['OUTRAS'] = outras
      keys.forEach(k => { if (k !== 'mes' && o[k] == null) o[k] = 0 })
      return o
    })
    return { data, keys }
  }, [monthsGlobal, colaboradores])

  const stackedByRole = useMemo(() => {
    if (!monthsGlobal.length) return { data: [], keys: [] as string[] }
    const rows = monthsGlobal.map(ym => {
      const endOfMonth = dayjs(ym + '-01').endOf('month')
      const map = new Map<string, number>()
      ;(colaboradores as any[]).forEach(c => {
        const admitted = !!c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isSameOrBefore(endOfMonth, 'day')
        const notTerminated = !c.DATA_DEMISSAO || dayjs(c.DATA_DEMISSAO).isAfter(endOfMonth, 'day')
        if (admitted && notTerminated) {
          const cargo = c.CARGO || '—'
          map.set(cargo, (map.get(cargo) || 0) + 1)
        }
      })
      const obj: Record<string, any> = { mes: ym }
      for (const [k, v] of map) obj[k] = v
      return obj
    })
    const totals = new Map<string, number>()
    rows.forEach(r => {
      Object.keys(r).forEach(k => {
        if (k === 'mes') return
        totals.set(k, (totals.get(k) || 0) + (r[k] || 0))
      })
    })
    const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
    const topKeys = sorted.slice(0, 5).map(([k]) => k)
    const keys = [...topKeys, 'OUTROS']
    const data = rows.map(r => {
      const o: Record<string, any> = { mes: r.mes }
      let outros = 0
      Object.keys(r).forEach(k => {
        if (k === 'mes') return
        if (topKeys.includes(k)) o[k] = r[k]
        else outros += r[k] || 0
      })
      o['OUTROS'] = outros
      keys.forEach(k => { if (k !== 'mes' && o[k] == null) o[k] = 0 })
      return o
    })
    return { data, keys }
  }, [monthsGlobal, colaboradores])

  const filtrados = useMemo(() => {
    const applyDate = hasValidPeriodo
      ? { ini: dayjs(periodo![0]).startOf('day'), fim: dayjs(periodo![1]).endOf('day') }
      : null
    return (colaboradores as any[]).filter((c) => {
      if (cargoFilter && c.CARGO !== cargoFilter) return false
      if (lotacaoFilter && c.LOTAÇÃO !== lotacaoFilter) return false
      if (applyDate) {
        const admittedInRange =
          c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isBetween(applyDate.ini, applyDate.fim, 'day', '[]')
        const terminatedInRange =
          c.DATA_DEMISSAO && dayjs(c.DATA_DEMISSAO).isBetween(applyDate.ini, applyDate.fim, 'day', '[]')
        if (!admittedInRange && !terminatedInRange) return false
      }
      return true
    })
  }, [colaboradores, cargoFilter, lotacaoFilter, periodo, hasValidPeriodo])

  const ativosPorLotacao = useMemo(() => {
    const m = new Map<string, number>()
    ;(colaboradores as any[]).forEach((c) => {
      if (c.ATIVO) {
        const k = c.LOTAÇÃO || '—'
        m.set(k, (m.get(k) || 0) + 1)
      }
    })
    return Array.from(m.entries())
      .map(([lot, qtd]) => ({ lot, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
  }, [colaboradores])

  // ===== Efetivos (coorte): total e por lotação =====
  const efetivosCohort = useMemo(() => {
    const hasPeriod = hasValidPeriodo
    const ini = hasPeriod ? dayjs(periodo![0]).startOf('day') : null
    const fim = hasPeriod ? dayjs(periodo![1]).endOf('day') : dayjs().endOf('day')
    const cutoffLabel = hasPeriod
      ? `${ini!.format('DD/MM/YYYY')} — ${fim.format('DD/MM/YYYY')}`
      : `Hoje (${fim.format('DD/MM/YYYY')})`

    const isEfetivo = (c: any) => {
      const cargo = (c?.CARGO || '').toString().toLowerCase()
      return /efetiv/.test(cargo)
    }

    let admitted = 0, stayed = 0, left = 0
    ;(colaboradores as any[]).forEach((c) => {
      if (!isEfetivo(c)) return
      const adm = c.DATA_ADMISSAO ? dayjs(c.DATA_ADMISSAO) : null
      const dem = c.DATA_DEMISSAO ? dayjs(c.DATA_DEMISSAO) : null

      const inCohort = hasPeriod
        ? (adm != null && adm.isBetween(ini!, fim, 'day', '[]'))
        : (adm != null)

      if (!inCohort) return
      admitted++

      const permaneceu = (dem == null) || dem.isAfter(fim, 'day')
      if (permaneceu) stayed++
      else left++
    })

    return { admitted, stayed, left, cutoffLabel }
  }, [colaboradores, periodo, hasValidPeriodo])

  const efetivosCohortByLotacao = useMemo(() => {
    const hasPeriod = hasValidPeriodo
    const ini = hasPeriod ? dayjs(periodo![0]).startOf('day') : null
    const fim = hasPeriod ? dayjs(periodo![1]).endOf('day') : dayjs().endOf('day')

    const isEfetivo = (c: any) => {
      const cargo = (c?.CARGO || '').toString().toLowerCase()
      return /efetiv/.test(cargo)
    }

    const acc = new Map<string, { contratados: number, permaneceram: number, demitidos: number }>()
    ;(colaboradores as any[]).forEach((c) => {
      if (!isEfetivo(c)) return

      const adm = c.DATA_ADMISSAO ? dayjs(c.DATA_ADMISSAO) : null
      const dem = c.DATA_DEMISSAO ? dayjs(c.DATA_DEMISSAO) : null
      const lot = c.LOTAÇÃO || '—'

      const inCohort = hasPeriod
        ? (adm != null && adm.isBetween(ini!, fim, 'day', '[]'))
        : (adm != null)
      if (!inCohort) return

      const item = acc.get(lot) || { contratados: 0, permaneceram: 0, demitidos: 0 }
      item.contratados += 1
      const permaneceu = (dem == null) || dem.isAfter(fim, 'day')
      if (permaneceu) item.permaneceram += 1
      else item.demitidos += 1
      acc.set(lot, item)
    })

    return Array.from(acc.entries())
      .map(([lotacao, v]) => ({ lotacao, ...v }))
      .sort((a, b) => b.contratados - a.contratados)
  }, [colaboradores, periodo, hasValidPeriodo])

  // ===== AntD tokens conforme tema =====
  const algorithm = dark ? AntTheme.darkAlgorithm : AntTheme.defaultAlgorithm
  const tokens = {
    colorTextBase: dark ? '#e5e7eb' : '#0f172a',
    colorTextSecondary: dark ? '#a3b0c3' : '#475569',
    colorBorder: dark ? '#1e293b' : '#e6e8ee',
    colorBgContainer: dark ? '#121a2a' : '#ffffff',
    borderRadiusLG: 14,
  }

  const showGlobalSkeleton = csvLoading
  const showOverlay = csvLoading || isPending

  return (
    <ConfigProvider theme={{ algorithm, token: tokens }}>
      <OverlaySpinner active={showOverlay} tip={csvLoading ? 'Carregando dados...' : 'Atualizando...'} />

      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: isMobile ? 12 : 24 }}>
          <div className="header-wrap">
            <div>
              <Title level={isMobile ? 4 : 3} className="header-title">DashBoard - RH</Title>
              <Text className="header-subtitle">Visão executiva do quadro de pessoal • filtros e tendências</Text>
            </div>
          </div>
        </Header>

        <Content style={{ padding: isMobile ? 16 : 24 }}>
          {showGlobalSkeleton ? (
            <DashboardSkeleton />
          ) : (
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Filters
                classNameContainer="filters-stack"
                cargos={cargos}
                lotacoes={lotacoes}
                cargo={cargoFilter}
                setCargo={setCargoFilter}
                lotacao={lotacaoFilter}
                setLotacao={setLotacaoFilter}
                periodo={periodo}
                setPeriodo={setPeriodo}
              />

              <PeriodBalance
                saldoMensal={saldoMensal}
                periodoValido={hasValidPeriodo}
                metrics={periodMetrics}
                setPeriodo={setPeriodo}
              />

              <Turnover
                monthlyHeadcount={monthlyHeadcount}
                periodoValido={hasValidPeriodo}
                periodoRange={
                  hasValidPeriodo
                    ? { ini: dayjs(periodo![0]).startOf('day'), fim: dayjs(periodo![1]).endOf('day') }
                    : null
                }
                desligamentos={periodMetrics.desligamentos}
              />

              <KpiCards total={kpis.total} ativos={kpis.ativos} desligados={kpis.desligados} />

              {/* 👇 NOVO: Variação de Benefícios e Salários */}
              <VariaRemuneracao />

              {/* 👇 Efetivos (coorte) */}
              <EfetivosCohortTable
                rows={efetivosCohortByLotacao}
                total={efetivosCohort}
              />

              <ChartsRow
                height={chartH}
                serieMensal={serieMensal}
                porCargo={porCargo}
                onCargoSelect={(cargo) =>
                  setCargoFilter((prev) => (prev === cargo ? undefined : cargo))
                }
              />

              <LotacaoBar
                height={smallChartH}
                porLotacao={porLotacao}
                onLotacaoSelect={(lot) =>
                  setLotacaoFilter((prev) => (prev === lot ? undefined : lot))
                }
              />

              <ActiveByLocationBar
                height={smallChartH}
                data={ativosPorLotacao}
                onSelect={(lot) =>
                  setLotacaoFilter((prev) => (prev === lot ? undefined : lot))
                }
              />

              <HeadcountStacked
                dataByLocation={stackedByLocation.data}
                keysByLocation={stackedByLocation.keys}
                dataByCargo={stackedByRole.data}
                keysByCargo={stackedByRole.keys}
              />

              <DataTable isMobile={isMobile} data={filtrados} cargos={cargos} lotacoes={lotacoes} />
            </Space>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  )
}
