import { Card, Col, Row } from 'antd'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts'
import { PALETTE } from '../theme'

function colorForCargo(name) {
  const key = (name || '').toUpperCase()
  if (PALETTE.chart.pieByCargo[key]) return PALETTE.chart.pieByCargo[key]
  const pool = PALETTE.chart.pieByCargo.fallback
  const i = Math.abs(key.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % pool.length
  return pool[i]
}

export function ChartsRow({ serieMensal, porCargo, onCargoSelect, height = 320 }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Admissões x Desligamentos (mês)" styles={{ header: { color: PALETTE.cardTitle } }}>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart data={serieMensal} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
                <XAxis dataKey="mes" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
                <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
                <Tooltip />
                <Legend wrapperStyle={{ color: PALETTE.chart.axis }} />
                <Bar dataKey="adm" name="Admissões" fill={PALETTE.chart.bars.adm} radius={[6,6,0,0]} />
                <Bar dataKey="dem" name="Desligamentos" fill={PALETTE.chart.bars.dem} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Distribuição por Cargo" styles={{ header: { color: PALETTE.cardTitle } }}>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip />
                <Legend wrapperStyle={{ color: PALETTE.chart.axis }} />
                <Pie
                  data={porCargo}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={height < 280 ? 90 : 110}
                  label
                  onClick={(slice) => onCargoSelect?.(slice?.name)}
                >
                  {porCargo.map((d, i) => (
                    <Cell key={i} fill={colorForCargo(d.name)} cursor="pointer" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  )
}

export function LotacaoBar({ porLotacao, onLotacaoSelect, height = 280 }) {
  return (
    <Card title="Lotação — Top locais" styles={{ header: { color: PALETTE.cardTitle } }}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={porLotacao} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
            <XAxis dataKey="lot" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <Tooltip />
            <Bar
              dataKey="qtd"
              name="Quantidade"
              fill={PALETTE.chart.bars.lot}
              radius={[6,6,0,0]}
              onClick={(bar) => onLotacaoSelect?.(bar?.payload?.lot)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// Gráfico de Ativos por lotação (verde)
export function ActiveByLocationBar({ data, onSelect, height = 280 }) {
  return (
    <Card title="Ativos por Lotação" styles={{ header: { color: PALETTE.cardTitle } }}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
            <XAxis dataKey="lot" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <Tooltip />
            <Bar
              dataKey="qtd"
              name="Ativos"
              fill={PALETTE.chart.bars.activeLot}
              radius={[6,6,0,0]}
              onClick={(bar) => onSelect?.(bar?.payload?.lot)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
