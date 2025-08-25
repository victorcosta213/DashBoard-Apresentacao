import { Card, Segmented } from 'antd'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { useState, useMemo } from 'react'
import { PALETTE } from '../theme'

export default function HeadcountStacked({
  dataByLocation,
  keysByLocation,
  dataByCargo,
  keysByCargo
}) {
  const [mode, setMode] = useState('Lotação')
  const colors = PALETTE.series || ['#0ea5e9', '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#94a3b8']

  const { data, keys } = useMemo(() => {
    return mode === 'Lotação'
      ? { data: dataByLocation, keys: keysByLocation }
      : { data: dataByCargo, keys: keysByCargo }
  }, [mode, dataByLocation, keysByLocation, dataByCargo, keysByCargo])

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span>Headcount ao longo do tempo — Empilhado</span>
          <Segmented options={['Lotação', 'Cargo']} value={mode} onChange={setMode} size="small" />
        </div>
      }
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
