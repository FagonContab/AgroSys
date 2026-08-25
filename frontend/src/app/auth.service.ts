import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Sessao { usuario:{id:number;nome:string;login:string}; produtor:{id:number;nome:string}; perfil:'ADMIN'|'USUARIO'; }
export interface UsuarioProdutor { id:number;nome:string;login:string;email?:string|null;ativo:boolean;perfil:'ADMIN'|'USUARIO'; }

@Injectable({providedIn:'root'})
export class AuthService{
  private readonly http=inject(HttpClient);
  sessao():Observable<Sessao>{return this.http.get<Sessao>('/api/auth/sessao');}
  login(login:string,senha:string):Observable<Sessao>{return this.http.post<Sessao>('/api/auth/login',{login,senha});}
  esqueciSenha(login:string):Observable<{mensagem:string}>{return this.http.post<{mensagem:string}>('/api/auth/esqueci-senha',{login});}
  logout():Observable<void>{return this.http.post<void>('/api/auth/logout',{});}
  usuarios():Observable<UsuarioProdutor[]>{return this.http.get<UsuarioProdutor[]>('/api/produtor/usuarios');}
  criarUsuario(dados:{nome:string;login:string;email:string;senha:string}):Observable<unknown>{return this.http.post('/api/produtor/usuarios',dados);}
}
