import { Card, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { PALETTE } from '../theme'

export default function DataTable({ data, cargos, lotacoes, isMobile }) {
  const columns = [
    { title: 'Nome', dataIndex: 'NOME', key: 'nome', ellipsis: true, width: 220, fixed: isMobile ? undefined : 'left' },
    {
      title: 'Lotação',
      dataIndex: 'LOTAÇÃO',
      key: 'lotacao',
      filters: lotacoes.map((l) => ({ text: l, value: l })),
      onFilter: (v, r) => (r.LOTAÇÃO || r.LOTACAO) === v,
      width: 160,
      responsive: ['sm']
    },
    {
      title: 'Cargo',
      dataIndex: 'CARGO',
      key: 'cargo',
      filters: cargos.map((c) => ({ text: c, value: c })),
      onFilter: (v, r) => r.CARGO === v,
      width: 200,
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
      width: 130,
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—')
    },
    {
      title: 'Demissão',
      dataIndex: 'DATA_DEMISSAO',
      key: 'demissao',
      width: 130,
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—')
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
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
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 900 }}
        pagination={{
          pageSize: isMobile ? 8 : 10,
          showSizeChanger: !isMobile,
          simple: isMobile
        }}
      />
    </Card>
  )
}
