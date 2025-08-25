// Paleta centralizada (mude aqui quando quiser)
export const PALETTE = {
  // textos
  text: '#0f172a',
  textMuted: '#475569',
  cardTitle: '#0f172a',
  border: '#e5e7eb',

  // tabela
  tableHeaderBg: '#f3f4f6',
  tableHeaderText: '#0f172a',
  tableRowHover: '#f8fafc',

  // KPIs / cards
  kpiValue: '#0f172a',
  kpiTitle: '#475569',

  // gráficos (cores base)
  chart: {
    axis: '#374151',
    grid: '#e5e7eb',
    bars: {
      adm: '#2563eb',     // Admissões
      dem: '#ef4444',     // Desligamentos
      lot: '#06b6d4',     // Lotação (geral)
      activeLot: '#16a34a', // Ativos por Lotação (verde)
    },
    pieByCargo: {
      EFETIVO: '#06b6d4',
      COMISSIONADO: '#7c3aed',
      'ESTAGIÁRIO': '#16a34a',
      OUTROS: '#94a3b8',
      fallback: ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#94a3b8'],
    }
  },

  // paleta para séries empilhadas (ordem cíclica)
  series: ['#0ea5e9', '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#94a3b8'],

  // tags
  tag: {
    ativoBg: '#dcfce7',
    ativoText: '#166534',
    desligadoBg: '#fee2e2',
    desligadoText: '#991b1b',
    cargoBg: '#eef2ff',
    cargoText: '#3730a3',
  }
}
