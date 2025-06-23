import { gerarDiarias, isFeriado } from '../../logic/frotaLogic';

describe('isFeriado', () => {
  it('deve retornar true se a data for feriado', () => {
    const feriados = ['2024-06-10'];
    expect(isFeriado(new Date('2024-06-10'), feriados)).toBe(true);
  });
  it('deve retornar false se a data não for feriado', () => {
    const feriados = ['2024-06-10'];
    expect(isFeriado(new Date('2024-06-11'), feriados)).toBe(false);
  });
});

describe('gerarDiarias', () => {
  it('deve gerar diárias apenas para dias úteis', () => {
    const diarias = gerarDiarias({
      inicioContrato: '2024-06-10',
      valorDiaria: 100,
      veiculoLocadoId: 'v1',
      dias: 7,
      estiloCobranca: 'dias-uteis',
      aceitaDomingo: false,
      aceitaFeriado: false,
      feriados: ['2024-06-12'],
    });
    // 10/06 a 16/06: 10,11,13,14 (12 é feriado, 15 sab, 16 dom)
    expect(diarias.length).toBe(4);
    expect(diarias[0].data).toBe('2024-06-10');
    expect(diarias[1].data).toBe('2024-06-11');
    expect(diarias[2].data).toBe('2024-06-13');
    expect(diarias[3].data).toBe('2024-06-14');
  });
}); 