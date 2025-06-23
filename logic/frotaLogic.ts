// Funções de lógica de negócio para Frota
import { Diaria, Frota } from '../types/frota';

export function isFeriado(date: Date, feriados: string[] = []): boolean {
  const iso = date.toISOString().slice(0, 10);
  return feriados.includes(iso);
}

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