import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), { provide: LOCALE_ID, useValue: 'pt-BR' }]
}).catch((erro: unknown) => {
  console.error(erro);
  const mensagem = erro instanceof Error ? erro.message : String(erro);
  document.body.innerHTML = `
    <main style="font-family:Arial,sans-serif;max-width:760px;margin:60px auto;padding:24px">
      <h1 style="color:#9b2c2c">Não foi possível iniciar o AgroSys</h1>
      <p>${mensagem}</p>
      <p>Recarregue a página com <strong>Ctrl + F5</strong>.</p>
    </main>`;
});
