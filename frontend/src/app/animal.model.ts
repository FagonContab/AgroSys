export type Sexo = 'M' | 'F';
export type StatusAnimal = 'ATIVO' | 'VENDIDO' | 'MORTO';

export interface Animal {
  id?: number;
  brinco: string;
  nome: string | null;
  especie: string;
  raca: string | null;
  sexo: Sexo;
  dataNascimento: string | null;
  dataCompra?: string | null;
  valorCompra?: number | null;
  dataVencimentoCompra?: string | null;
  contaPagamentoId?: number | null;
  fornecedor?: string | null;
  numeroNotaFiscal?: string | null;
  peso: number | null;
  status: StatusAnimal;
  pastoId?: number | null;
  valorVenda?: number | null;
  contaBancariaId?: number | null;
  pastoNome?: string | null;
  areaId?: number | null;
  areaNome?: string | null;
  inscricao?: string | null;
  observacoes: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}
