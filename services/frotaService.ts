import { Diaria, Frota, PagamentoFrota, VeiculoLocado } from '../types/frota';
import { frotaSqliteService } from './sqlite/frota/frotaSqliteService';

// Função utilitária para verificar se uma data é feriado (mock, pode ser expandida)
function isFeriado(date: Date, feriados: string[] = []): boolean {
  const iso = date.toISOString().slice(0, 10);
  return feriados.includes(iso);
}

// Função para gerar diárias automáticas
export function gerarDiarias({
  inicioContrato,
  valorDiaria,
  veiculoLocadoId,
  dias,
  estiloCobranca,
  aceitaDomingo,
  aceitaFeriado,
  feriados = [],
}: {
  inicioContrato: string; // YYYY-MM-DD
  valorDiaria: number;
  veiculoLocadoId: string;
  dias: number; // Quantos dias gerar
  estiloCobranca: Frota['estiloCobranca'];
  aceitaDomingo: boolean;
  aceitaFeriado: boolean;
  feriados?: string[]; // Lista de feriados YYYY-MM-DD
}): Diaria[] {
  const result: Diaria[] = [];
  let data = new Date(inicioContrato);
  for (let i = 0; i < dias; i++) {
    const diaSemana = data.getDay(); // 0=Dom, 6=Sab
    const isDomingo = diaSemana === 0;
    const isSabado = diaSemana === 6;
    const feriado = isFeriado(data, feriados);
    let gerar = false;
    switch (estiloCobranca) {
      case 'segunda-a-sabado':
        gerar = !isDomingo;
        break;
      case 'todos-os-dias':
        gerar = true;
        break;
      case 'dias-uteis':
        gerar = diaSemana >= 1 && diaSemana <= 5;
        break;
      case 'personalizado':
        gerar = true; // Customização futura
        break;
    }
    if (!aceitaDomingo && isDomingo) gerar = false;
    if (!aceitaFeriado && feriado) gerar = false;
    if (gerar) {
      result.push({
        id: `${veiculoLocadoId}-${data.toISOString().slice(0, 10)}`,
        data: data.toISOString().slice(0, 10),
        veiculoLocadoId,
        valor: valorDiaria,
        status: 'pendente',
      });
    }
    data.setDate(data.getDate() + 1);
  }
  return result;
}

export const frotaService = {
  // FROTAS
  async listarFrotas(): Promise<Frota[]> {
    return frotaSqliteService.getAllFrotas();
  },
  async salvarFrota(frota: Frota): Promise<void> {
    await frotaSqliteService.saveFrota(frota);
  },
  async removerFrota(id: string): Promise<void> {
    await frotaSqliteService.deleteFrota(id);
  },

  // VEÍCULOS LOCADOS
  async listarVeiculosLocados(): Promise<VeiculoLocado[]> {
    return frotaSqliteService.getAllVeiculosLocados();
  },
  async salvarVeiculoLocado(veiculo: VeiculoLocado): Promise<void> {
    await frotaSqliteService.saveVeiculoLocado(veiculo);
  },
  async removerVeiculoLocado(id: string): Promise<void> {
    await frotaSqliteService.deleteVeiculoLocado(id);
  },

  // DIÁRIAS
  async listarDiarias(): Promise<Diaria[]> {
    return frotaSqliteService.getAllDiarias();
  },
  async salvarDiaria(diaria: Diaria): Promise<void> {
    await frotaSqliteService.saveDiaria(diaria);
  },
  async removerDiaria(id: string): Promise<void> {
    await frotaSqliteService.deleteDiaria(id);
  },

  // PAGAMENTOS
  async listarPagamentos(): Promise<PagamentoFrota[]> {
    return frotaSqliteService.getAllPagamentos();
  },
  async salvarPagamento(pagamento: PagamentoFrota): Promise<void> {
    await frotaSqliteService.savePagamento(pagamento);
  },
  async removerPagamento(id: string): Promise<void> {
    await frotaSqliteService.deletePagamento(id);
  },
}; 