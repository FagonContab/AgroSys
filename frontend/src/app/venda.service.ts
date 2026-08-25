import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Venda {
  id:number; areaId:number; areaNome:string; inscricao:string; numeroNotaFiscal:string;
  compradorNome:string; compradorDocumento:string; compradorTelefone:string|null; compradorEndereco:string|null;
  dataEmissao:string; valorTotal:number|null; dataPrimeiroVencimento:string|null; quantidadeParcelas:number|null;
  contaBancariaId:number|null; contaNome:string|null; observacoes:string|null; status:'RASCUNHO'|'CONCLUIDA'; animais:{id:number;brinco:string}[];
}

@Injectable({providedIn:'root'})
export class VendaService {
  private readonly http=inject(HttpClient);
  listar():Observable<Venda[]>{return this.http.get<Venda[]>('/api/vendas');}
  criar(dados:unknown):Observable<{id:number}>{return this.http.post<{id:number}>('/api/vendas',dados);}
  baixarAnimais(dados:unknown):Observable<{id:number}>{return this.http.post<{id:number}>('/api/vendas/baixa',dados);}
  atualizar(id:number,dados:unknown):Observable<{id:number}>{return this.http.put<{id:number}>(`/api/vendas/${id}`,dados);}
}
