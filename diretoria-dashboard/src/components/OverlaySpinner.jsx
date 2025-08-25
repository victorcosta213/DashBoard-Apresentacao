import { Spin } from 'antd'

export default function OverlaySpinner({ active = false, tip = 'Carregando...' }) {
  if (!active) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)'
    }}>
      <Spin size="large" tip={tip} />
    </div>
  )
}
