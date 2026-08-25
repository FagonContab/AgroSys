import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AquisicoesVendas, ConsolidadoPasto, ControleAnimais, HistoricoPasto } from './relatorio.model';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly http = inject(HttpClient);
  aquisicoesVendas(): Observable<AquisicoesVendas[]> { return this.http.get<AquisicoesVendas[]>('/api/relatorios/aquisicoes-vendas'); }
  controleAnimais(dataInicio:string,dataFim:string):Observable<ControleAnimais>{return this.http.get<ControleAnimais>('/api/relatorios/controle-animais',{params:new HttpParams().set('dataInicio',dataInicio).set('dataFim',dataFim)});}
  consolidado(areaId?: number | null): Observable<ConsolidadoPasto[]> {
    let params = new HttpParams(); if (areaId) params = params.set('areaId', areaId);
    return this.http.get<ConsolidadoPasto[]>('/api/relatorios/consolidado-pastos', { params });
  }
  historico(filtro: { areaId?: number | null; dataInicio?: string; dataFim?: string }): Observable<HistoricoPasto[]> {
    let params = new HttpParams();
    if (filtro.areaId) params = params.set('areaId', filtro.areaId);
    if (filtro.dataInicio) params = params.set('dataInicio', filtro.dataInicio);
    if (filtro.dataFim) params = params.set('dataFim', filtro.dataFim);
    return this.http.get<HistoricoPasto[]>('/api/relatorios/historico-pastos', { params });
  }
}
