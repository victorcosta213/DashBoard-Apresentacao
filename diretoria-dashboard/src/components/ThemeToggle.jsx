import { Tooltip } from 'antd'
import { MoonFilled, SunFilled } from '@ant-design/icons'

export default function ThemeToggle({ dark, onChange }) {
  return (
    <Tooltip title={dark ? 'Tema escuro' : 'Tema claro'}>
      <div
        onClick={() => onChange(!dark)}
        style={{
          cursor: 'pointer',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          color: dark ? '#facc15' : '#0f172a',
          transition: 'all 0.2s ease',
        }}
      >
        {dark ? <MoonFilled /> : <SunFilled />}
      </div>
    </Tooltip>
  )
}
