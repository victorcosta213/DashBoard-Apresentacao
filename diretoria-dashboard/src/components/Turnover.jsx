import { Card, Col, Row, Statistic, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'
import { PALETTE } from '../theme'

/**
 * Props:
 * - monthlyHeadcount: [{ mes: 'YYYY-MM', headcount: number }] // série completa
 * - periodoValido: boolean
 * - periodoRange: { ini: dayjs, fim: dayjs } | null
 * - desligamentos: number  // no período
 */
export default function Turnover({ monthlyHeadcount, periodoValido, periodoRange, desligamentos }) {
  // Filtra a série de headcount para o intervalo selecionado (por mês)
  const seriePeriodo = periodoValido
    ? monthlyHeadcount.filter(({ mes }) => {
        const mEnd = dayjs(mes + '-01').endOf('month')
        return mEnd.isBetween(periodoRange.ini, periodoRange.fim, 'day', '[]')
      })
    : []

  // Headcount médio
  const avgHeadcount = seriePeriodo.length
    ? Math.round((seriePeriodo.reduce((s, x) => s + (x.headcount || 0), 0) / seriePeriodo.length) * 10) / 10
    : 0

  // Turnover %
  const turnover = avgHeadcount > 0 ? Math.round((desligamentos / avgHeadcount) * 1000) / 10 : 0

  return (
    <Card
      title={
        <span>
          Taxa de Rotatividade do Período{' '}
          <Tooltip
            title="Turnover = Desligamentos no período ÷ Headcount médio do período × 100"
            placement="right"
          >
            <InfoCircleOutlined style={{ color: PALETTE.textMuted }} />
          </Tooltip>
        </span>
      }
      styles={{ header: { color: PALETTE.cardTitle } }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic
            title="Desligamentos (período)"
            value={periodoValido ? desligamentos : 0}
            valueStyle={{ color: '#dc2626' }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="Headcount médio"
            value={periodoValido ? avgHeadcount : 0}
            valueStyle={{ color: PALETTE.text }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Statistic
            title="Turnover (%)"
            value={periodoValido ? turnover : 0}
            precision={1}
            valueStyle={{ color: turnover <= 5 ? '#16a34a' : turnover <= 10 ? '#f59e0b' : '#dc2626' }}
          />
        </Col>
      </Row>

      {/* Sparkline do headcount no período (opcional, só aparece se houver série) */}
      {periodoValido && seriePeriodo.length > 0 && (
        <div style={{ width: '100%', height: 220, marginTop: 16 }}>
          <ResponsiveContainer>
            <LineChart data={seriePeriodo} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
              <XAxis dataKey="mes" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
              <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
              <RTooltip />
              <Line type="monotone" dataKey="headcount" name="Headcount" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
