import { Card, Col, Row, Statistic, Alert } from 'antd'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import dayjs from 'dayjs'
import { PALETTE } from '../theme'

// Converte "YYYY-MM" em [inícioDoMês, fimDoMês]
function monthToRange(yyyyMM) {
  const start = dayjs(yyyyMM + '-01').startOf('month')
  const end = start.endOf('month')
  return [start, end]
}

/**
 * Props:
 * - saldoMensal: [{ mes: 'YYYY-MM', saldo: number }]
 * - periodoValido: boolean
 * - metrics: { admissoes, desligamentos, saldo }  // referentes ao período selecionado
 * - setPeriodo: (range) => void
 */
export default function PeriodBalance({ saldoMensal, periodoValido, metrics, setPeriodo }) {
  const hasData = Array.isArray(saldoMensal) && saldoMensal.length > 0

  return (
    <Card
      title="Saldo do Período (Admissões − Desligamentos)"
      styles={{ header: { color: PALETTE.cardTitle } }}
    >
      {!periodoValido && (
        <Alert
          type="info"
          showIcon
          message="Selecione um intervalo de datas para ver o saldo do período."
          description="Você também pode clicar em um mês no gráfico abaixo para aplicar o filtro automaticamente."
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic
            title="Admissões no período"
            value={periodoValido ? metrics.admissoes : 0}
            valueStyle={{ color: PALETTE.chart.bars.adm }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="Desligamentos no período"
            value={periodoValido ? metrics.desligamentos : 0}
            valueStyle={{ color: PALETTE.chart.bars.dem }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="Saldo (A − D)"
            value={periodoValido ? metrics.saldo : 0}
            valueStyle={{ color: (periodoValido && metrics.saldo >= 0) ? '#16a34a' : '#dc2626' }}
          />
        </Col>
      </Row>

      <div style={{ width: '100%', height: 220, marginTop: 16 }}>
        {hasData && (
          <ResponsiveContainer>
            <BarChart data={saldoMensal} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
              <XAxis dataKey="mes" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
              <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
              <Tooltip />
              <Bar
                dataKey="saldo"
                name="Saldo mensal"
                fill={PALETTE.chart.bars.activeLot}
                radius={[6,6,0,0]}
                onClick={(bar) => {
                  const m = bar?.payload?.mes
                  if (!m) return
                  setPeriodo?.(monthToRange(m))
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
