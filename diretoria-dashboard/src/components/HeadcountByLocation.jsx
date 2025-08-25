import { Card } from 'antd'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { PALETTE } from '../theme'

/**
 * Props esperadas (JS):
 * - data: Array<{ mes: 'YYYY-MM', [lotacao: string]: number }>
 * - keys: string[]  // ex.: ['RECIFE', '...','OUTRAS']
 */
export default function HeadcountByLocation({ data, keys }) {
  const colors = PALETTE.series || ['#0ea5e9', '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#94a3b8']

  return (
    <Card
      title="Headcount ao longo do tempo — por Lotação (Top 5 + Outras)"
      styles={{ header: { color: PALETTE.cardTitle } }}
    >
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={PALETTE.chart.grid} strokeDasharray="3 3" />
            <XAxis dataKey="mes" stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <YAxis allowDecimals={false} stroke={PALETTE.chart.axis} tick={{ fill: PALETTE.chart.axis }} />
            <Tooltip />
            <Legend wrapperStyle={{ color: PALETTE.chart.axis }} />
            {keys.map((k, i) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                name={k}
                stackId="1"
                stroke={colors[i % colors.length]}
                fill={colors[i % colors.length]}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
