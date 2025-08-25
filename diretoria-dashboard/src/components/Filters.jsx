import { Card, DatePicker, Flex, Select, message } from 'antd'
const { RangePicker } = DatePicker

export default function Filters({
  cargos, lotacoes,
  cargo, setCargo,
  lotacao, setLotacao,
  periodo, setPeriodo
}) {

  const onPeriodoChange = (range) => {
    // range pode ser: null | [] | [dayjs|null, dayjs|null]
    const hasBoth =
      Array.isArray(range) &&
      range[0] != null &&
      range[1] != null

    if (!range || !Array.isArray(range)) {
      // limpou tudo → remove filtro
      setPeriodo(undefined)
      return
    }

    if (!hasBoth) {
      // inválido → limpa e avisa
      setPeriodo(undefined)
      message.warning('Período inválido. Selecione data inicial e final.')
      return
    }

    // período OK
    setPeriodo(range)
  }

  return (
    <Card>
      <Flex gap={16} wrap>
        <Select
          allowClear
          placeholder="Filtrar por Cargo"
          style={{ minWidth: 220 }}
          options={cargos.map((c) => ({ label: c, value: c }))}
          value={cargo}
          onChange={setCargo}
        />
        <Select
          allowClear
          placeholder="Filtrar por Lotação"
          style={{ minWidth: 220 }}
          options={lotacoes.map((l) => ({ label: l, value: l }))}
          value={lotacao}
          onChange={setLotacao}
        />
        <RangePicker
          allowEmpty={[true, true]}
          onChange={onPeriodoChange}
          value={periodo}
          placeholder={['Início', 'Fim']}
          style={{ minWidth: 280 }}
        />
      </Flex>
    </Card>
  )
}
