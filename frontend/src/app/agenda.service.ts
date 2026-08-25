import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface EventoAgenda{id:number;titulo:string;descricao:string|null;dataEvento:string;prioridade:'BAIXA'|'MEDIA'|'ALTA';recorrencia:'NENHUMA'|'DIARIA'|'SEMANAL'|'MENSAL'|'ANUAL';antecedenciaMinutos:number;status:'PENDENTE'|'CONCLUIDO';}
@Injectable({providedIn:'root'}) export class AgendaService{private readonly http=inject(HttpClient);listar():Observable<EventoAgenda[]>{return this.http.get<EventoAgenda[]>('/api/agenda');}criar(dados:unknown):Observable<{id:number}>{return this.http.post<{id:number}>('/api/agenda',dados);}alterarStatus(id:number,status:'PENDENTE'|'CONCLUIDO'):Observable<unknown>{return this.http.patch(`/api/agenda/${id}/status`,{status});}excluir(id:number):Observable<void>{return this.http.delete<void>(`/api/agenda/${id}`);}}
