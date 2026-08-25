export interface Pasto {
  id: number;
  nome: string;
  capacidade: number | null;
  totalAnimais: number;
  areaId?: number;
  areaNome?: string;
  inscricao?: string;
  areaIds?: number[];
}

export interface Area {
  id: number;
  nome: string;
  inscricao: string;
  pastos: Pasto[];
}
