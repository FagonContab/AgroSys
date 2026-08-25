import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Area, Pasto } from './localizacao.model';

@Injectable({ providedIn: 'root' })
export class LocalizacaoService {
  private readonly http = inject(HttpClient);

  listarAreas(): Observable<Area[]> { return this.http.get<Area[]>('/api/areas'); }
  listarPastos(): Observable<Pasto[]> { return this.http.get<Pasto[]>('/api/pastos'); }
  listarCatalogoPastos():Observable<Pasto[]>{return this.http.get<Pasto[]>('/api/pastos/catalogo');}
  cadastrarNomePasto(nome:string):Observable<Pasto>{return this.http.post<Pasto>('/api/pastos/catalogo',{nome});}
  criarArea(area: { nome: string; inscricao: string }): Observable<Area> { return this.http.post<Area>('/api/areas', area); }
  atualizarArea(id: number, area: { nome: string; inscricao: string }): Observable<Area> { return this.http.put<Area>(`/api/areas/${id}`, area); }
  criarPasto(pasto: { areaIds: number[]; nome: string; capacidade: number | null }): Observable<Pasto> { return this.http.post<Pasto>('/api/pastos', pasto); }
  atualizarPasto(id: number, pasto: { areaIds: number[]; nome: string; capacidade: number | null }): Observable<Pasto> { return this.http.put<Pasto>(`/api/pastos/${id}`, pasto); }
  excluirPasto(id: number): Observable<void> { return this.http.delete<void>(`/api/pastos/${id}`); }
}
