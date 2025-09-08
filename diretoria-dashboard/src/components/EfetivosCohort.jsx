import { Card, Row, Col, Statistic, Typography } from 'antd'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { PALETTE } from '../theme'

const { Text } = Typography


export default function EfetivosCohort({ cohort, height = 280 }) {
  const admitted = cohort?.admitted ?? 0
  const stayed   = cohort?.stayed ?? 0
  const left     = cohort?.left ?? 0
  const cutoff   = cohort?.cutoffLabel ?? ''

  
  const data = [
    {
      name: 'Efetivos - Coorte',
      Permaneceram: stayed,
      Demitidos: left,
      total: admitted,
    },
  ]

  // Evita divisão por zero no eixo Y (se admitted=0)
  const maxY = Math.max(stayed + left, 1)

  return (
    <Card
      title="Efetivos — Contratados, Permaneceram e Demitidos (Coorte)"
      extra={<Text type="secondary">Corte em: {cutoff}</Text>}
      styles={{ header: { color: PALETTE.cardTitle } }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic title="Contratados (coorte)" value={admitted} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Permaneceram" value={stayed} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Demitidos" value={left} />
        </Col>

        <Col span={24}>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
                <YAxis
                  allowDecimals={false}
                  stroke={PALETTE.chart.axis}
                  tick={{ fill: PALETTE.chart.axis }}
                  domain={[0, maxY]}
                />
                <Tooltip />
                <Legend wrapperStyle={{ color: PALETTE.chart.axis }} />
                {/* Empilhado: Permaneceram + Demitidos = total da coorte */}
                <Bar
                  dataKey="Permaneceram"
                  stackId="coorte"
                  name="Permaneceram"
                  fill={PALETTE.chart.bars.adm}
                  radius={[6, 0, 0, 6]}
                />
                <Bar
                  dataKey="Demitidos"
                  stackId="coorte"
                  name="Demitidos"
                  fill={PALETTE.chart.bars.dem}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
    </Card>
  )
}
