import { Card, Row, Col, Statistic, Timeline, Typography, Table, Tag } from 'antd'
import { ArrowUpOutlined } from '@ant-design/icons'
import { ticketAlimentacao, salarios } from '../data/remuneracao'

const { Title, Text } = Typography

export default function VariaRemuneracao() {
  const timelineItems = ticketAlimentacao.map((t, i) => ({
    color: 'green',
    children: (
      <div>
        <Text strong>{t.data}</Text>
        <div>
          Ticket: <b>R$ {t.de.toFixed(2)}</b> → <b>R$ {t.para.toFixed(2)}</b>
          <Tag color="blue" style={{ marginLeft: 8 }}>
            {(((t.para - t.de) / t.de) * 100).toFixed(1)}%
          </Tag>
        </div>
      </div>
    ),
  }))

  const salarioRows = salarios.map((s, i) => ({
    key: i,
    categoria: s.categoria,
    de: s.de ?? '—',
    para: s.para ?? '—',
    variacao: s.variacao ?? (((s.para - s.de) / s.de) * 100).toFixed(1) + '%',
  }))

  const salarioCols = [
    { title: 'Categoria', dataIndex: 'categoria', key: 'categoria' },
    { title: 'De', dataIndex: 'de', key: 'de', render: (v) => (v === '—' ? '—' : `R$ ${v}`) },
    { title: 'Para', dataIndex: 'para', key: 'para', render: (v) => (v === '—' ? '—' : `R$ ${v}`) },
    {
      title: 'Variação',
      dataIndex: 'variacao',
      key: 'variacao',
      render: (v) => <Tag color="volcano" icon={<ArrowUpOutlined />}>{v}</Tag>,
    },
  ]

  return (
    <Card title="Variação de Benefícios e Salários">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Title level={5}>Ticket Alimentação</Title>
          <Timeline items={timelineItems} />
        </Col>
        <Col xs={24} md={12}>
          <Title level={5}>Salários</Title>
          <Table
            size="small"
            columns={salarioCols}
            dataSource={salarioRows}
            pagination={false}
          />
        </Col>
      </Row>
    </Card>
  )
}
