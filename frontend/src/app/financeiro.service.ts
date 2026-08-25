import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ContaBancaria { id:number; nome:string; banco:string; agencia:string|null; conta:string|null; saldoInicial:number; saldo:number; }
export interface Lancamento { id:number; contaBancariaId:number; tipo:'ENTRADA'|'SAIDA'|'COMPRA_GADO'; categoria:string; subcategoria:string|null; descricao:string; fornecedorCliente:string; valor:number; dataLancamento:string; dataVencimento:string; dataEfetivacao:string|null; contaNome:string; animalId?:number|null; brinco?:string; areaId:number|null; areaNome?:string; pastoId:number|null; pastoNome?:string; }
export interface CustoLocalizacao { areaId:number; areaNome:string; inscricao:string; pastoId:number|null; pastoNome:string|null; custo:number; }
export interface TituloFinanceiro { id:number; tipo:'RECEBER'|'PAGAR'; fornecedor:string; dataVencimento:string; valor:number; }
export interface MovimentoExtrato { id:number; data:string; descricao:string; favorecido:string; entrada:number; saida:number; saldo:number; }
export interface ExtratoBancario { conta:{id:number;nome:string;banco:string;agencia:string|null;numero:string|null}; saldoInicial:number; saldoFinal:number; movimentos:MovimentoExtrato[]; }
export interface LinhaDre { categoria:string; valor:number; }
export interface AnimalVendidoDre { id:number; brinco:string; sexo:'M'|'F'; dataCompra:string|null; dataVenda:string; idadeMeses:number|null; valorCompra:number; valorVenda:number; resultado:number; }
export interface DemonstrativoVendas { dataInicio:string; dataFim:string; animais:AnimalVendidoDre[]; totalCompras:number; totalVendas:number; totalResultado:number; }
export interface Dre { dataInicio:string; dataFim:string; receitas:LinhaDre[]; despesas:LinhaDre[]; totalReceitas:number; totalDespesas:number; resultado:number; animaisVendidos:AnimalVendidoDre[]; }
export interface DreAnalise { inicio:string; mesFinal:string; meses:string[]; dados:{mes:string;grupo:'RECEITA'|'DESPESA';categoria:string;valor:number;vertical:number;horizontal:number|null}[]; }
export interface CategoriaDespesa { id:number; nome:string; }
export interface TravaFinanceira { dataTrava:string|null; }

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http=inject(HttpClient);
  contas():Observable<ContaBancaria[]>{return this.http.get<ContaBancaria[]>('/api/financeiro/contas');}
  criarConta(dados:unknown):Observable<unknown>{return this.http.post('/api/financeiro/contas',dados);}
  atualizarConta(id:number,dados:unknown):Observable<unknown>{return this.http.put(`/api/financeiro/contas/${id}`,dados);}
  categoriasDespesa():Observable<CategoriaDespesa[]>{return this.http.get<CategoriaDespesa[]>('/api/financeiro/categorias-despesa');}
  criarCategoriaDespesa(nome:string):Observable<CategoriaDespesa>{return this.http.post<CategoriaDespesa>('/api/financeiro/categorias-despesa',{nome});}
  atualizarCategoriaDespesa(id:number,nome:string):Observable<CategoriaDespesa>{return this.http.put<CategoriaDespesa>(`/api/financeiro/categorias-despesa/${id}`,{nome});}
  lancamentos():Observable<Lancamento[]>{return this.http.get<Lancamento[]>('/api/financeiro/lancamentos');}
  extrato(contaBancariaId:number,dataInicio:string,dataFim:string):Observable<ExtratoBancario>{return this.http.get<ExtratoBancario>('/api/financeiro/extrato',{params:{contaBancariaId,dataInicio,dataFim}});}
  dre(dataInicio:string,dataFim:string):Observable<Dre>{return this.http.get<Dre>('/api/financeiro/dre',{params:{dataInicio,dataFim}});}
  dreAnalise(mesFinal:string):Observable<DreAnalise>{return this.http.get<DreAnalise>('/api/financeiro/dre-analise',{params:{mesFinal}});}
  demonstrativoVendas(dataInicio:string,dataFim:string):Observable<DemonstrativoVendas>{return this.http.get<DemonstrativoVendas>('/api/financeiro/demonstrativo-vendas',{params:{dataInicio,dataFim}});}
  criarLancamento(dados:unknown):Observable<unknown>{return this.http.post('/api/financeiro/lancamentos',dados);}
  atualizarLancamento(id:number,dados:unknown):Observable<unknown>{return this.http.put(`/api/financeiro/lancamentos/${id}`,dados);}
  excluirLancamento(id:number):Observable<void>{return this.http.delete<void>(`/api/financeiro/lancamentos/${id}`);}
  custos():Observable<CustoLocalizacao[]>{return this.http.get<CustoLocalizacao[]>('/api/financeiro/custos-localizacao');}
  fluxoCaixa():Observable<TituloFinanceiro[]>{return this.http.get<TituloFinanceiro[]>('/api/financeiro/fluxo-caixa');}
  trava():Observable<TravaFinanceira>{return this.http.get<TravaFinanceira>('/api/financeiro/trava');}
  salvarTrava(dataTrava:string):Observable<TravaFinanceira>{return this.http.put<TravaFinanceira>('/api/financeiro/trava',{dataTrava});}
  criarTitulo(dados:unknown):Observable<unknown>{return this.http.post('/api/financeiro/fluxo-caixa',dados);}
}
