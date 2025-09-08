import { useMemo } from 'react'
import { Card, Table, Typography, Tag, Space, Button, Progress, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

const { Text } = Typography

function pct(n, d) {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

/**
 * Props:
 * - rows: Array<{ lotacao: string, contratados: number, permaneceram: number, demitidos: number }>
 * - total: { admitted: number, stayed: number, left: number, cutoffLabel: string }
 */
export default function EfetivosCohortTable({ rows = [], total }) {
  const cutoffLabel = total?.cutoffLabel ?? ''
  const totalRow = {
    contratados: total?.admitted ?? 0,
    permaneceram: total?.stayed ?? 0,
    demitidos: total?.left ?? 0,
  }

  const data = useMemo(
    () =>
      rows.map((r, i) => ({
        key: `${r.lotacao}-${i}`,
        lotacao: r.lotacao,
        contratados: r.contratados,
        permaneceram: r.permaneceram,
        demitidos: r.demitidos,
        retencao: pct(r.permaneceram, r.contratados),
        saida: pct(r.demitidos, r.contratados),
      })),
    [rows]
  )

  const columns = [
    {
      title: 'Lotação',
      dataIndex: 'lotacao',
      key: 'lotacao',
      width: 220,
      render: (t) => <Tag color="blue">{t}</Tag>,
      sorter: (a, b) => a.lotacao.localeCompare(b.lotacao),
      fixed: 'left',
    },
    {
      title: 'Contratados (coorte)',
      dataIndex: 'contratados',
      key: 'contratados',
      align: 'right',
      width: 150,
      sorter: (a, b) => a.contratados - b.contratados,
    },
    {
      title: 'Permaneceram',
      dataIndex: 'permaneceram',
      key: 'permaneceram',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.permaneceram - b.permaneceram,
    },
    {
      title: 'Demitidos',
      dataIndex: 'demitidos',
      key: 'demitidos',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.demitidos - b.demitidos,
    },
    {
      title: '% Retenção',
      dataIndex: 'retencao',
      key: 'retencao',
      align: 'right',
      width: 170,
      sorter: (a, b) => a.retencao - b.retencao,
      render: (v) => (
        <Space size={8} style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Text strong>{v}%</Text>
          <div style={{ width: 92 }}>
            <Progress percent={v} size="small" showInfo={false} />
          </div>
        </Space>
      ),
    },
    {
      title: '% Saída',
      dataIndex: 'saida',
      key: 'saida',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.saida - b.saida,
      render: (v) => <Text>{v}%</Text>,
    },
  ]

  const csvContent = useMemo(() => {
    const header = ['LOTACAO','CONTRATADOS','PERMANECERAM','DEMITIDOS','RETENCAO_%','SAIDA_%']
    const rowsCsv = (rows || []).map((r) => [
      r.lotacao, r.contratados, r.permaneceram, r.demitidos,
      pct(r.permaneceram, r.contratados),
      pct(r.demitidos, r.contratados),
    ])
    return [header, ...rowsCsv]
      .map(line => line.map(val => {
        const s = String(val ?? '')
        return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
      }).join(';'))
      .join('\n')
  }, [rows])

  const handleExport = () => {
    if (!rows?.length) return message.warning('Sem dados para exportar.')
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `efetivos_coorte_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card
      title="Efetivos — Retenção"
      extra={
        <Space>
          <Text type="secondary">Corte: {cutoffLabel}</Text>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Exportar (.csv)</Button>
        </Space>
      }
    >
      <Table
        size="middle"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        rowClassName={(_, idx) => (idx % 2 ? 'row-zebra' : '')}
        sticky
        scroll={{ x: 900 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><b>Total</b></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><b>{totalRow.contratados}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right"><b>{totalRow.permaneceram}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right"><b>{totalRow.demitidos}</b></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <b>{pct(totalRow.permaneceram, totalRow.contratados)}%</b>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right">
              <b>{pct(totalRow.demitidos, totalRow.contratados)}%</b>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  )
}
