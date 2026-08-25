import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Animal } from './animal.model';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/animais';

  listar(busca = ''): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.url, { params: new HttpParams().set('busca', busca) });
  }

  listarPorArea(areaId: number): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.url, { params: new HttpParams().set('areaId', areaId) });
  }

  criar(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.url, animal);
  }

  criarLote(lote: { quantidade: number; prefixoBrinco: string; numeroInicial: number; nome: string | null; especie: string; raca: string | null; sexo: string; dataNascimento: string | null; dataCompra: string | null; financeiroPendente: boolean; dataVencimentoCompra: string | null; contaPagamentoId: number | null; valorCompra: number | null; fornecedor: string | null; numeroNotaFiscal: string | null; pesoMedio: number; status: string; valorVenda: number | null; contaBancariaId: number | null; areaId: number; pastoId: number | null; observacoes: string | null }): Observable<{ quantidade: number; ids: number[]; prefixoBrinco?: string }> {
    return this.http.post<{ quantidade: number; ids: number[]; prefixoBrinco?: string }>(`${this.url}/lote`, lote);
  }

  transferir(animalIds: number[], areaDestinoId: number, pastoDestinoId: number): Observable<{ quantidade: number }> {
    return this.http.post<{ quantidade: number }>(`${this.url}/transferencia`, { animalIds, areaDestinoId, pastoDestinoId });
  }

  atualizar(id: number, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.url}/${id}`, animal);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
