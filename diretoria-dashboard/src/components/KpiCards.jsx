import { Card, Col, Row, Statistic } from 'antd'
import { PALETTE } from '../theme'

export default function KpiCards({ total, ativos, desligados }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card styles={{ header: { color: PALETTE.cardTitle } }}>
          <Statistic
            title="Total de Registros"
            value={total}
            titleStyle={{ color: PALETTE.kpiTitle }}
            valueStyle={{ color: PALETTE.kpiValue }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ header: { color: PALETTE.cardTitle } }}>
          <Statistic
            title="Ativos"
            value={ativos}
            titleStyle={{ color: PALETTE.kpiTitle }}
            valueStyle={{ color: '#16a34a' }}
          />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card styles={{ header: { color: PALETTE.cardTitle } }}>
          <Statistic
            title="Desligados"
            value={desligados}
            titleStyle={{ color: PALETTE.kpiTitle }}
            valueStyle={{ color: '#dc2626' }}
          />
        </Card>
      </Col>
    </Row>
  )
}
