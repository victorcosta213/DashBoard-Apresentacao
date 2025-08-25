import { Card, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { PALETTE } from '../theme'

export default function DataTable({ data, cargos, lotacoes }) {
  const columns = [
    { title: 'Nome', dataIndex: 'NOME', key: 'nome', ellipsis: true },
    {
      title: 'Lotação',
      dataIndex: 'LOTAÇÃO',
      key: 'lotacao',
      filters: lotacoes.map((l) => ({ text: l, value: l })),
      onFilter: (v, r) => (r.LOTAÇÃO || r.LOTACAO) === v
    },
    {
      title: 'Cargo',
      dataIndex: 'CARGO',
      key: 'cargo',
      filters: cargos.map((c) => ({ text: c, value: c })),
      onFilter: (v, r) => r.CARGO === v,
      render: (t) => (
        <Tag style={{ background: PALETTE.tag.cargoBg, color: PALETTE.tag.cargoText, border: 'none' }}>
          {t}
        </Tag>
      )
    },
    {
      title: 'Admissão',
      dataIndex: 'DATA_ADMISSAO',
      key: 'admissao',
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—')
    },
    {
      title: 'Demissão',
      dataIndex: 'DATA_DEMISSAO',
      key: 'demissao',
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—')
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) =>
        r.ATIVO ? (
          <Tag style={{ background: PALETTE.tag.ativoBg, color: PALETTE.tag.ativoText, border: 'none' }}>
            ATIVO
          </Tag>
        ) : (
          <Tag style={{ background: PALETTE.tag.desligadoBg, color: PALETTE.tag.desligadoText, border: 'none' }}>
            DESLIGADO
          </Tag>
        )
    },
  ]

  return (
    <Card title="Colaboradores" styles={{ header: { color: PALETTE.cardTitle } }}>
      <Table
        rowKey={(r) => `${r.NOME}-${r.DATA_ADMISSAO || 'na'}`}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Card>
  )
}
