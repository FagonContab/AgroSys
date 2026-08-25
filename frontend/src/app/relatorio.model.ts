export interface ConsolidadoPasto {
  pastoId: number; pastoNome: string;
  capacidade: number | null; total: number; femeas: number; machos: number; ativos: number;
  vendidos: number; mortos: number; pesoTotal: number;
}

export interface HistoricoPasto {
  id: number; movimentadoEm: string; observacao: string; animalId: number; brinco: string;
  animalNome: string | null; valorCompra: number | null; pastoOrigem: string | null; areaOrigem: string | null;
  inscricaoOrigem: string | null; pastoDestino: string | null; areaDestino: string | null;
  inscricaoDestino: string | null;
}

export interface AquisicoesVendas { mes: string; aquisicoes: number; vendas: number; }
export interface ControleAnimais { dataInicio:string; dataFim:string; saldoAnterior:number; linhas:{data:string;entradas:number;saidas:number;saldo:number;machos:Record<string,number>;femeas:Record<string,number>}[]; }
