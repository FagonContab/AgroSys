import { chromium } from 'playwright-core';

const navegador = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--disable-gpu', '--disable-software-rasterizer']
});
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
const mensagens = [];
pagina.on('console', (msg) => mensagens.push(`CONSOLE ${msg.type()}: ${msg.text()}`));
pagina.on('pageerror', (erro) => mensagens.push(`PAGEERROR: ${erro.stack ?? erro.message}`));
pagina.on('requestfailed', (req) => mensagens.push(`REQUESTFAILED: ${req.url()} ${req.failure()?.errorText}`));

const resposta = await pagina.goto('http://localhost:4200', { waitUntil: 'domcontentloaded', timeout: 10000 });
await pagina.waitForTimeout(1500);
console.log(`STATUS: ${resposta?.status()}`);
console.log(`TITULO: ${await pagina.title()}`);
console.log(`TEXTO: ${(await pagina.locator('body').innerText()).slice(0, 2000)}`);
console.log(`APP_HTML: ${(await pagina.locator('app-root').innerHTML()).slice(0, 2000)}`);
console.log(mensagens.join('\n'));
await pagina.screenshot({ path: 'pagina-diagnostico.png', fullPage: true });
await navegador.close();
