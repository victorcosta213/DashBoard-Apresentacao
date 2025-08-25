import { Card, Col, Row, Skeleton, Space } from 'antd'

function CardSkeleton({ height = 280, title = true }) {
  return (
    <Card>
      {title && <Skeleton.Input active style={{ width: 220, marginBottom: 16 }} />}
      <div style={{ height }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </Card>
  )
}

export default function DashboardSkeleton() {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Filtros */}
      <Card>
        <Skeleton.Input active style={{ width: 220, marginRight: 12 }} />
        <Skeleton.Input active style={{ width: 220, marginRight: 12 }} />
        <Skeleton.Input active style={{ width: 280 }} />
      </Card>

      {/* KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Skeleton active paragraph={{ rows: 2 }} /></Card></Col>
        <Col xs={24} md={8}><Card><Skeleton active paragraph={{ rows: 2 }} /></Card></Col>
        <Col xs={24} md={8}><Card><Skeleton active paragraph={{ rows: 2 }} /></Card></Col>
      </Row>

      {/* Cards e gráficos */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}><CardSkeleton height={280} /></Col>
        <Col xs={24} lg={12}><CardSkeleton height={280} /></Col>
      </Row>

      <CardSkeleton height={220} />
      <CardSkeleton height={220} />
      <CardSkeleton height={320} />

      {/* Tabela */}
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </Space>
  )
}
