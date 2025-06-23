# Estrutura do Firestore

## users/{uid}/frotas/{frotaId}
- id: string
- nome: string
- estiloCobranca: 'segunda-a-sabado' | 'todos-os-dias' | 'dias-uteis' | 'personalizado'
- ...

## users/{uid}/veiculosLocados/{veiculoId}
- id: string
- placa: string
- frotaId: string
- ...

## users/{uid}/diarias/{diariaId}
- id: string
- data: string (YYYY-MM-DD)
- veiculoLocadoId: string
- valor: number
- status: 'pendente' | 'pago'
- ...

## users/{uid}/pagamentosFrota/{pagamentoId}
- id: string
- valor: number
- data: string (YYYY-MM-DD)
- ...

---

## Exemplo de documento: Frota
```json
{
  "id": "frota-123",
  "nome": "Frota Principal",
  "estiloCobranca": "todos-os-dias"
}
```

## Exemplo de documento: Veículo Locado
```json
{
  "id": "veiculo-456",
  "placa": "ABC-1234",
  "frotaId": "frota-123"
}
```

## Exemplo de documento: Diária
```json
{
  "id": "veiculo-456-2024-06-01",
  "data": "2024-06-01",
  "veiculoLocadoId": "veiculo-456",
  "valor": 100,
  "status": "pendente"
}
```

## Exemplo de documento: Pagamento de Frota
```json
{
  "id": "pagamento-789",
  "valor": 1000,
  "data": "2024-06-01"
}
``` 