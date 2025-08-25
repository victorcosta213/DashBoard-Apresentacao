import React, { useEffect, useMemo, useState } from 'react'
import { Layout, Typography, Space, ConfigProvider } from 'antd'
import Papa from 'papaparse'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'

import './styles.css'
import { processData } from './utils/transform'
import { PALETTE } from './theme'

import KpiCards from './components/KpiCards'
import Filters from './components/Filters'
import { ChartsRow, LotacaoBar, ActiveByLocationBar } from './components/Charts'
import DataTable from './components/DataTable'

const { Header, Content } = Layout
const { Title, Text } = Typography

export default function App() {
  const [rows, setRows] = useState([])
  const [cargoFilter, setCargoFilter] = useState()
  const [lotacaoFilter, setLotacaoFilter] = useState()
  const [periodo, setPeriodo] = useState() // [dayjs, dayjs] | undefined

  // Carregar CSV
  useEffect(() => {
    Papa.parse('/data/dados_diretoria_limpos.csv', {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data),
    })
  }, [])

  // Transformar base
  const { colaboradores, serieMensal, porCargo, porLotacao, kpis } = useMemo(
    () => processData(rows), [rows]
  )

  // Listas para filtros
  const cargos = useMemo(
    () => [...new Set(colaboradores.map(c => c.CARGO).filter(Boolean))],
    [colaboradores]
  )
  const lotacoes = useMemo(
    () => [...new Set(colaboradores.map(c => c.LOTAÇÃO).filter(Boolean))],
    [colaboradores]
  )

  // Período válido?
  const hasValidPeriodo = useMemo(() => (
    Array.isArray(periodo) &&
    periodo[0] != null &&
    periodo[1] != null &&
    dayjs(periodo[0]).isValid() &&
    dayjs(periodo[1]).isValid()
  ), [periodo])

  // 🔎 FILTRO PRINCIPAL DA TABELA
  // Regra: exibir colaborador se ELE foi ADMITIDO OU DEMITIDO dentro de [ini, fim] (inclusive).
  const filtrados = useMemo(() => {
    const applyDate = hasValidPeriodo
      ? {
          ini: dayjs(periodo[0]).startOf('day'),
          fim: dayjs(periodo[1]).endOf('day'),
        }
      : null

    return colaboradores.filter((c) => {
      // filtros de cargo/lotação
      if (cargoFilter && c.CARGO !== cargoFilter) return false
      if (lotacaoFilter && c.LOTAÇÃO !== lotacaoFilter) return false

      // filtro de data (somente se período for válido)
      if (applyDate) {
        const admittedInRange =
          c.DATA_ADMISSAO && dayjs(c.DATA_ADMISSAO).isBetween(applyDate.ini, applyDate.fim, 'day', '[]')
        const terminatedInRange =
          c.DATA_DEMISSAO && dayjs(c.DATA_DEMISSAO).isBetween(applyDate.ini, applyDate.fim, 'day', '[]')

        // ✅ mostra se foi admitido OU demitido dentro do intervalo
        if (!admittedInRange && !terminatedInRange) return false
      }

      return true
    })
  }, [colaboradores, cargoFilter, lotacaoFilter, periodo, hasValidPeriodo])

  // Ativos por lotação (gráfico verde)
  const ativosPorLotacao = useMemo(() => {
    const m = new Map()
    colaboradores.forEach((c) => {
      if (c.ATIVO) {
        const k = c.LOTAÇÃO || '—'
        m.set(k, (m.get(k) || 0) + 1)
      }
    })
    return Array.from(m.entries())
      .map(([lot, qtd]) => ({ lot, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
  }, [colaboradores])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorTextBase: PALETTE.text,
          colorTextSecondary: PALETTE.text,
          colorBorder: PALETTE.border,
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 24 }}>
          <Title level={3} style={{ margin: 0, color: PALETTE.text }}>Painel da Diretoria</Title>
          <Text style={{ color: PALETTE.textMuted }}>
            Visão executiva do quadro de pessoal • filtros e tendências
          </Text>
        </Header>

        <Content style={{ padding: 24 }}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Filters
              cargos={cargos}
              lotacoes={lotacoes}
              cargo={cargoFilter}
              setCargo={setCargoFilter}
              lotacao={lotacaoFilter}
              setLotacao={setLotacaoFilter}
              periodo={periodo}
              setPeriodo={setPeriodo}
            />

            <KpiCards total={kpis.total} ativos={kpis.ativos} desligados={kpis.desligados} />

            <ChartsRow
              serieMensal={serieMensal}
              porCargo={porCargo}
              onCargoSelect={(cargo) =>
                setCargoFilter((prev) => (prev === cargo ? undefined : cargo))
              }
            />

            <LotacaoBar
              porLotacao={porLotacao}
              onLotacaoSelect={(lot) =>
                setLotacaoFilter((prev) => (prev === lot ? undefined : lot))
              }
            />

            <ActiveByLocationBar
              data={ativosPorLotacao}
              onSelect={(lot) =>
                setLotacaoFilter((prev) => (prev === lot ? undefined : lot))
              }
            />

            <DataTable data={filtrados} cargos={cargos} lotacoes={lotacoes} />
          </Space>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}
