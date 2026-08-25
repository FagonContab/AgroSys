import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Animal, Sexo, StatusAnimal } from './animal.model';
import { AnimalService } from './animal.service';
import { AgendaService, EventoAgenda } from './agenda.service';
import { Area, Pasto } from './localizacao.model';
import { LocalizacaoService } from './localizacao.service';
import { AquisicoesVendas, ConsolidadoPasto, ControleAnimais, HistoricoPasto } from './relatorio.model';
import { RelatorioService } from './relatorio.service';
import { CategoriaDespesa, ContaBancaria, CustoLocalizacao, DemonstrativoVendas, Dre, DreAnalise, ExtratoBancario, FinanceiroService, Lancamento, TituloFinanceiro } from './financeiro.service';
import { createWorker, Worker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Venda, VendaService } from './venda.service';
import { MoedaDirective } from './moeda.directive';
import { AnoQuatroDirective } from './ano-quatro.directive';
import { AuthService, Sessao, UsuarioProdutor } from './auth.service';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MoedaDirective, AnoQuatroDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AnimalService);
  private readonly localizacaoService = inject(LocalizacaoService);
  private readonly relatorioService = inject(RelatorioService);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly agendaService = inject(AgendaService);
  private readonly vendaService = inject(VendaService);
  private readonly authService=inject(AuthService);
  private workerNotaFiscal: Promise<Worker> | null = null;
  private atualizacaoAutomaticaId: ReturnType<typeof setInterval> | null = null;
  private fechamentoMenuId:ReturnType<typeof setTimeout>|null=null;
  private readonly atualizarAoFocar = () => this.atualizarTudo();

  animais: Animal[] = [];
  sessao:Sessao|null=null; verificandoSessao=true; erroLogin=''; mensagemLogin=''; entrando=false; senhaVisivel=false; recuperandoSenha=false; usuariosProdutor:UsuarioProdutor[]=[]; erroUsuarios=''; mensagemUsuarios='';
  readonly formularioLogin=this.fb.nonNullable.group({login:['',Validators.required],senha:['',Validators.required]});
  readonly formularioUsuario=this.fb.nonNullable.group({nome:['',Validators.required],login:['',Validators.required],email:['',[Validators.required,Validators.email]],senha:['',[Validators.required,Validators.minLength(6)]]});
  busca = '';
  editandoId: number | null = null;
  carregando = false;
  salvando = false;
  tentouSalvar = false;
  mensagem = '';
  erro = '';
  mensagemLote = '';
  lendoNotaFiscal = false;
  lendoNotaFiscalVenda=false; arquivoNotaFiscalVenda=''; progressoNotaVenda='';
  arquivoNotaFiscal = '';
  progressoLeituraNota = '';
  rascunhosLote: { id: string; criadoEm: string; arquivo: string; dados: Record<string, string | number | boolean | null> }[] = [];
  rascunhoLoteAtualId: string | null = null;
  erroFinanceiro = '';
  mensagemFinanceiro = '';
  editandoLancamentoId: number | null = null;
  lancamentoVisualizadoId: number | null = null;
  areas: Area[] = [];
  pastosDisponiveis: Pasto[] = [];
  catalogoPastos:Pasto[]=[]; novoNomePasto=''; salvandoNomePasto=false;
  editandoAreaId: number | null = null;
  editandoPastoId: number | null = null;
  consolidado: ConsolidadoPasto[] = [];
  historico: HistoricoPasto[] = [];
  filtroRelatorio = { areaId: null as number | null, dataInicio: '', dataFim: '' };
  relatorioAnimaisVisivel = false;
  filtroStatusAnimaisRelatorio:'ATIVO'|'VENDIDO'|'TODOS'='ATIVO';
  paginaAtiva: 'inicio' | 'agenda' | 'vendas' | 'produtor-usuarios' | 'cadastro-animais' | 'cadastro-lote' | 'cadastro-localizacoes' | 'transferencia-pastos' | 'relatorio-pastos' | 'relatorio-animais' | 'controle-animais' | 'estoque-inscricao' | 'financeiro-contas' | 'financeiro-lancamentos' | 'financeiro-fluxo' | 'financeiro-extrato' | 'financeiro-dre' | 'financeiro-demonstrativo-vendas' | 'financeiro-trava' = 'inicio';
  contasBancarias: ContaBancaria[] = [];
  editandoContaId: number | null = null;
  dataTravaFinanceira=''; travaFinanceiraAtual:string|null=null; salvandoTrava=false;
  categoriasDespesa: CategoriaDespesa[] = [];
  novaCategoriaDespesa = '';
  editandoCategoriaDespesaId:number|null=null;
  selecionandoCategoriaDespesa=false;
  categoriaDespesaSelecionadaId:number|null=null;
  ordenacaoLancamentos: 'dataVencimento'|'dataLancamento'|'dataEfetivacao'|'valor' = 'dataVencimento';
  direcaoLancamentos: 'asc'|'desc' = 'asc';
  filtroSituacaoMovimentos:'TODOS'|'PAGOS'|'A_PAGAR'='TODOS';
  valoresDashboardVisiveis=false;
  filtroMovimento={texto:'',fornecedor:'',tipo:'TODOS',categoria:'',subcategoria:'',dataInicio:'',dataFim:'',valorMinimo:null as number|null,valorMaximo:null as number|null};
  tentouSalvarLancamento=false;
  lancamentosFinanceiros: Lancamento[] = [];
  todosLancamentosFinanceiros:Lancamento[]=[];
  custosLocalizacao: CustoLocalizacao[] = [];
  titulosFinanceiros: TituloFinanceiro[] = [];
  filtroFluxoInicio = this.dataLocalHoje();
  filtroFluxoFim = this.fimPeriodoPadrao(this.filtroFluxoInicio);
  periodoFluxoInicio = this.filtroFluxoInicio;
  periodoFluxoFim = this.filtroFluxoFim;
  filtroExtratoContaId: number | null = null;
  filtroExtratoInicio = `${this.dataLocalHoje().slice(0, 7)}-01`;
  filtroExtratoFim = this.dataLocalHoje();
  extratoBancario: ExtratoBancario | null = null;
  carregandoExtrato = false;
  filtroDreInicio = `${this.dataLocalHoje().slice(0, 7)}-01`;
  filtroDreFim = this.dataLocalHoje();
  filtroDreMes=this.dataLocalHoje().slice(0,7); dreAnalise:DreAnalise|null=null; carregandoDreAnalise=false;
  dre: Dre | null = null;
  filtroDemonstrativoInicio=`${this.dataLocalHoje().slice(0,7)}-01`;filtroDemonstrativoFim=this.dataLocalHoje();demonstrativoVendas:DemonstrativoVendas|null=null;carregandoDemonstrativo=false;erroDemonstrativo='';
  carregandoDre = false;
  exibirPendenciasAnteriores=false;
  localizacaoFinanceiraAberta = '';
  animaisCusto: Animal[] = [];
  areaExpandidaId: number | null = null;
  animaisArea: Animal[] = [];
  carregandoAnimaisArea = false;
  pastoRelatorioExpandidoId: string | null = null;
  animaisPastoRelatorio: Animal[] = [];
  carregandoAnimaisPastoRelatorio = false;
  animalVisualizadoId: number | null = null;
  lotesAbertos = new Set<string>();
  historicoVisivel = false;
  graficoAquisicoesVendas: AquisicoesVendas[] = [];
  filtroControleInicio=`${this.dataLocalHoje().slice(0,7)}-01`; filtroControleFim=this.dataLocalHoje(); controleAnimais:ControleAnimais|null=null; carregandoControle=false; erroControle='';
  exibirControleFaixas=false;
  localOrigemTransferencia = '';
  localDestinoTransferencia = '';
  animaisSelecionadosTransferencia = new Set<number>();
  transferindo = false;
  eventosAgenda:EventoAgenda[]=[];
  vendas:Venda[]=[]; editandoVendaId:number|null=null; animaisSelecionadosVenda=new Set<number>(); salvandoVenda=false; erroVenda=''; mensagemVenda='';
  baixaVendaRealizada=false;
  quantidadeNotaVenda:number|null=null; vendedorNotaVenda=''; tentouSalvarVenda=false;
  rascunhosVenda:{id:string;arquivo:string;criadoEm:string;quantidade:number|null;vendedor:string;dados:ReturnType<AppComponent['formularioVenda']['getRawValue']>}[]=[];rascunhoVendaAtualId:string|null=null;
  readonly formularioAgenda=this.fb.group({titulo:['',Validators.required],descricao:[''],dataEvento:['',Validators.required],prioridade:['MEDIA',Validators.required],recorrencia:['NENHUMA',Validators.required],antecedenciaMinutos:[1440,[Validators.required,Validators.min(0)]]});

  get tituloPagina(): string {
    const titulos: Record<typeof this.paginaAtiva, string> = {
      inicio: 'Visão geral do rebanho',
      agenda: 'Agenda e Lembretes',
      vendas: 'Vendas e baixa de animais',
      'produtor-usuarios':'Usuários do Produtor',
      'cadastro-animais': 'Cadastro de Animais',
      'cadastro-lote': 'Aquisição de Lote',
      'transferencia-pastos': 'Transferência de Gado entre Pastos',
      'cadastro-localizacoes': 'Cadastro de Áreas e Pastos',
      'relatorio-pastos': 'Estoque de Gado por Pasto',
      'relatorio-animais': 'Animais Cadastrados',
      'controle-animais': 'Controle de Animais',
      'estoque-inscricao': 'Estoque por Inscrição',
      'financeiro-lancamentos': 'Lançamentos Financeiros',
      'financeiro-contas': 'Contas Bancárias',
      'financeiro-fluxo': 'Fluxo de Caixa',
      'financeiro-extrato': 'Extrato Bancário',
      'financeiro-dre': 'DRE'
      ,'financeiro-demonstrativo-vendas':'Demonstrativo de vendas'
      ,'financeiro-trava':'Trava Financeira'
    };
    return titulos[this.paginaAtiva];
  }

  get subtituloPagina(): string {
    const subtitulos: Record<typeof this.paginaAtiva, string> = {
      inicio: 'Acompanhe os principais indicadores da sua propriedade.',
      agenda: 'Organize eventos, procedimentos e atividades importantes.',
      vendas: 'Emita a venda, baixe os brincos e gere os valores a receber.',
      'produtor-usuarios':'Cadastre as pessoas que podem acessar os dados deste produtor.',
      'cadastro-animais': 'Registre e acompanhe os animais da sua propriedade.',
      'cadastro-lote': 'Cadastre vários animais em sequência pelo peso médio.',
      'transferencia-pastos': 'Selecione os animais e mova todos para um novo pasto.',
      'cadastro-localizacoes': 'Organize as áreas, inscrições e pastos da propriedade.',
      'relatorio-pastos': 'Consulte o rebanho por inscrição, área e pasto.',
      'relatorio-animais': 'Consulte todos os animais cadastrados no rebanho.',
      'controle-animais': 'Acompanhe diariamente entradas, saídas e o saldo do rebanho.',
      'estoque-inscricao': 'Consulte o gado de cada inscrição por sexo e faixa de idade.',
      'financeiro-lancamentos': 'Registre receitas, despesas e contas bancárias.',
      'financeiro-contas': 'Cadastre e consulte as contas bancárias da propriedade.',
      'financeiro-fluxo': 'Acompanhe valores a pagar, a receber e o saldo projetado.',
      'financeiro-extrato': 'Consulte entradas, saídas e saldo bancário por período.',
      'financeiro-dre': 'Analise receitas, despesas e o resultado do período.'
      ,'financeiro-demonstrativo-vendas':'Consulte o resultado de cada animal vendido.'
      ,'financeiro-trava':'Bloqueie alterações financeiras anteriores à data definida.'
    };
    return subtitulos[this.paginaAtiva];
  }

  readonly formularioArea = this.fb.nonNullable.group({ nome: ['', Validators.required], inscricao: ['', Validators.required] });
  readonly formularioPasto = this.fb.group({ areaIds: [[] as number[], Validators.required], nome: ['', Validators.required], capacidade: [null as number | null, Validators.min(1)] });
  readonly formularioLote = this.fb.group({
    quantidade: [null as number | null, [Validators.required, Validators.min(1), Validators.max(1000)]],
    prefixoBrinco: ['', Validators.required], numeroInicial: [1, [Validators.required, Validators.min(1)]],
    nome: ['', Validators.maxLength(100)],
    especie: ['Bovino', Validators.required], raca: [''], sexo: ['F' as Sexo, Validators.required],
    dataNascimento: [''], dataCompra: [''], financeiroPendente: [true], dataVencimentoCompra: [''],
    contaPagamentoId: [null as number | null],
    valorCompra: [null as number | null, [Validators.min(0.01), Validators.max(9999999999.99)]],
    fornecedor: ['', [Validators.required, Validators.maxLength(150)]], numeroNotaFiscal: ['', Validators.maxLength(60)],
    pesoMedio: [null as number | null, [Validators.required, Validators.min(0.01)]],
    status: ['ATIVO' as StatusAnimal, Validators.required],
    valorVenda: [null as number | null], contaBancariaId: [null as number | null],
    areaProprietarioId:[null as number|null,Validators.required],pastoId: [null as number | null, Validators.required], observacoes: ['', Validators.maxLength(2000)]
  });
  readonly formularioConta = this.fb.group({ nome:['',Validators.required], banco:['',Validators.required], agencia:[''], conta:[''], saldoInicial:[0] });
  readonly formularioLancamento = this.fb.group({ contaBancariaId:[null as number|null,Validators.required], tipo:['SAIDA',Validators.required], categoria:['',Validators.required], subcategoria:['',Validators.maxLength(100)], descricao:[''], fornecedorCliente:['',Validators.required], valor:[null as number|null,[Validators.required,Validators.min(.01)]], dataLancamento:[this.dataLocalHoje(),Validators.required], dataVencimento:['',Validators.required], dataEfetivacao:[''], recorrente:[false], quantidadeParcelas:[1,[Validators.required,Validators.min(1),Validators.max(120)]], areaId:[null as number|null], pastoId:[null as number|null] });
  readonly formularioTitulo = this.fb.group({ tipo:['PAGAR',Validators.required], fornecedor:['',Validators.required], dataVencimento:['',Validators.required], valor:[null as number|null,[Validators.required,Validators.min(.01)]] });
  readonly formularioVenda=this.fb.group({areaId:[null as number|null,Validators.required],numeroNotaFiscal:['',Validators.required],compradorNome:['',Validators.required],compradorDocumento:['',Validators.required],compradorTelefone:[''],compradorEndereco:[''],dataEmissao:[this.dataLocalHoje(),Validators.required],valorTotal:[null as number|null,Validators.min(.01)],dataPrimeiroVencimento:[this.dataLocalHoje(),Validators.required],quantidadeParcelas:[1,[Validators.min(1),Validators.max(120)]],contaBancariaId:[null as number|null],observacoes:['']});

  readonly formulario = this.fb.nonNullable.group({
    brinco: ['', [Validators.required, Validators.maxLength(30)]],
    nome: ['', Validators.maxLength(100)],
    especie: ['Bovino', [Validators.required, Validators.maxLength(50)]],
    raca: ['', Validators.maxLength(80)],
    sexo: ['F' as Sexo, Validators.required],
    dataNascimento: [''],
    dataCompra: [''], dataVencimentoCompra: ['', Validators.required],
    contaPagamentoId: [null as number | null, Validators.required],
    valorCompra: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(9999999999.99)]],
    fornecedor: ['', [Validators.required, Validators.maxLength(150)]],
    numeroNotaFiscal: ['', Validators.maxLength(60)],
    peso: [null as number | null, [Validators.min(0.01), Validators.max(99999999.99)]],
    status: ['ATIVO' as StatusAnimal, Validators.required],
    areaId: [null as number | null, Validators.required],
    pastoId: [null as number | null, Validators.required],
    valorVenda: [null as number | null], contaBancariaId: [null as number | null],
    observacoes: ['', Validators.maxLength(2000)]
  });

  ngOnInit(): void {
    this.formularioLogin.controls.login.setValue(localStorage.getItem('agrosys-ultimo-login')??'');
    this.carregarRascunhosLote();
    try{this.rascunhosVenda=JSON.parse(localStorage.getItem('agrosys-vendas-pendentes')||'[]');}catch{this.rascunhosVenda=[];}
    this.atualizarConfirmacaoFinanceira();
    this.authService.sessao().subscribe({next:s=>{this.sessao=s;this.verificandoSessao=false;this.iniciarAplicacaoAutenticada();},error:()=>this.verificandoSessao=false});
  }

  private iniciarAplicacaoAutenticada():void{
    this.atualizarTudo();
    window.addEventListener('focus', this.atualizarAoFocar);
    this.atualizacaoAutomaticaId = setInterval(() => this.atualizarTudo(), 60000);
  }

  entrar():void{if(this.formularioLogin.invalid){this.formularioLogin.markAllAsTouched();return;}this.entrando=true;this.erroLogin='';this.mensagemLogin='';const v=this.formularioLogin.getRawValue();this.authService.login(v.login,v.senha).subscribe({next:s=>{localStorage.setItem('agrosys-ultimo-login',s.usuario.login);this.sessao=s;this.entrando=false;this.formularioLogin.reset({login:s.usuario.login,senha:''});this.iniciarAplicacaoAutenticada();},error:(e:HttpErrorResponse)=>{this.erroLogin=this.mensagemApi(e,'Não foi possível entrar.');this.entrando=false;}});}
  solicitarNovaSenha():void{const login=this.formularioLogin.controls.login.value.trim();if(!login){this.erroLogin='Informe seu login para solicitar uma nova senha.';return;}this.recuperandoSenha=true;this.erroLogin='';this.mensagemLogin='';this.authService.esqueciSenha(login).subscribe({next:r=>{this.mensagemLogin=r.mensagem;this.recuperandoSenha=false;},error:(e:HttpErrorResponse)=>{this.erroLogin=this.mensagemApi(e,'Não foi possível solicitar uma nova senha.');this.recuperandoSenha=false;}});}
  sair():void{this.authService.logout().subscribe({next:()=>{this.sessao=null;this.paginaAtiva='inicio';this.usuariosProdutor=[];if(this.atualizacaoAutomaticaId){clearInterval(this.atualizacaoAutomaticaId);this.atualizacaoAutomaticaId=null;}window.removeEventListener('focus',this.atualizarAoFocar);}});}
  carregarUsuariosProdutor():void{if(this.sessao?.perfil!=='ADMIN')return;this.authService.usuarios().subscribe({next:d=>this.usuariosProdutor=d,error:(e:HttpErrorResponse)=>this.erroUsuarios=this.mensagemApi(e,'Não foi possível carregar os usuários.')});}
  salvarUsuarioProdutor():void{if(this.formularioUsuario.invalid){this.formularioUsuario.markAllAsTouched();return;}this.erroUsuarios='';this.mensagemUsuarios='';this.authService.criarUsuario(this.formularioUsuario.getRawValue()).subscribe({next:()=>{this.mensagemUsuarios='Usuário criado com acesso ao produtor.';this.formularioUsuario.reset();this.carregarUsuariosProdutor();},error:(e:HttpErrorResponse)=>this.erroUsuarios=this.mensagemApi(e,'Não foi possível criar o usuário. Verifique se o login já existe.')});}

  ngOnDestroy(): void {
    window.removeEventListener('focus', this.atualizarAoFocar);
    if (this.atualizacaoAutomaticaId) clearInterval(this.atualizacaoAutomaticaId);
    if(this.fechamentoMenuId)clearTimeout(this.fechamentoMenuId);
  }

  @HostListener('document:mousemove',['$event']) controlarSaidaMenus(evento:MouseEvent):void{const alvo=evento.target as Element|null;if(alvo?.closest('.nav-menu')){if(this.fechamentoMenuId){clearTimeout(this.fechamentoMenuId);this.fechamentoMenuId=null;}return;}if(!this.fechamentoMenuId&&document.querySelector('.nav-menu[open]'))this.fechamentoMenuId=setTimeout(()=>{this.fecharMenus();this.fechamentoMenuId=null;},350);}

  atualizarTudo(): void {
    this.listar();
    this.listarAreas();
    this.listarPastos();
    this.gerarRelatorios();
    this.carregarGrafico();
    this.carregarFinanceiro();
    this.carregarAgenda();
    this.carregarVendas();
  }

  carregarVendas():void{this.vendaService.listar().subscribe({next:d=>this.vendas=d,error:()=>this.erroVenda='Não foi possível carregar as vendas. Execute a migration 013_vendas.sql se necessário.'});}
  get animaisDisponiveisVenda():Animal[]{const areaId=this.formularioVenda.controls.areaId.value;return this.animais.filter(a=>!!a.id&&a.areaId===areaId&&(a.status==='ATIVO'||this.animaisSelecionadosVenda.has(a.id!)));}
  alternarAnimalVenda(id:number,marcado:boolean):void{marcado?this.animaisSelecionadosVenda.add(id):this.animaisSelecionadosVenda.delete(id);}
  alterarInscricaoVenda():void{this.animaisSelecionadosVenda.clear();}
  sincronizarVencimentoVenda():void{const emissao=this.formularioVenda.controls.dataEmissao.value;if(emissao)this.formularioVenda.controls.dataPrimeiroVencimento.setValue(emissao);}
  get pastosProprietarioLote():Pasto[]{const areaId=this.formularioLote.controls.areaProprietarioId.value;return areaId?this.pastosDisponiveis.filter(p=>p.areaId===areaId):[];}
  get pastosProprietarioAnimal():Pasto[]{const areaId=this.formulario.controls.areaId.value;return areaId?this.pastosDisponiveis.filter(p=>p.areaId===areaId):[];}
  private dadosVenda(){return{...this.formularioVenda.getRawValue(),quantidadeNotaFiscal:this.quantidadeNotaVenda,animalIds:[...this.animaisSelecionadosVenda]};}
  get divergenciaQuantidadeVenda():boolean{return this.quantidadeNotaVenda!==null&&this.quantidadeNotaVenda!==this.animaisSelecionadosVenda.size;}
  private vendaValida():boolean{if(this.divergenciaQuantidadeVenda){this.erroVenda=`A nota informa ${this.quantidadeNotaVenda} animal(is), mas foram selecionados ${this.animaisSelecionadosVenda.size} brincos para baixa.`;return false;}if(this.formularioVenda.invalid||!this.animaisSelecionadosVenda.size){this.formularioVenda.markAllAsTouched();this.erroVenda='Preencha os campos obrigatórios destacados e selecione ao menos um brinco.';return false;}return true;}
  baixarAnimaisVenda():void{this.tentouSalvarVenda=true;this.erroVenda='';this.mensagemVenda='';if(this.editandoVendaId||!this.vendaValida())return;this.salvandoVenda=true;this.vendaService.baixarAnimais(this.dadosVenda()).subscribe({next:r=>{this.editandoVendaId=r.id;this.baixaVendaRealizada=true;this.mensagemVenda='Animais baixados. Revise os dados e clique em Concluir venda.';this.listar();this.carregarVendas();this.salvandoVenda=false;},error:(e:HttpErrorResponse)=>{this.erroVenda=this.mensagemApi(e,'Não foi possível baixar os animais.');this.salvandoVenda=false;}});}
  salvarVenda():void{this.tentouSalvarVenda=true;this.erroVenda='';this.mensagemVenda='';if(!this.baixaVendaRealizada||!this.editandoVendaId){this.erroVenda='Primeiro clique em Baixar animais para confirmar os brincos da venda.';return;}if(!this.vendaValida())return;this.salvandoVenda=true;this.vendaService.atualizar(this.editandoVendaId,this.dadosVenda()).subscribe({next:()=>{if(this.rascunhoVendaAtualId){this.rascunhosVenda=this.rascunhosVenda.filter(r=>r.id!==this.rascunhoVendaAtualId);this.salvarRascunhosVenda();}this.cancelarEdicaoVenda(false);this.mensagemVenda='Venda concluída com sucesso.';this.atualizarTudo();this.salvandoVenda=false;},error:(e:HttpErrorResponse)=>{this.erroVenda=this.mensagemApi(e,'Não foi possível concluir a venda.');this.salvandoVenda=false;}});}
    editarVenda(v:Venda):void{this.editandoVendaId=v.id;this.baixaVendaRealizada=true;this.quantidadeNotaVenda=v.animais.length;this.animaisSelecionadosVenda=new Set(v.animais.map(a=>a.id));this.formularioVenda.setValue({areaId:v.areaId,numeroNotaFiscal:v.numeroNotaFiscal,compradorNome:v.compradorNome,compradorDocumento:v.compradorDocumento,compradorTelefone:v.compradorTelefone??'',compradorEndereco:v.compradorEndereco??'',dataEmissao:v.dataEmissao,valorTotal:v.valorTotal,dataPrimeiroVencimento:v.dataPrimeiroVencimento??v.dataEmissao,quantidadeParcelas:v.quantidadeParcelas??1,contaBancariaId:v.contaBancariaId,observacoes:v.observacoes??''});document.getElementById('formulario-venda')?.scrollIntoView({behavior:'smooth'});}
    cancelarEdicaoVenda(limpar=true):void{this.editandoVendaId=null;this.baixaVendaRealizada=false;this.tentouSalvarVenda=false;this.rascunhoVendaAtualId=null;this.quantidadeNotaVenda=null;this.vendedorNotaVenda='';this.animaisSelecionadosVenda.clear();this.arquivoNotaFiscalVenda='';const hoje=this.dataLocalHoje();this.formularioVenda.reset({areaId:null,numeroNotaFiscal:'',compradorNome:'',compradorDocumento:'',compradorTelefone:'',compradorEndereco:'',dataEmissao:hoje,valorTotal:null,dataPrimeiroVencimento:hoje,quantidadeParcelas:1,contaBancariaId:null,observacoes:''});if(limpar){this.erroVenda='';this.mensagemVenda='';}}

  carregarAgenda():void{this.agendaService.listar().subscribe({next:d=>this.eventosAgenda=d,error:()=>this.erro='Não foi possível carregar a agenda.'});}
  salvarEvento():void{if(this.formularioAgenda.invalid){this.formularioAgenda.markAllAsTouched();this.erro='Preencha título, data e configurações do lembrete.';return;}this.agendaService.criar(this.formularioAgenda.getRawValue()).subscribe({next:()=>{this.mensagem='Evento salvo na agenda.';this.formularioAgenda.reset({titulo:'',descricao:'',dataEvento:'',prioridade:'MEDIA',recorrencia:'NENHUMA',antecedenciaMinutos:1440});this.carregarAgenda();},error:(e:HttpErrorResponse)=>this.erro=this.mensagemApi(e,'Não foi possível salvar o evento.')});}
  alternarStatusEvento(evento:EventoAgenda):void{this.agendaService.alterarStatus(evento.id,evento.status==='PENDENTE'?'CONCLUIDO':'PENDENTE').subscribe({next:()=>this.carregarAgenda(),error:()=>this.erro='Não foi possível alterar o evento.'});}
  excluirEvento(evento:EventoAgenda):void{if(!confirm(`Excluir o evento "${evento.titulo}"?`))return;this.agendaService.excluir(evento.id).subscribe({next:()=>this.carregarAgenda(),error:()=>this.erro='Não foi possível excluir o evento.'});}
  get lembretesAtivos():EventoAgenda[]{const agora=Date.now();return this.eventosAgenda.filter(e=>e.status==='PENDENTE'&&new Date(e.dataEvento).getTime()-e.antecedenciaMinutos*60000<=agora);}

  carregarFinanceiro():void {
    this.financeiroService.contas().subscribe({next:d=>{this.contasBancarias=d;if(!this.filtroExtratoContaId&&d.length)this.filtroExtratoContaId=d[0].id;}});
    this.financeiroService.lancamentos().subscribe({next:d=>{this.todosLancamentosFinanceiros=d;this.aplicarFiltroMovimentos();}});
    this.financeiroService.custos().subscribe({next:d=>this.custosLocalizacao=d});
    this.financeiroService.fluxoCaixa().subscribe({next:d=>this.titulosFinanceiros=d});
    this.financeiroService.categoriasDespesa().subscribe({next:d=>this.categoriasDespesa=d});
  }

  salvarCategoriaDespesa():void{const nome=this.novaCategoriaDespesa.trim();if(!nome){this.erroFinanceiro='Informe o nome da categoria.';return;}const editando=!!this.editandoCategoriaDespesaId;const requisicao=this.editandoCategoriaDespesaId?this.financeiroService.atualizarCategoriaDespesa(this.editandoCategoriaDespesaId,nome):this.financeiroService.criarCategoriaDespesa(nome);requisicao.subscribe({next:c=>{this.categoriasDespesa=editando?this.categoriasDespesa.map(item=>item.id===c.id?c:item).sort((a,b)=>a.nome.localeCompare(b.nome)):[...this.categoriasDespesa,c].sort((a,b)=>a.nome.localeCompare(b.nome));this.formularioLancamento.controls.categoria.setValue(c.nome);this.cancelarEdicaoCategoriaDespesa();this.mensagemFinanceiro=editando?'Categoria alterada com sucesso.':'Categoria criada com sucesso.';this.carregarFinanceiro();},error:(e:HttpErrorResponse)=>this.erroFinanceiro=this.mensagemApi(e,'Não foi possível salvar a categoria. Talvez esse nome já exista.')});}
  editarCategoriaDespesa():void{this.selecionandoCategoriaDespesa=true;this.categoriaDespesaSelecionadaId=null;this.editandoCategoriaDespesaId=null;this.novaCategoriaDespesa='';this.erroFinanceiro='';}
  selecionarCategoriaDespesaParaEditar():void{const categoria=this.categoriasDespesa.find(item=>item.id===this.categoriaDespesaSelecionadaId);this.editandoCategoriaDespesaId=categoria?.id??null;this.novaCategoriaDespesa=categoria?.nome??'';}
  cancelarEdicaoCategoriaDespesa():void{this.editandoCategoriaDespesaId=null;this.categoriaDespesaSelecionadaId=null;this.selecionandoCategoriaDespesa=false;this.novaCategoriaDespesa='';}

  ordenarLancamentos(campo:typeof this.ordenacaoLancamentos):void{if(this.ordenacaoLancamentos===campo)this.direcaoLancamentos=this.direcaoLancamentos==='asc'?'desc':'asc';else{this.ordenacaoLancamentos=campo;this.direcaoLancamentos='asc';}}
  get lancamentosOrdenados():Lancamento[]{const fator=this.direcaoLancamentos==='asc'?1:-1;return [...this.lancamentosFinanceiros].sort((a,b)=>{const va=campoValor(a,this.ordenacaoLancamentos),vb=campoValor(b,this.ordenacaoLancamentos);return (va<vb?-1:va>vb?1:0)*fator;});function campoValor(l:Lancamento,campo:string):string|number{return campo==='valor'?l.valor:(l[campo as 'dataVencimento'|'dataLancamento'|'dataEfetivacao']??'9999-12-31');}}
  get movimentosFinanceirosFiltrados():Lancamento[]{return this.lancamentosOrdenados.filter(l=>this.filtroSituacaoMovimentos==='TODOS'||(this.filtroSituacaoMovimentos==='PAGOS'?!!l.dataEfetivacao:!l.dataEfetivacao));}
  filtrarMovimentos(situacao:'TODOS'|'PAGOS'|'A_PAGAR'):void{this.filtroSituacaoMovimentos=situacao;this.aplicarFiltroMovimentos();}
  aplicarFiltroMovimentos():void{const f=this.filtroMovimento,texto=f.texto.trim().toLocaleLowerCase(),fornecedor=f.fornecedor.trim().toLocaleLowerCase(),subcategoria=f.subcategoria.trim().toLocaleLowerCase();this.lancamentosFinanceiros=this.todosLancamentosFinanceiros.filter(l=>(this.filtroSituacaoMovimentos==='TODOS'||(this.filtroSituacaoMovimentos==='PAGOS'?!!l.dataEfetivacao:!l.dataEfetivacao))&&(!texto||l.descricao.toLocaleLowerCase().includes(texto))&&(!fornecedor||l.fornecedorCliente.toLocaleLowerCase().includes(fornecedor))&&(!subcategoria||(l.subcategoria??'').toLocaleLowerCase().includes(subcategoria))&&(f.tipo==='TODOS'||l.tipo===f.tipo)&&(!f.categoria||l.categoria===f.categoria)&&(!f.dataInicio||l.dataVencimento>=f.dataInicio)&&(!f.dataFim||l.dataVencimento<=f.dataFim)&&(f.valorMinimo===null||l.valor>=f.valorMinimo)&&(f.valorMaximo===null||l.valor<=f.valorMaximo));}
  get categoriasFiltroMovimentos():string[]{return [...new Set(this.todosLancamentosFinanceiros.map(l=>l.categoria))].sort();}
  limparFiltrosMovimentos():void{this.filtroMovimento={texto:'',fornecedor:'',tipo:'TODOS',categoria:'',subcategoria:'',dataInicio:'',dataFim:'',valorMinimo:null,valorMaximo:null};this.filtroSituacaoMovimentos='TODOS';this.aplicarFiltroMovimentos();}

  gerarExtrato():void {
    if(!this.filtroExtratoContaId||!this.filtroExtratoInicio||!this.filtroExtratoFim||this.filtroExtratoInicio>this.filtroExtratoFim){this.erroFinanceiro='Selecione a conta e informe um período válido para gerar o extrato.';return;}
    this.erroFinanceiro='';this.carregandoExtrato=true;this.extratoBancario=null;
    this.financeiroService.extrato(this.filtroExtratoContaId,this.filtroExtratoInicio,this.filtroExtratoFim).subscribe({next:d=>{this.extratoBancario=d;this.carregandoExtrato=false;},error:(e:HttpErrorResponse)=>{this.erroFinanceiro=this.mensagemApi(e,'Não foi possível gerar o extrato bancário.');this.carregandoExtrato=false;}});
  }

  gerarDre():void {
    if(!/^\d{4}-\d{2}$/.test(this.filtroDreMes)){this.erroFinanceiro='Informe um mês válido para gerar a DRE.';return;}
    this.filtroDreInicio=`${this.filtroDreMes}-01`;this.filtroDreFim=this.fimDoMes(this.filtroDreInicio);
    this.erroFinanceiro='';this.carregandoDre=true;this.dre=null;
    this.financeiroService.dre(this.filtroDreInicio,this.filtroDreFim).subscribe({next:d=>{this.dre=d;this.carregandoDre=false;},error:(e:HttpErrorResponse)=>{this.erroFinanceiro=this.mensagemApi(e,'Não foi possível gerar a DRE.');this.carregandoDre=false;}});
  }
  gerarDreAnalise():void{if(!/^\d{4}-\d{2}$/.test(this.filtroDreMes)){this.erroFinanceiro='Informe um mês válido.';return;}this.erroFinanceiro='';this.carregandoDreAnalise=true;this.financeiroService.dreAnalise(this.filtroDreMes).subscribe({next:d=>{this.dreAnalise=d;this.carregandoDreAnalise=false;setTimeout(()=>document.getElementById('dre-analise')?.scrollIntoView({behavior:'smooth',block:'start'}));},error:(e:HttpErrorResponse)=>{this.erroFinanceiro=this.mensagemApi(e,'Não foi possível gerar a análise vertical/horizontal.');this.carregandoDreAnalise=false;}});}
  categoriasDreAnalise(grupo:'RECEITA'|'DESPESA'):string[]{return[...new Set((this.dreAnalise?.dados??[]).filter(d=>d.grupo===grupo).map(d=>d.categoria))].sort();}
  celulaDreAnalise(grupo:'RECEITA'|'DESPESA',categoria:string,mes:string){return this.dreAnalise?.dados.find(d=>d.grupo===grupo&&d.categoria===categoria&&d.mes===mes)??null;}

  salvarConta():void {
    this.erroFinanceiro='';this.mensagemFinanceiro='';
    if(this.formularioConta.invalid){this.formularioConta.markAllAsTouched();this.erroFinanceiro='Não foi possível salvar a conta. Preencha: Nome da conta e Banco.';return;}
    const requisicao=this.editandoContaId?this.financeiroService.atualizarConta(this.editandoContaId,this.formularioConta.getRawValue()):this.financeiroService.criarConta(this.formularioConta.getRawValue());
    requisicao.subscribe({next:()=>{this.mensagemFinanceiro=this.editandoContaId?'Conta bancária alterada com sucesso.':'Conta bancária salva com sucesso.';this.cancelarEdicaoConta(false);this.carregarFinanceiro();},error:(e:HttpErrorResponse)=>this.erroFinanceiro=this.mensagemApi(e,'Não foi possível salvar a conta.')});
  }

  editarConta(conta:ContaBancaria):void{this.editandoContaId=conta.id;this.erroFinanceiro='';this.mensagemFinanceiro='';this.formularioConta.setValue({nome:conta.nome,banco:conta.banco,agencia:conta.agencia??'',conta:conta.conta??'',saldoInicial:conta.saldoInicial});document.getElementById('financeiro-contas')?.scrollIntoView({behavior:'smooth',block:'start'});}
  cancelarEdicaoConta(limparMensagens=true):void{this.editandoContaId=null;this.formularioConta.reset({nome:'',banco:'',agencia:'',conta:'',saldoInicial:0});if(limparMensagens){this.erroFinanceiro='';this.mensagemFinanceiro='';}}

  salvarLancamento():void {
    this.erroFinanceiro='';this.mensagemFinanceiro='';this.tentouSalvarLancamento=true;
    const descricaoObrigatoria=this.formularioLancamento.controls.tipo.value!=='COMPRA_GADO'&&!this.formularioLancamento.controls.descricao.value?.trim();
    if(descricaoObrigatoria)this.formularioLancamento.controls.descricao.setErrors({required:true});
    if(this.formularioLancamento.invalid||descricaoObrigatoria){
      this.formularioLancamento.markAllAsTouched();const p:string[]=[];const c=this.formularioLancamento.controls;
      if(c.contaBancariaId.invalid)p.push('Conta bancária');if(c.tipo.invalid)p.push('Tipo');if(c.categoria.invalid)p.push('Categoria');if(descricaoObrigatoria)p.push('Descrição');if(c.fornecedorCliente.invalid)p.push('Fornecedor ou cliente');if(c.valor.invalid)p.push('Valor total maior que zero');if(c.dataLancamento.invalid)p.push('Data de emissão');if(c.dataVencimento.invalid)p.push('Data de vencimento');if(c.recorrente.value&&c.quantidadeParcelas.invalid)p.push('Quantidade de meses entre 1 e 120');
      this.erroFinanceiro=`Não foi possível ${this.editandoLancamentoId?'salvar as alterações':'salvar o lançamento'}. Preencha os campos destacados: ${p.join(', ')}.`;
      setTimeout(()=>{const campo=document.querySelector('#formulario-lancamento input.ng-invalid,#formulario-lancamento select.ng-invalid,#formulario-lancamento textarea.ng-invalid') as HTMLElement|null;campo?.scrollIntoView({behavior:'smooth',block:'center'});campo?.focus();});return;
    }
    if(this.formularioLancamento.controls.tipo.value==='ENTRADA'&&!this.formularioLancamento.controls.areaId.value){this.erroFinanceiro='Não foi possível salvar a receita. A área é obrigatória para venda de gado e demais receitas.';return;}
    const emissao=this.formularioLancamento.controls.dataLancamento.value,efetivacao=this.formularioLancamento.controls.dataEfetivacao.value;if(emissao&&efetivacao&&efetivacao<emissao){this.erroFinanceiro='A data de pagamento ou recebimento não pode ser menor que a data de emissão.';return;}
    const estavaEditando=!!this.editandoLancamentoId,registrandoPagamento=estavaEditando&&!!this.formularioLancamento.controls.dataEfetivacao.value;
    const requisicao=this.editandoLancamentoId?this.financeiroService.atualizarLancamento(this.editandoLancamentoId,this.formularioLancamento.getRawValue()):this.financeiroService.criarLancamento(this.formularioLancamento.getRawValue());
    const meses=this.formularioLancamento.controls.recorrente.value?Number(this.formularioLancamento.controls.quantidadeParcelas.value):1;
    requisicao.subscribe({next:()=>{this.mensagemFinanceiro=registrandoPagamento?'Pagamento registrado e lançamento baixado com sucesso.':estavaEditando?'Lançamento atualizado com sucesso.':meses>1?`Despesa programada por ${meses} meses. As ocorrências futuras ficaram sem data de pagamento.`:'Lançamento financeiro salvo com sucesso.';this.tentouSalvarLancamento=false;this.cancelarEdicaoLancamento(false);this.carregarFinanceiro();setTimeout(()=>document.querySelector('.finance-feedback')?.scrollIntoView({behavior:'smooth',block:'center'}));},error:(e:HttpErrorResponse)=>{this.erroFinanceiro=this.mensagemApi(e,'Não foi possível salvar o lançamento.');setTimeout(()=>document.querySelector('.finance-feedback')?.scrollIntoView({behavior:'smooth',block:'center'}));}});
  }

  visualizarLancamento(l:Lancamento):void{this.lancamentoVisualizadoId=this.lancamentoVisualizadoId===l.id?null:l.id;}
  editarLancamento(l:Lancamento):void{this.editandoLancamentoId=l.id;this.tentouSalvarLancamento=false;this.erroFinanceiro='';this.mensagemFinanceiro='';this.formularioLancamento.setValue({contaBancariaId:l.contaBancariaId,tipo:l.tipo,categoria:l.categoria,subcategoria:l.subcategoria??'',descricao:l.descricao,fornecedorCliente:l.fornecedorCliente,valor:l.valor,dataLancamento:l.dataLancamento,dataVencimento:l.dataVencimento,dataEfetivacao:l.dataEfetivacao??'',recorrente:false,quantidadeParcelas:1,areaId:l.areaId,pastoId:l.pastoId});setTimeout(()=>this.formularioLancamento.controls.categoria.setValue(l.categoria));const campo=document.getElementById('data-efetivacao-lancamento') as HTMLInputElement|null;campo?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>campo?.focus(),350);}
  cancelarEdicaoLancamento(limparMensagens=true):void{this.editandoLancamentoId=null;this.formularioLancamento.reset({contaBancariaId:null,tipo:'SAIDA',categoria:'',subcategoria:'',descricao:'',fornecedorCliente:'',valor:null,dataLancamento:this.dataLocalHoje(),dataVencimento:'',dataEfetivacao:'',recorrente:false,quantidadeParcelas:1,areaId:null,pastoId:null});if(limparMensagens){this.erroFinanceiro='';this.mensagemFinanceiro='';}}
  carregarTravaFinanceira():void{this.financeiroService.trava().subscribe({next:t=>{this.travaFinanceiraAtual=t.dataTrava;this.dataTravaFinanceira=t.dataTrava??'';},error:(e:HttpErrorResponse)=>this.erroFinanceiro=this.mensagemApi(e,'Não foi possível carregar a trava financeira.')});}
  salvarTravaFinanceira():void{if(!this.dataTravaFinanceira){this.erroFinanceiro='Informe a data da trava.';return;}this.salvandoTrava=true;this.erroFinanceiro='';this.financeiroService.salvarTrava(this.dataTravaFinanceira).subscribe({next:t=>{this.travaFinanceiraAtual=t.dataTrava;this.mensagemFinanceiro=`Período travado até ${this.dataTravaFinanceira}.`;this.salvandoTrava=false;},error:(e:HttpErrorResponse)=>{this.erroFinanceiro=this.mensagemApi(e,'Não foi possível salvar a trava.');this.salvandoTrava=false;}});}
  excluirLancamento(l:Lancamento):void{if(!confirm(`Deseja realmente excluir o lançamento "${l.descricao}"?`))return;this.erroFinanceiro='';this.mensagemFinanceiro='';this.financeiroService.excluirLancamento(l.id).subscribe({next:()=>{if(this.editandoLancamentoId===l.id)this.cancelarEdicaoLancamento(false);if(this.lancamentoVisualizadoId===l.id)this.lancamentoVisualizadoId=null;this.mensagemFinanceiro='Lançamento excluído com sucesso.';this.carregarFinanceiro();},error:(e:HttpErrorResponse)=>this.erroFinanceiro=this.mensagemApi(e,'Não foi possível excluir o lançamento.')});}

  get saldoTotal():number{return this.contasBancarias.reduce((t,c)=>t+c.saldo,0);}
  get saldoTotalConsolidado():number{return this.saldoTotal+this.totalPendenteReceber-this.totalPendentePagar;}
  get totalPendenteReceber():number{return this.titulosFinanceiros.filter(t=>t.tipo==='RECEBER').reduce((s,t)=>s+t.valor,0)+this.todosLancamentosFinanceiros.filter(l=>l.tipo==='ENTRADA'&&!l.dataEfetivacao).reduce((s,l)=>s+l.valor,0);}
  get totalPendentePagar():number{return this.titulosFinanceiros.filter(t=>t.tipo==='PAGAR').reduce((s,t)=>s+t.valor,0)+this.todosLancamentosFinanceiros.filter(l=>l.tipo!=='ENTRADA'&&!l.dataEfetivacao).reduce((s,l)=>s+l.valor,0);}
  get totalPastos():number{return new Set(this.areas.flatMap(area=>area.pastos.map(pasto=>pasto.id))).size;}
  percentualOcupacaoPasto(pasto:Pasto):number{return pasto.capacidade?Math.min(100,(pasto.totalAnimais/pasto.capacidade)*100):0;}
  get pastosAreaLancamento() {
    return this.areas.find(area => area.id === this.formularioLancamento.controls.areaId.value)?.pastos ?? [];
  }
  get titulosFluxoFiltrados():TituloFinanceiro[]{return this.titulosFinanceiros.filter(t=>(!this.periodoFluxoInicio||t.dataVencimento>=this.periodoFluxoInicio)&&(!this.periodoFluxoFim||t.dataVencimento<=this.periodoFluxoFim));}
  get lancamentosFluxoFiltrados():Lancamento[]{return this.todosLancamentosFinanceiros.filter(l=>!l.dataEfetivacao&&l.dataVencimento&&(!this.periodoFluxoInicio||l.dataVencimento>=this.periodoFluxoInicio)&&(!this.periodoFluxoFim||l.dataVencimento<=this.periodoFluxoFim));}
  get totalReceber():number{return this.titulosFluxoFiltrados.filter(t=>t.tipo==='RECEBER').reduce((s,t)=>s+t.valor,0)+this.lancamentosFluxoFiltrados.filter(l=>l.tipo==='ENTRADA').reduce((s,l)=>s+l.valor,0);}
  get totalPagar():number{return this.titulosFluxoFiltrados.filter(t=>t.tipo==='PAGAR').reduce((s,t)=>s+t.valor,0)+this.lancamentosFluxoFiltrados.filter(l=>l.tipo!=='ENTRADA').reduce((s,l)=>s+l.valor,0);}
  get saldoProjetado():number{return this.saldoTotal+this.totalReceber-this.totalPagar;}
  get fluxoCaixaDiario():{data:string;receber:number;pagar:number;saldo:number}[]{
    const dias=new Map<string,{data:string;receber:number;pagar:number;saldo:number}>();
    if(this.periodoFluxoInicio&&this.periodoFluxoFim){const cursor=new Date(`${this.periodoFluxoInicio}T12:00:00`);const fim=new Date(`${this.periodoFluxoFim}T12:00:00`);while(cursor<=fim){const data=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;dias.set(data,{data,receber:0,pagar:0,saldo:0});cursor.setDate(cursor.getDate()+1);}}
    for(const titulo of this.titulosFluxoFiltrados){const dia=dias.get(titulo.dataVencimento)??{data:titulo.dataVencimento,receber:0,pagar:0,saldo:0};if(titulo.tipo==='RECEBER')dia.receber+=titulo.valor;else dia.pagar+=titulo.valor;dia.saldo=dia.receber-dia.pagar;dias.set(titulo.dataVencimento,dia);}
    for(const lancamento of this.lancamentosFluxoFiltrados){const dia=dias.get(lancamento.dataVencimento)??{data:lancamento.dataVencimento,receber:0,pagar:0,saldo:0};if(lancamento.tipo==='ENTRADA')dia.receber+=lancamento.valor;else dia.pagar+=lancamento.valor;dias.set(lancamento.dataVencimento,dia);}
    const resultado=[...dias.values()].sort((a,b)=>a.data.localeCompare(b.data));let saldoAcumulado=this.saldoTotal;
    for(const dia of resultado){saldoAcumulado+=dia.receber-dia.pagar;dia.saldo=saldoAcumulado;}
    return resultado;
  }
  get contasDoPeriodo():{id:string;tipo:string;dataVencimento:string;nome:string;valor:number;entrada:boolean}[]{
    const titulos=this.titulosFluxoFiltrados.map(t=>({id:`t-${t.id}`,tipo:t.tipo==='RECEBER'?'Receita':'Despesa',dataVencimento:t.dataVencimento,nome:t.fornecedor,valor:t.valor,entrada:t.tipo==='RECEBER'}));
    const lancamentos=this.lancamentosFluxoFiltrados.map(l=>({id:`l-${l.id}`,tipo:l.tipo==='ENTRADA'?'Receita':l.tipo==='COMPRA_GADO'?'Compra de gado':'Despesa',dataVencimento:l.dataVencimento,nome:l.fornecedorCliente||l.descricao,valor:l.valor,entrada:l.tipo==='ENTRADA'}));
    return [...titulos,...lancamentos].sort((a,b)=>a.dataVencimento.localeCompare(b.dataVencimento));
  }
  get contasAnterioresPeriodo(){const inicio=this.periodoFluxoInicio;const titulos=this.titulosFinanceiros.filter(t=>!!inicio&&t.dataVencimento<inicio).map(t=>({id:`ta-${t.id}`,tipo:t.tipo==='RECEBER'?'Receita':'Despesa',dataVencimento:t.dataVencimento,nome:t.fornecedor,valor:t.valor,entrada:t.tipo==='RECEBER'}));const lancamentos=this.todosLancamentosFinanceiros.filter(l=>!l.dataEfetivacao&&!!inicio&&l.dataVencimento<inicio).map(l=>({id:`la-${l.id}`,tipo:l.tipo==='ENTRADA'?'Receita':l.tipo==='COMPRA_GADO'?'Compra de gado':'Despesa',dataVencimento:l.dataVencimento,nome:l.fornecedorCliente||l.descricao,valor:l.valor,entrada:l.tipo==='ENTRADA'}));return[...titulos,...lancamentos].sort((a,b)=>a.dataVencimento.localeCompare(b.dataVencimento));}
  get totalAnteriorReceber():number{return this.contasAnterioresPeriodo.filter(c=>c.entrada).reduce((s,c)=>s+c.valor,0);}
  get totalAnteriorPagar():number{return this.contasAnterioresPeriodo.filter(c=>!c.entrada).reduce((s,c)=>s+c.valor,0);}
  get totalInvestimentos():number{return this.custosLocalizacao.reduce((s,c)=>s+c.custo,0);}
  definirFimDoMes():void{if(this.filtroFluxoInicio)this.filtroFluxoFim=this.fimPeriodoPadrao(this.filtroFluxoInicio);}
  consultarPeriodoFluxo():void{if(!this.filtroFluxoInicio||!this.filtroFluxoFim){this.erroFinanceiro='Informe a data inicial e a data final do período.';return;}if(this.filtroFluxoInicio>this.filtroFluxoFim){this.erroFinanceiro='A data inicial não pode ser posterior à data final.';return;}this.erroFinanceiro='';this.periodoFluxoInicio=this.filtroFluxoInicio;this.periodoFluxoFim=this.filtroFluxoFim;}
  limparPeriodoFluxo():void{this.filtroFluxoInicio=this.dataLocalHoje();this.filtroFluxoFim=this.fimPeriodoPadrao(this.filtroFluxoInicio);this.consultarPeriodoFluxo();}

  private dataLocalHoje():string{const hoje=new Date();return `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;}
  private fimDoMes(data:string):string{const [ano,mes]=data.split('-').map(Number);const ultimo=new Date(ano,mes,0).getDate();return `${ano}-${String(mes).padStart(2,'0')}-${String(ultimo).padStart(2,'0')}`;}
  private fimPeriodoPadrao(data:string):string{const hoje=this.dataLocalHoje();if(data.slice(0,7)!==hoje.slice(0,7))return this.fimDoMes(data);const [ano,mes,dia]=data.split('-').map(Number);const fim=new Date(ano,mes-1,dia+15);return `${fim.getFullYear()}-${String(fim.getMonth()+1).padStart(2,'0')}-${String(fim.getDate()).padStart(2,'0')}`;}

  salvarTitulo():void {
    this.erroFinanceiro='';this.mensagemFinanceiro='';
    if(this.formularioTitulo.invalid){this.formularioTitulo.markAllAsTouched();this.erroFinanceiro='Não foi possível salvar. Informe: Tipo, Fornecedor, Data de vencimento e Valor maior que zero.';return;}
    this.financeiroService.criarTitulo(this.formularioTitulo.getRawValue()).subscribe({next:()=>{this.mensagemFinanceiro='Conta do fluxo de caixa salva com sucesso.';this.formularioTitulo.reset({tipo:'PAGAR',fornecedor:'',dataVencimento:'',valor:null});this.carregarFinanceiro();},error:(e:HttpErrorResponse)=>this.erroFinanceiro=this.mensagemApi(e,'Não foi possível salvar a conta do fluxo de caixa.')});
  }

  analisarAnimaisCusto(custo: CustoLocalizacao): void {
    const chave = `${custo.areaId}-${custo.pastoId ?? 'area'}`;
    if (this.localizacaoFinanceiraAberta === chave) { this.localizacaoFinanceiraAberta = ''; this.animaisCusto = []; return; }
    this.localizacaoFinanceiraAberta = chave;
    this.service.listarPorArea(custo.areaId).subscribe({
      next: (animais) => this.animaisCusto = custo.pastoId ? animais.filter(a => a.pastoId === custo.pastoId) : animais,
      error: (e: HttpErrorResponse) => this.erro = this.mensagemApi(e, 'Não foi possível carregar os animais da localização.')
    });
  }

  carregarGrafico(): void {
    this.relatorioService.aquisicoesVendas().subscribe({ next: (dados) => this.graficoAquisicoesVendas = dados });
  }

  get maiorValorGrafico(): number {
    return Math.max(1, ...this.graficoAquisicoesVendas.flatMap((item) => [item.aquisicoes, item.vendas]));
  }

  alturaBarra(valor: number): number { return valor ? Math.max(5, (valor / this.maiorValorGrafico) * 100) : 0; }

  mesLabel(mes: string): string {
    const [ano, numeroMes] = mes.split('-');
    return `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Number(numeroMes) - 1]}/${ano.slice(2)}`;
  }

  gerarRelatorios(): void {
    this.relatorioService.consolidado(this.filtroRelatorio.areaId).subscribe({ next: (dados) => this.consolidado = dados, error: () => this.erro = 'Não foi possível gerar o relatório consolidado.' });
    this.relatorioService.historico(this.filtroRelatorio).subscribe({ next: (dados) => this.historico = dados, error: () => this.erro = 'Não foi possível gerar o histórico por pasto.' });
  }

  gerarControleAnimais():void{
    if(!this.filtroControleInicio||!this.filtroControleFim||this.filtroControleInicio>this.filtroControleFim){this.erroControle='Informe um período válido.';return;}
    this.erroControle='';this.carregandoControle=true;
    this.relatorioService.controleAnimais(this.filtroControleInicio,this.filtroControleFim).subscribe({next:d=>{this.controleAnimais=d;this.carregandoControle=false;},error:(e:HttpErrorResponse)=>{this.erroControle=this.mensagemApi(e,'Não foi possível gerar o controle de animais.');this.carregandoControle=false;}});
  }

  resumoFaixasControle(faixas:Record<string,number>):string{return ['0 a 12 meses','13 a 24 meses','25 a 36 meses','37 a 48 meses','Acima de 48 meses','Idade não informada'].filter(f=>faixas[f]).map(f=>`${f}: ${faixas[f]}`).join(' · ')||'Nenhum';}

  abrirRelatorioAnimais(): void {
    this.paginaAtiva = 'relatorio-animais';
    this.filtroStatusAnimaisRelatorio='ATIVO';
    this.relatorioAnimaisVisivel = true;
    this.listar();
    this.fecharMenus();
    setTimeout(() => document.getElementById('relatorio-animais')?.scrollIntoView({ behavior: 'smooth' }));
  }

  ocultarRelatorioAnimais(): void { this.relatorioAnimaisVisivel = false; }

  abrirPagina(pagina: typeof this.paginaAtiva): void {
    this.paginaAtiva = pagina;
    this.erro = '';
    this.mensagem = '';
    this.relatorioAnimaisVisivel = pagina === 'relatorio-animais';
    if(pagina==='relatorio-animais')this.filtroStatusAnimaisRelatorio='ATIVO';
    this.atualizarTudo();
    if(pagina==='produtor-usuarios')this.carregarUsuariosProdutor();
    if(pagina==='financeiro-trava')this.carregarTravaFinanceira();
    if (pagina === 'financeiro-extrato') {
      if (!this.filtroExtratoContaId && this.contasBancarias.length) this.filtroExtratoContaId = this.contasBancarias[0].id;
    }
    this.fecharMenus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private fecharMenus(): void {
    document.querySelectorAll<HTMLDetailsElement>('.nav-menu[open]').forEach((menu) => menu.removeAttribute('open'));
  }

  get totalConsolidado(): number { return this.consolidado.reduce((total, item) => total + item.total, 0); }

  get totalEstoqueInscricoes(): number { return this.animais.filter((animal) => animal.status === 'ATIVO').length; }

  get estoqueTodasInscricoes(): { femeas: number; machos: number; total: number; faixas: { faixa: string; femeas: number; machos: number; total: number }[] } {
    const animais = this.animais.filter((animal) => animal.status === 'ATIVO');
    const ordem = ['0 a 12 meses', '13 a 24 meses', '25 a 36 meses', '37 a 48 meses', 'Acima de 48 meses', 'Idade não informada'];
    const faixas = ordem.map((faixa) => {
      const animaisFaixa = animais.filter((animal) => (this.faixaIdadeAnimal(animal) || 'Idade não informada') === faixa);
      const femeas = animaisFaixa.filter((animal) => animal.sexo === 'F').length;
      const machos = animaisFaixa.filter((animal) => animal.sexo === 'M').length;
      return { faixa, femeas, machos, total: femeas + machos };
    }).filter((faixa) => faixa.total > 0);
    const femeas = animais.filter((animal) => animal.sexo === 'F').length;
    const machos = animais.filter((animal) => animal.sexo === 'M').length;
    return { femeas, machos, total: femeas + machos, faixas };
  }

  get estoquePorInscricao(): { areaId: number; areaNome: string; inscricao: string; femeas: number; machos: number; total: number; faixas: { faixa: string; femeas: number; machos: number; total: number }[] }[] {
    const ordem = ['0 a 12 meses', '13 a 24 meses', '25 a 36 meses', '37 a 48 meses', 'Acima de 48 meses', 'Idade não informada'];
    return this.areas.map((area) => {
      const animais = this.animais.filter((animal) => animal.status === 'ATIVO' && animal.areaId === area.id);
      const faixas = ordem.map((faixa) => {
        const animaisFaixa = animais.filter((animal) => (this.faixaIdadeAnimal(animal) || 'Idade não informada') === faixa);
        const femeas = animaisFaixa.filter((animal) => animal.sexo === 'F').length;
        const machos = animaisFaixa.filter((animal) => animal.sexo === 'M').length;
        return { faixa, femeas, machos, total: femeas + machos };
      });
      const femeas = animais.filter((animal) => animal.sexo === 'F').length;
      const machos = animais.filter((animal) => animal.sexo === 'M').length;
      return { areaId: area.id, areaNome: area.nome, inscricao: area.inscricao, femeas, machos, total: femeas + machos, faixas: faixas.filter((faixa) => faixa.total > 0) };
    }).filter((estoque) => estoque.total > 0);
  }

  get consolidadoPorPasto(): ConsolidadoPasto[] {
    const pastos = new Map<number, ConsolidadoPasto>();
    for (const item of this.consolidado) {
      const atual = pastos.get(item.pastoId);
      if (atual) {
        atual.total += item.total;
        atual.femeas += item.femeas;
        atual.machos += item.machos;
        atual.ativos += item.ativos;
        atual.vendidos += item.vendidos;
        atual.mortos += item.mortos;
        atual.pesoTotal += item.pesoTotal;
      } else {
        pastos.set(item.pastoId, { ...item });
      }
    }
    return [...pastos.values()].filter((pasto) => pasto.total > 0);
  }

  visualizarAnimaisArea(areaId: number): void {
    if (this.areaExpandidaId === areaId) {
      this.areaExpandidaId = null;
      this.animaisArea = [];
      return;
    }
    this.areaExpandidaId = areaId;
    this.animaisArea = [];
    this.carregandoAnimaisArea = true;
    this.service.listarPorArea(areaId).subscribe({
      next: (animais) => { this.animaisArea = animais; this.carregandoAnimaisArea = false; },
      error: (e: HttpErrorResponse) => { this.erro = this.mensagemApi(e, 'Não foi possível carregar os animais da área.'); this.carregandoAnimaisArea = false; }
    });
  }

  visualizarAnimaisPasto(pasto: ConsolidadoPasto): void {
    const chave=String(pasto.pastoId);
    if (this.pastoRelatorioExpandidoId === chave) {
      this.pastoRelatorioExpandidoId = null;
      this.animaisPastoRelatorio = [];
      return;
    }
    this.pastoRelatorioExpandidoId = chave;
    this.animaisPastoRelatorio = this.animais.filter((animal) => animal.pastoId === pasto.pastoId && animal.status === 'ATIVO' && (!this.filtroRelatorio.areaId || animal.areaId === this.filtroRelatorio.areaId));
    this.carregandoAnimaisPastoRelatorio = false;
  }

  get machosPastoRelatorio(): number { return this.animaisPastoRelatorio.filter((animal) => animal.sexo === 'M').length; }
  get femeasPastoRelatorio(): number { return this.animaisPastoRelatorio.filter((animal) => animal.sexo === 'F').length; }

  resumoIdadePasto(sexo: Sexo): { faixa: string; total: number }[] {
    const ordem = ['0 a 12 meses', '13 a 24 meses', '25 a 36 meses', '37 a 48 meses', 'Acima de 48 meses', 'Idade não informada'];
    const totais = new Map<string, number>();
    for (const animal of this.animaisPastoRelatorio.filter((item) => item.sexo === sexo)) {
      const faixa = this.faixaIdadeAnimal(animal) || 'Idade não informada';
      totais.set(faixa, (totais.get(faixa) ?? 0) + 1);
    }
    return ordem.filter((faixa) => totais.has(faixa)).map((faixa) => ({ faixa, total: totais.get(faixa)! }));
  }

  resumoIdadePastoTabela(pastoId: number, sexo: Sexo): { faixa: string; total: number }[] {
    const ordem = ['0 a 12 meses', '13 a 24 meses', '25 a 36 meses', '37 a 48 meses', 'Acima de 48 meses', 'Idade não informada'];
    const totais = new Map<string, number>();
    for (const animal of this.animais.filter((item) => item.pastoId === pastoId && item.status === 'ATIVO' && item.sexo === sexo && (!this.filtroRelatorio.areaId || item.areaId === this.filtroRelatorio.areaId))) {
      const faixa = this.faixaIdadeAnimal(animal) || 'Idade não informada';
      totais.set(faixa, (totais.get(faixa) ?? 0) + 1);
    }
    return ordem.filter((faixa) => totais.has(faixa)).map((faixa) => ({ faixa, total: totais.get(faixa)! }));
  }

  alternarHistorico(): void { this.historicoVisivel = !this.historicoVisivel; }

  listarAreas(): void {
    this.localizacaoService.listarAreas().subscribe({ next: (areas) => this.areas = areas, error: () => this.erro = 'Não foi possível carregar as áreas e os pastos.' });
  }

  listarPastos(): void {
    this.localizacaoService.listarCatalogoPastos().subscribe({next:pastos=>this.catalogoPastos=pastos,error:()=>this.catalogoPastos=[]});
    this.localizacaoService.listarPastos().subscribe({
      next: (pastos) => this.pastosDisponiveis = pastos,
      error: () => {
        this.pastosDisponiveis = [];
        this.erro = 'NÃ£o foi possÃ­vel carregar os pastos para seleÃ§Ã£o.';
      }
    });
  }

  cadastrarNomePasto():void{const nome=this.novoNomePasto.trim();if(!nome){this.erro='Informe o nome do pasto.';return;}this.salvandoNomePasto=true;this.erro='';this.localizacaoService.cadastrarNomePasto(nome).subscribe({next:()=>{this.novoNomePasto='';this.salvandoNomePasto=false;this.listarPastos();},error:(e:HttpErrorResponse)=>{this.erro=this.mensagemApi(e,'Não foi possível cadastrar o nome do pasto.');this.salvandoNomePasto=false;}});}

  salvarArea(): void {
    if (this.formularioArea.invalid) {
      this.formularioArea.markAllAsTouched();
      this.erro = 'Não foi possível salvar a área. Preencha os campos obrigatórios: Nome da área e Inscrição.';
      return;
    }
    this.erro = '';
    const area = this.formularioArea.getRawValue();
    const requisicao = this.editandoAreaId
      ? this.localizacaoService.atualizarArea(this.editandoAreaId, area)
      : this.localizacaoService.criarArea(area);
    requisicao.subscribe({
      next: () => { this.cancelarEdicaoArea(); this.listarAreas(); this.gerarRelatorios(); },
      error: (e: HttpErrorResponse) => this.erro = this.mensagemApi(e, 'Não foi possível salvar a área.')
    });
  }

  editarArea(area: Area): void {
    this.editandoAreaId = area.id;
    this.formularioArea.setValue({ nome: area.nome, inscricao: area.inscricao });
    document.getElementById('formulario-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  cancelarEdicaoArea(): void {
    this.editandoAreaId = null;
    this.formularioArea.reset({ nome: '', inscricao: '' });
  }

  salvarPasto(): void {
    if (this.formularioPasto.invalid) {
      this.formularioPasto.markAllAsTouched();
      this.erro = 'Não foi possível salvar o pasto. Selecione a Área/inscrição, informe o Nome e verifique a Capacidade.';
      return;
    }
    this.erro = '';
    const valor = this.formularioPasto.getRawValue();
    const pasto = { areaIds: (valor.areaIds ?? []).map(Number), nome: valor.nome ?? '', capacidade: valor.capacidade };
    const requisicao = this.editandoPastoId ? this.localizacaoService.atualizarPasto(this.editandoPastoId, pasto) : this.localizacaoService.criarPasto(pasto);
    requisicao.subscribe({
      next: () => { this.cancelarEdicaoPasto(); this.listarAreas(); this.listarPastos(); this.gerarRelatorios(); },
      error: (e: HttpErrorResponse) => this.erro = this.mensagemApi(e, 'Não foi possível salvar o pasto.')
    });
  }

  editarPasto(pasto: Pasto, _areaId: number): void {
    this.editandoPastoId = pasto.id;
    this.erro = '';
    const areaIds=this.pastosDisponiveis.filter(item=>item.id===pasto.id).map(item=>item.areaId!).filter((id,index,todos)=>todos.indexOf(id)===index);
    this.formularioPasto.setValue({ areaIds, nome: pasto.nome, capacidade: pasto.capacidade });
    document.getElementById('formulario-pasto')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  cancelarEdicaoPasto(): void {
    this.editandoPastoId = null;
    this.formularioPasto.reset({ areaIds: [], nome: '', capacidade: null });
  }

  excluirPasto(pasto: Pasto): void {
    if (!confirm(`Excluir o pasto "${pasto.nome}"? Esta ação não poderá ser desfeita.`)) return;
    this.erro = '';
    this.localizacaoService.excluirPasto(pasto.id).subscribe({
      next: () => {
        if (this.editandoPastoId === pasto.id) this.cancelarEdicaoPasto();
        this.listarAreas();
        this.listarPastos();
        this.gerarRelatorios();
      },
      error: (e: HttpErrorResponse) => this.erro = this.mensagemApi(e, 'Não foi possível excluir o pasto.')
    });
  }

  atualizarConfirmacaoFinanceira(): void {
    const pendente = this.formularioLote.controls.financeiroPendente.value !== false;
    const obrigatorio = pendente ? [] : [Validators.required];
    this.formularioLote.controls.dataVencimentoCompra.setValidators(obrigatorio);
    this.formularioLote.controls.contaPagamentoId.setValidators(obrigatorio);
    this.formularioLote.controls.valorCompra.setValidators(pendente ? [Validators.min(0.01), Validators.max(9999999999.99)] : [Validators.required, Validators.min(0.01), Validators.max(9999999999.99)]);
    this.formularioLote.controls.dataVencimentoCompra.updateValueAndValidity({ emitEvent: false });
    this.formularioLote.controls.contaPagamentoId.updateValueAndValidity({ emitEvent: false });
    this.formularioLote.controls.valorCompra.updateValueAndValidity({ emitEvent: false });
  }

  async carregarNotaFiscal(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const arquivos = Array.from(input.files ?? []);
    if (!arquivos.length) return;
    this.erro = '';
    this.mensagemLote = '';
    this.lendoNotaFiscal = true;
    let reconhecidas = 0;
    let revisar = 0;
    let duplicadas = 0;
    let mesmaPessoa = 0;
    let salvas = 0;
    for (const [indice, arquivo] of arquivos.entries()) {
      this.progressoLeituraNota = `Preparando nota ${indice + 1} de ${arquivos.length}...`;
      this.arquivoNotaFiscal = arquivo.name;
      this.rascunhoLoteAtualId = null;
      this.formularioLote.reset({ quantidade: null, prefixoBrinco: '', numeroInicial: 1, nome: '', especie: 'Bovino', raca: '', sexo: 'F', dataNascimento: '', dataCompra: '', financeiroPendente: true, dataVencimentoCompra: '', contaPagamentoId: null, valorCompra: null, fornecedor: '', numeroNotaFiscal: '', pesoMedio: null, status: 'ATIVO', valorVenda: null, contaBancariaId: null, pastoId: null, observacoes: '' });
      this.atualizarConfirmacaoFinanceira();
      try {
        const texto = arquivo.type === 'application/pdf' || arquivo.name.toLowerCase().endsWith('.pdf')
          ? await this.lerPdfNota(arquivo)
          : await this.lerImagemNota(arquivo);
        if (!texto.trim()) throw new Error('TEXTO_NAO_ENCONTRADO');
        if (this.notaComMesmaPessoa(texto)) throw new Error('NOTA_MESMA_PESSOA');
        const itensDaNota=this.aplicarDadosDaNota(texto);
        const numeroNota = String(this.formularioLote.controls.numeroNotaFiscal.value ?? '').replace(/\D/g, '');
        const fornecedor = String(this.formularioLote.controls.fornecedor.value ?? '').trim().toLocaleLowerCase();
        const notaJaCadastrada = numeroNota && this.animais.some((animal) =>
          String(animal.numeroNotaFiscal ?? '').replace(/\D/g, '') === numeroNota
          && String(animal.fornecedor ?? '').trim().toLocaleLowerCase() === fornecedor
        );
        const notaJaPendente = numeroNota && this.rascunhosLote.some((rascunho) =>
          String(rascunho.dados['numeroNotaFiscal'] ?? '').replace(/\D/g, '') === numeroNota
          && String(rascunho.dados['fornecedor'] ?? '').trim().toLocaleLowerCase() === fornecedor
        );
        if (notaJaCadastrada || notaJaPendente) {
          duplicadas++;
          continue;
        }
        reconhecidas++;
        for(const [indiceItem,item] of itensDaNota.entries()){
          this.rascunhoLoteAtualId=null;
          this.formularioLote.patchValue(item);
          this.salvarRascunhoLote(true);
          salvas++;
        }
        if(itensDaNota.length)continue;
      } catch (erroNota) {
        if (erroNota instanceof Error && erroNota.message === 'NOTA_MESMA_PESSOA') { mesmaPessoa++; continue; }
        revisar++;
      }
      this.salvarRascunhoLote(true);
      salvas++;
    }
    this.lendoNotaFiscal = false;
    this.progressoLeituraNota = '';
    input.value = '';
    this.mensagemLote = `${salvas} nota(s) salva(s) nas entradas pendentes; ${reconhecidas} reconhecida(s) automaticamente.`;
    if (revisar) this.erro = `${revisar} nota(s) não tiveram todos os dados reconhecidos e precisam de preenchimento manual.`;
    if (duplicadas) this.erro = `${duplicadas} nota(s) ignorada(s) porque já foram lançadas ou estão nas entradas pendentes.${revisar ? ` ${revisar} precisam de preenchimento manual.` : ''}`;
    if (mesmaPessoa) this.erro = `${mesmaPessoa} nota(s) não importada(s): remetente e destinatário são a mesma pessoa.${this.erro ? ` ${this.erro}` : ''}`;
  }

  private notaComMesmaPessoa(texto:string):boolean{const documentos=[...texto.matchAll(/\b(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/g)].map(m=>m[0].replace(/\D/g,''));return documentos.length>=2&&documentos[0]===documentos[1];}
  private areaProprietariaDaNota(texto:string,...nomes:(string|undefined)[]):Area|undefined{const normalizar=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase(),conteudo=normalizar(texto);const porInscricao=this.areas.find(a=>{const inscricao=normalizar(a.inscricao??'');return inscricao.length>=3&&conteudo.includes(inscricao);});if(porInscricao)return porInscricao;const chaves=nomes.filter((n):n is string=>!!n).map(normalizar).filter(n=>n.length>=3);return this.areas.find(a=>{const nome=normalizar(a.nome);return nome.length>=3&&(conteudo.includes(nome)||chaves.some(chave=>nome.includes(chave)||chave.includes(nome)));});}

  async carregarNotaFiscalVenda(evento:Event):Promise<void>{const input=evento.target as HTMLInputElement,arquivos=Array.from(input.files??[]);if(!arquivos.length)return;this.erroVenda='';this.mensagemVenda='';this.lendoNotaFiscalVenda=true;let salvas=0,ignoradas=0;for(const arquivo of arquivos){this.arquivoNotaFiscalVenda=arquivo.name;this.cancelarEdicaoVenda(false);this.arquivoNotaFiscalVenda=arquivo.name;try{const texto=arquivo.type==='application/pdf'||arquivo.name.toLowerCase().endsWith('.pdf')?await this.lerPdfNota(arquivo):await this.lerImagemNota(arquivo);if(!texto.trim())throw new Error('TEXTO_NAO_ENCONTRADO');if(this.notaComMesmaPessoa(texto))throw new Error('NOTA_MESMA_PESSOA');this.aplicarDadosNotaVenda(texto);const id=`venda-${Date.now()}-${Math.random().toString(36).slice(2)}`;this.rascunhosVenda.push({id,arquivo:arquivo.name,criadoEm:new Date().toISOString(),quantidade:this.quantidadeNotaVenda,vendedor:this.vendedorNotaVenda,dados:this.formularioVenda.getRawValue()});salvas++;}catch(erroNota){ignoradas++;if(erroNota instanceof Error&&erroNota.message==='NOTA_MESMA_PESSOA')this.erroVenda='Uma ou mais notas não foram importadas porque remetente e destinatário são a mesma pessoa.';}}this.salvarRascunhosVenda();this.lendoNotaFiscalVenda=false;this.progressoNotaVenda='';input.value='';this.mensagemVenda=`${salvas} nota(s) de venda salva(s) para completar.${ignoradas?` ${ignoradas} ignorada(s).`:''}`;if(salvas)this.carregarRascunhoVenda(this.rascunhosVenda.at(-1)!.id);}
  private salvarRascunhosVenda():void{localStorage.setItem('agrosys-vendas-pendentes',JSON.stringify(this.rascunhosVenda));}
  carregarRascunhoVenda(id:string):void{const r=this.rascunhosVenda.find(item=>item.id===id);if(!r)return;this.cancelarEdicaoVenda(false);this.rascunhoVendaAtualId=id;this.arquivoNotaFiscalVenda=r.arquivo;this.quantidadeNotaVenda=r.quantidade;this.vendedorNotaVenda=r.vendedor;this.formularioVenda.patchValue(r.dados);document.getElementById('formulario-venda')?.scrollIntoView({behavior:'smooth'});}
  excluirRascunhoVenda(id:string):void{this.rascunhosVenda=this.rascunhosVenda.filter(r=>r.id!==id);if(this.rascunhoVendaAtualId===id)this.cancelarEdicaoVenda(false);this.salvarRascunhosVenda();}

  private aplicarDadosNotaVenda(textoOriginal:string):void{
    const texto=textoOriginal.replace(/\s+/g,' ').trim(),capturar=(...rs:RegExp[])=>rs.map(r=>texto.match(r)?.[1]?.trim()).find(Boolean);
    const numeroNota=capturar(/NFA-e\s+(\d{2,3}(?:\.\d{3}){2})/i,/(?:N[º°o.]?|número)\s*(?:da\s*)?(?:NF-e|nota fiscal)?\s*[:#-]?\s*(\d{3,12})/i,/NF-e\s*(?:n[º°o.]?)?\s*[:#-]?\s*(\d{3,12})/i);
    const dataTexto=capturar(/(?:data (?:de )?emiss[aã]o|emitida em)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{2,4})/i);
    const vendedor=capturar(/(?:emitente|vendedor|nome\s*\/\s*nome empresarial)\s*[:\-]?\s*(.{3,150}?)(?=\s+(?:CNPJ|CPF|endere[cç]o|inscri[cç][aã]o|IE)\b)/i,/NFA-e\s+\d{2,3}(?:\.\d{3}){2}\s+VENDA\s+(.{3,150}?)\s+\d{3}\.\d{3}\.\d{3}-\d{2}/i);
    const pessoasCpf=[...texto.matchAll(/([A-ZÀ-Ý][A-ZÀ-Ý\s.'-]{3,120}?)\s+(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/g)],pessoaDestinataria=pessoasCpf.length>1?pessoasCpf[1]:pessoasCpf[0];
    const nomeDestinatario=pessoaDestinataria?.[1]?.replace(/^.*?\b(?:VENDA|COMPRA)\s+/i,'').replace(/\s{2,}/g,' ').trim();
    const comprador=capturar(/(?:destinat[aá]rio|comprador|cliente)\s*[:\-]?\s*(.{3,150}?)(?=\s+(?:CNPJ|CPF|endere[cç]o|inscri[cç][aã]o|IE)\b)/i)??nomeDestinatario;
    const documento=pessoaDestinataria?.[2]??capturar(/(?:destinat[aá]rio|comprador|cliente)[\s\S]{0,180}?(?:CNPJ|CPF)\s*[:\-]?\s*([\d.\/-]{11,18})/i);
    const totalRotulo=capturar(/(?:valor total (?:da (?:nota|nf-e)|dos produtos)|v\.?\s*total da nf|total da nota|valor a receber|valor total)\s*[:\-]?\s*R?\$?\s*([\d.,]+(?:,|\.)\d{2})/i,/\bTOTAL\s+R\$\s*([\d.,]+(?:,|\.)\d{2})/i);
    const valoresReais=[...texto.matchAll(/R\$\s*([\d.]+,\d{2})/gi)].map(m=>m[1]);
    const numeroMoeda=(v:string)=>Number(v.includes(',')?v.replace(/\./g,'').replace(',','.'):v),total=totalRotulo??valoresReais.sort((a,b)=>numeroMoeda(b)-numeroMoeda(a))[0];
    const quantidadesItens=[...texto.matchAll(/\b(?:CB|CAB|UN(?:ID)?\.?)\s+(\d{1,4}(?:[.,]\d{1,4})?)/gi)].map(m=>Number(m[1].replace(',','.')));
    const quantidadeItens=quantidadesItens.length?String(quantidadesItens.reduce((s,q)=>s+q,0)):undefined;
    const quantidade=quantidadeItens??capturar(/(?:quantidade|qtd\.?|qtde\.?)\s*(?:de animais|cabe[cç]as|cab)?\s*[:\-]?\s*(\d{1,4})/i,/\b(\d{1,4})\s*(?:cabe[cç]as|animais|bovinos)\b/i);
    const endereco=capturar(/(?:endere[cç]o do destinat[aá]rio|endere[cç]o do comprador)\s*[:\-]?\s*(.{5,255}?)(?=\s+(?:munic[ií]pio|cidade|CEP|telefone|fone)\b)/i);
    const trechoDestinatario=documento?texto.slice(Math.max(0,texto.indexOf(documento)+documento.length),texto.indexOf(documento)+documento.length+350):'';
    const telefoneDestinatario=trechoDestinatario.match(/\b(?:\d{2}\s*)?\d{8,9}\b/)?.[0]?.replace(/\s/g,'');
    const dataIso=(v?:string)=>{if(!v)return null;const[d,m,a]=v.split('/');return`${a.length===2?'20'+a:a}-${m}-${d}`;},numero=(v?:string)=>v?Number(v.includes(',')?v.replace(/\./g,'').replace(',','.'):v):null;
    this.vendedorNotaVenda=vendedor??'';this.quantidadeNotaVenda=quantidade?Math.trunc(Number(quantidade)):null;
    {const area=this.areaProprietariaDaNota(texto,vendedor);if(area)this.formularioVenda.controls.areaId.setValue(area.id);}
    const dataEmissao=dataIso(dataTexto)??this.formularioVenda.controls.dataEmissao.value;
    this.formularioVenda.patchValue({numeroNotaFiscal:numeroNota??this.formularioVenda.controls.numeroNotaFiscal.value,compradorNome:comprador??this.formularioVenda.controls.compradorNome.value,compradorDocumento:documento??this.formularioVenda.controls.compradorDocumento.value,compradorTelefone:telefoneDestinatario??this.formularioVenda.controls.compradorTelefone.value,compradorEndereco:endereco??this.formularioVenda.controls.compradorEndereco.value,dataEmissao,valorTotal:numero(total)??this.formularioVenda.controls.valorTotal.value,dataPrimeiroVencimento:dataEmissao});
  }

  private async lerImagemNota(arquivo: File | HTMLCanvasElement): Promise<string> {
    const imagem = arquivo instanceof File ? await this.otimizarImagemNota(arquivo) : arquivo;
    const worker = await this.obterWorkerNotaFiscal();
    return (await worker.recognize(imagem)).data.text;
  }

  private obterWorkerNotaFiscal(): Promise<Worker> {
    if (!this.workerNotaFiscal) {
      this.progressoLeituraNota = 'Preparando leitor de notas (somente na primeira vez)...';
      this.workerNotaFiscal = createWorker('por', 1, { logger: (evento) => {
        if (evento.status === 'recognizing text') {
          this.progressoLeituraNota = `Reconhecendo dados: ${Math.round(evento.progress * 100)}%`;
        }
      }}).catch((erro) => { this.workerNotaFiscal = null; throw erro; });
    }
    return this.workerNotaFiscal;
  }

  private async otimizarImagemNota(arquivo: File): Promise<HTMLCanvasElement> {
    this.progressoLeituraNota = 'Otimizando imagem...';
    const bitmap = await createImageBitmap(arquivo);
    const limite = 1800;
    const escala = Math.min(1, limite / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * escala));
    canvas.height = Math.max(1, Math.round(bitmap.height * escala));
    const contexto = canvas.getContext('2d', { alpha: false });
    if (!contexto) { bitmap.close(); throw new Error('CANVAS_INDISPONIVEL'); }
    contexto.fillStyle = '#fff'; contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.filter = 'grayscale(1) contrast(1.15)';
    contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas;
  }

  private async lerPdfNota(arquivo: File): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: await arquivo.arrayBuffer() }).promise;
    let texto = '';
    const paginas = Math.min(pdf.numPages, 4);
    for (let numero = 1; numero <= paginas; numero++) {
      this.progressoLeituraNota = `Lendo página ${numero} de ${paginas}...`;
      const pagina = await pdf.getPage(numero);
      const conteudo = await pagina.getTextContent();
      texto += `\n${conteudo.items.map((item) => 'str' in item ? item.str : '').join(' ')}`;
    }
    if (texto.replace(/\s/g, '').length > 80) return texto;
    const pagina = await pdf.getPage(1);
    const viewportInicial = pagina.getViewport({ scale: 1 });
    const escala = Math.min(2, 1800 / Math.max(viewportInicial.width, viewportInicial.height));
    const viewport = pagina.getViewport({ scale: escala });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width; canvas.height = viewport.height;
    const contexto = canvas.getContext('2d');
    if (!contexto) return texto;
    await pagina.render({ canvasContext: contexto, viewport }).promise;
    return `${texto}\n${await this.lerImagemNota(canvas)}`;
  }

  private aplicarDadosDaNota(textoOriginal: string): Record<string,unknown>[] {
    const linhas = textoOriginal.split(/\r?\n/).map((linha) => linha.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const texto = linhas.join(' ');
    const capturar = (...expressoes: RegExp[]) => expressoes.map((r) => texto.match(r)?.[1]?.trim()).find(Boolean);
    const numeroNota = capturar(/NFA-e\s+(\d{2,3}(?:\.\d{3}){2})/i, /N[º°o.:\s]+(\d{2,3}(?:\.\d{3}){2})/i, /(?:N[º°o.]?|número)\s*(?:da\s*)?(?:NF-e|nota fiscal)?\s*[:#-]?\s*(\d{3,12})/i, /NF-e\s*(?:n[º°o.]?)?\s*[:#-]?\s*(\d{3,12})/i);
    const fornecedor = capturar(
      /NFA-e\s+\d{2,3}(?:\.\d{3}){2}\s+(?:VENDA|COMPRA|TRANSFER[ÊE]NCIA|REMESSA)\s+(.{3,150}?)\s+\d{3}\.\d{3}\.\d{3}-\d{2}/i,
      /nome\s*\/\s*nome empresarial\s*[:\-]?\s*(.{3,150}?)(?=\s+(?:CNPJ|CPF|IE|inscri(?:ç|c)[aã]o|endereço|nome fantasia)\b)/i,
      /(?:raz[aã]o social|emitente|fornecedor)\s*[:\-]?\s*(.{3,150}?)(?=\s+(?:CNPJ|CPF|IE|inscri|endereço|data)\b)/i
    );
    const dataTexto = capturar(/(?:data (?:de )?emiss[aã]o|data da nota(?: fiscal)?(?: de entrada)?|emitida em|entrada)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{2,4})/i) ?? texto.match(/\b\d{2}\/\d{2}\/\d{4}\b/)?.[0];
    const vencimentoTexto = capturar(/(?:data(?:s)? (?:de )?vencimento|vencimento(?:s)?|vence em)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{2,4})/i);
    const linhaItem = linhas.find((linha) => /\b(gado|bezerros?|bezerras?|bois?|bovinos?|vacas?|novilh[ao]s?|garrotes?|touros?|animais?)\b/i.test(linha));
    const itensNfa = [...texto.matchAll(/\b((?:GADO|BEZERROS?|BEZERRAS?|BOIS?|BOVINOS?|VACAS?|NOVILH[AO]S?|GARROTES?|TOUROS?|ANIMAIS?)[\p{L}\d /-]{2,100}?)\s+\d{1,3}\s+(?:CB|CAB|UN(?:ID)?\.?)\s+(\d{1,4}(?:[.,]\d{1,4})?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/giu)];
    const itemNfa = itensNfa[0];
    const descricaoItem = itemNfa?.[1]?.trim() ?? linhaItem?.match(/\b(gado|bezerros?|bezerras?|bois?|bovinos?|vacas?|novilh[ao]s?|garrotes?|touros?|animais?)\b/i)?.[1];
    const inicioItem = linhaItem && descricaoItem ? linhaItem.toLocaleLowerCase().indexOf(descricaoItem.toLocaleLowerCase()) : -1;
    // Em PDFs o extrator pode devolver a página toda em uma única linha. Limitar o trecho evita capturar impostos/totais posteriores.
    const trechoItem = linhaItem && inicioItem >= 0 ? linhaItem.slice(inicioItem, inicioItem + 300) : linhaItem;
    const valoresItem = trechoItem?.match(/(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2,4}|(?:R\$\s*)?\d+,\d{2,4}/g) ?? [];
    const totalItens = itensNfa.length ? itensNfa.reduce((total, item) => total + Number(item[3].replace(/\./g, '').replace(',', '.')), 0) : null;
    const quantidadeItens = itensNfa.length ? itensNfa.reduce((total, item) => total + Number(item[2].replace(',', '.')), 0) : null;
    const totalTexto = totalItens !== null ? totalItens.toFixed(2).replace('.', ',') : (valoresItem.length ? valoresItem.at(-1)!.replace(/R\$\s*/i, '') : capturar(/(?:valor total (?:da nota|dos produtos)|total da nota)\s*R?\$?\s*([\d.]+,\d{2})/i, /valor a pagar\s*R?\$?\s*([\d.]+,\d{2})/i));
    const quantidadeTexto = quantidadeItens !== null ? String(quantidadeItens) : trechoItem?.match(/\b(\d{1,4}(?:[.,]0+)?)\s*(?:CAB|CB|UN(?:ID)?\.?|CABE(?:Ç|C)AS?)\b/i)?.[1]
      ?? trechoItem?.match(/\b(?:QTD\.?|QTDE\.?|QUANTIDADE)\s*[:\-]?\s*(\d{1,4}(?:[.,]0+)?)/i)?.[1]
      ?? capturar(/(?:quantidade|qtd\.?|qtde\.?)\s*(?:de animais|cabeças|cab)?\s*[:\-]?\s*(\d{1,4})/i, /(\d{1,4})\s*(?:cabeças|animais|bovinos)\b/i);
    const pesoTexto = capturar(/(?:peso (?:médio|unitário))\s*[:\-]?\s*([\d.]+,?\d*)\s*kg/i);
    const numero = (valor?: string) => valor ? Number(valor.replace(/\./g, '').replace(',', '.')) : null;
    const dataIso = (valor?: string): string | null => {
      if (!valor) return null;
      const [dia, mes, anoCurto] = valor.split('/');
      return `${anoCurto.length === 2 ? `20${anoCurto}` : anoCurto}-${mes}-${dia}`;
    };
    const nascimentoMedio = (dataReferencia: string, descricao?: string): string | null => {
      if (!descricao) return null;
      const faixa = descricao.match(/\b(\d{1,2})\s*(?:\/|-|A)\s*(\d{1,2})\s*M(?:ESES?)?\b/i)
        ?? descricao.match(/\bDE\s+(\d{1,2})\s+A\s+(\d{1,2})\s+MESES?\b/i);
      let mesesMedios: number;
      if (faixa) {
        const minimo = Number(faixa[1]);
        const maximo = Number(faixa[2]);
        if (minimo < 0 || maximo < minimo || maximo > 120) return null;
        mesesMedios = (minimo + maximo) / 2;
      } else {
        // Estimativas zootécnicas usadas somente quando a nota não informa uma faixa de idade.
        const idadeTipica = /\bBEZERR[AO]S?\b/i.test(descricao) ? 8
          : /\bGARROTES?\b/i.test(descricao) ? 18
          : /\bRECRIA\b/i.test(descricao) ? 9
          : /\bNOVILH[AO]S?\b/i.test(descricao) ? 24
          : /\bBOIS?\b/i.test(descricao) ? 30
          : /\bTOUROS?\b/i.test(descricao) ? 36
          : /\bVACAS?\b/i.test(descricao) ? 48
          : null;
        if (idadeTipica === null) return null;
        mesesMedios = idadeTipica;
      }
      const [ano, mes, dia] = dataReferencia.split('-').map(Number);
      const nascimento = new Date(Date.UTC(ano, mes - 1, dia));
      nascimento.setUTCMonth(nascimento.getUTCMonth() - Math.floor(mesesMedios));
      if (!Number.isInteger(mesesMedios)) nascimento.setUTCDate(nascimento.getUTCDate() - 15);
      return nascimento.toISOString().slice(0, 10);
    };
    const atualizacao: Record<string, unknown> = {};
    if (numeroNota) atualizacao['numeroNotaFiscal'] = numeroNota;
    if (fornecedor) {const nomeFornecedor=fornecedor.replace(/\s{2,}/g,' ').trim();atualizacao['fornecedor']=nomeFornecedor;const area=this.areaProprietariaDaNota(texto,nomeFornecedor);if(area)atualizacao['areaProprietarioId']=area.id;}
    else {const area=this.areaProprietariaDaNota(texto);if(area)atualizacao['areaProprietarioId']=area.id;}
    if (totalTexto) atualizacao['valorCompra'] = numero(totalTexto);
    if (quantidadeTexto && numero(quantidadeTexto)) atualizacao['quantidade'] = Math.trunc(numero(quantidadeTexto)!);
    if (pesoTexto) atualizacao['pesoMedio'] = numero(pesoTexto);
    const dataCompra = dataIso(dataTexto);
    if (dataCompra) {
      atualizacao['dataCompra'] = dataCompra;
      atualizacao['dataVencimentoCompra'] = dataIso(vencimentoTexto) ?? dataCompra;
      if (descricaoItem) atualizacao['prefixoBrinco'] = `${dataCompra.slice(8, 10)}${dataCompra.slice(5, 7)}${descricaoItem.charAt(0).toUpperCase()}`;
      const dataNascimento = nascimentoMedio(dataCompra, descricaoItem);
      if (dataNascimento) atualizacao['dataNascimento'] = dataNascimento;
      if (descricaoItem && /\b(BEZERRA|NOVILHA|VACA)S?\b/i.test(descricaoItem)) atualizacao['sexo'] = 'F';
      else if (descricaoItem && /\b(BEZERRO|GARROTE|BOI|TOURO)S?\b/i.test(descricaoItem)) atualizacao['sexo'] = 'M';
    }
    // Uma nota com valor e vencimento identificados deve gerar a obrigação financeira.
    // A conta permanece obrigatória antes da confirmação da entrada do lote.
    if (atualizacao['valorCompra'] && atualizacao['dataVencimentoCompra']) atualizacao['financeiroPendente'] = false;
    this.formularioLote.patchValue(atualizacao);
    this.atualizarConfirmacaoFinanceira();
    if(itensNfa.length<=1)return [];
    return itensNfa.map((item,indice)=>{
      const descricao=item[1].trim(),quantidade=Math.trunc(numero(item[2])??0),valor=numero(item[3]);
      const dados:Record<string,unknown>={...atualizacao,quantidade,valorCompra:valor,
        prefixoBrinco:`${String(atualizacao['prefixoBrinco']??'ITEM')}-I${indice+1}`};
      if(dataCompra){const nascimento=nascimentoMedio(dataCompra,descricao);dados['dataNascimento']=nascimento??'';}
      if(/\b(BEZERRA|NOVILHA|VACA)S?\b/i.test(descricao))dados['sexo']='F';
      else if(/\b(BEZERRO|GARROTE|BOI|TOURO)S?\b/i.test(descricao))dados['sexo']='M';
      return dados;
    });
  }

  imprimirRelatorioVendasDre():void{window.print();}
  gerarDemonstrativoVendas():void{this.erroDemonstrativo='';this.carregandoDemonstrativo=true;this.financeiroService.demonstrativoVendas(this.filtroDemonstrativoInicio,this.filtroDemonstrativoFim).subscribe({next:d=>{this.demonstrativoVendas=d;this.carregandoDemonstrativo=false;},error:(e:HttpErrorResponse)=>{this.erroDemonstrativo=this.mensagemApi(e,'Não foi possível gerar o demonstrativo de vendas.');this.carregandoDemonstrativo=false;}});}
  totalCompraAnimaisDre():number{return (this.dre?.animaisVendidos??[]).reduce((t,a)=>t+a.valorCompra,0);}
  totalVendaAnimaisDre():number{return (this.dre?.animaisVendidos??[]).reduce((t,a)=>t+a.valorVenda,0);}
  totalResultadoAnimaisDre():number{return (this.dre?.animaisVendidos??[]).reduce((t,a)=>t+a.resultado,0);}

  private carregarRascunhosLote(): void {
    try { this.rascunhosLote = JSON.parse(localStorage.getItem('agrosys-entradas-lote-pendentes') || '[]'); }
    catch { this.rascunhosLote = []; }
  }

  salvarRascunhoLote(automatico = false): void {
    const dados = this.formularioLote.getRawValue() as Record<string, string | number | boolean | null>;
    const id = this.rascunhoLoteAtualId ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const anterior = this.rascunhosLote.find((item) => item.id === id);
    const rascunho = { id, criadoEm: anterior?.criadoEm ?? new Date().toISOString(), arquivo: this.arquivoNotaFiscal || anterior?.arquivo || 'Preenchimento manual', dados };
    this.rascunhosLote = [rascunho, ...this.rascunhosLote.filter((item) => item.id !== id)];
    this.rascunhoLoteAtualId = id;
    localStorage.setItem('agrosys-entradas-lote-pendentes', JSON.stringify(this.rascunhosLote));
    if (!automatico) this.mensagemLote = 'Entrada em lote salva para preenchimento e confirmação posterior.';
  }

  adicionarItemNota(): void {
    const atual = this.formularioLote.getRawValue();
    this.salvarRascunhoLote(true);
    const prefixoBase = String(atual.prefixoBrinco || 'ITEM').replace(/-ITEM-?\d+$/i, '');
    const quantidadeItens = this.rascunhosLote.filter(r =>
      r.dados['numeroNotaFiscal'] === atual.numeroNotaFiscal && r.dados['fornecedor'] === atual.fornecedor
    ).length;
    this.rascunhoLoteAtualId = null;
    this.formularioLote.patchValue({
      quantidade: null, prefixoBrinco: `${prefixoBase}-ITEM-${quantidadeItens + 1}`, numeroInicial: 1,
      nome: '', raca: '', sexo: 'F', dataNascimento: '', pesoMedio: null,
      // A obrigação financeira pertence à nota inteira e não deve ser criada novamente em cada item.
      financeiroPendente: true, valorCompra: null, dataVencimentoCompra: '', contaPagamentoId: null,
      observacoes: ''
    });
    this.atualizarConfirmacaoFinanceira();
    this.mensagemLote = 'Novo item criado. Informe a quantidade, o sexo, a idade e os demais dados deste item.';
  }

  editarRascunhoLote(id: string): void {
    const rascunho = this.rascunhosLote.find((item) => item.id === id);
    if (!rascunho) return;
    this.rascunhoLoteAtualId = id; this.arquivoNotaFiscal = rascunho.arquivo;
    const d = rascunho.dados;
    const numero = (chave: string): number | null => d[chave] === null || d[chave] === '' || d[chave] === undefined ? null : Number(d[chave]);
    const texto = (chave: string, padrao = ''): string => typeof d[chave] === 'string' ? d[chave] as string : padrao;
    this.formularioLote.reset({
      quantidade: numero('quantidade'), prefixoBrinco: texto('prefixoBrinco'), numeroInicial: numero('numeroInicial') ?? 1,
      nome: texto('nome'), especie: texto('especie', 'Bovino'), raca: texto('raca'), sexo: d['sexo'] === 'M' ? 'M' : 'F',
      dataNascimento: texto('dataNascimento'), dataCompra: texto('dataCompra'), financeiroPendente: d['financeiroPendente'] !== false,
      dataVencimentoCompra: texto('dataVencimentoCompra'), contaPagamentoId: numero('contaPagamentoId'), valorCompra: numero('valorCompra'),
      fornecedor: texto('fornecedor'), numeroNotaFiscal: texto('numeroNotaFiscal'), pesoMedio: numero('pesoMedio'),
      status: d['status'] === 'VENDIDO' || d['status'] === 'MORTO' ? d['status'] : 'ATIVO',
      valorVenda: numero('valorVenda'), contaBancariaId: numero('contaBancariaId'), pastoId: numero('pastoId'), observacoes: texto('observacoes')
    });
    this.atualizarConfirmacaoFinanceira();
    this.formularioLote.markAllAsTouched();
    this.mensagemLote = 'Entrada pendente carregada. Complete os campos e clique em “Dar entrada no lote”.';
    document.getElementById('cadastro-lote')?.scrollIntoView({ behavior: 'smooth' });
  }

  excluirRascunhoLote(id: string, confirmar = true): void {
    if (confirmar && !confirm('Excluir esta entrada em lote pendente?')) return;
    this.rascunhosLote = this.rascunhosLote.filter((item) => item.id !== id);
    if (this.rascunhoLoteAtualId === id) this.rascunhoLoteAtualId = null;
    localStorage.setItem('agrosys-entradas-lote-pendentes', JSON.stringify(this.rascunhosLote));
  }

  salvarLote(): void {
    this.mensagemLote = '';
    if (this.formularioLote.invalid) {
      this.formularioLote.markAllAsTouched();
      this.salvarRascunhoLote(true);
      const pendentes: string[] = [];
      const c = this.formularioLote.controls;
      if (c.quantidade.invalid) pendentes.push('Quantidade (1 a 1.000)');
      if (c.prefixoBrinco.invalid) pendentes.push('Prefixo dos brincos');
      if (c.numeroInicial.invalid) pendentes.push('Número inicial');
      if (c.valorCompra.invalid) pendentes.push('Valor total da compra');
      if (c.dataVencimentoCompra.invalid) pendentes.push('Data de vencimento');
      if (c.contaPagamentoId.invalid) pendentes.push('Conta de pagamento');
      if (c.fornecedor.invalid) pendentes.push('Fornecedor');
      if (c.pesoMedio.invalid) pendentes.push('Peso médio maior que zero');
      if (c.especie.invalid) pendentes.push('Espécie');
      if (c.sexo.invalid) pendentes.push('Sexo');
      if (c.areaProprietarioId.invalid) pendentes.push('Inscrição do proprietário');
      if (c.pastoId.invalid) pendentes.push('Pasto de entrada');
      this.erro = `A entrada foi salva como pendente. Para cadastrar os animais, complete: ${pendentes.join(', ')}.`;
      return;
    }
    if (this.formularioLote.controls.status.value === 'VENDIDO' && (!this.formularioLote.controls.valorVenda.value || !this.formularioLote.controls.contaBancariaId.value)) {
      this.erro = 'Para cadastrar o lote como vendido, informe o valor da venda e a conta bancária de recebimento.';
      return;
    }
    this.erro = '';
    const valor = this.formularioLote.getRawValue();
    this.salvando = true;
    this.service.criarLote({
      quantidade: Number(valor.quantidade), prefixoBrinco: valor.prefixoBrinco?.trim() ?? '',
      numeroInicial: Number(valor.numeroInicial), especie: valor.especie ?? 'Bovino',
      nome: valor.nome?.trim() || null, raca: valor.raca?.trim() || null, sexo: valor.sexo ?? 'F', pesoMedio: Number(valor.pesoMedio),
      dataNascimento: valor.dataNascimento || null, dataCompra: valor.dataCompra || null,
      financeiroPendente: valor.financeiroPendente !== false,
      dataVencimentoCompra: valor.dataVencimentoCompra || null, contaPagamentoId: valor.contaPagamentoId,
      valorCompra: valor.valorCompra, fornecedor: valor.fornecedor?.trim() || null,
      numeroNotaFiscal: valor.numeroNotaFiscal?.trim() || null,
      status: valor.status ?? 'ATIVO', valorVenda: valor.valorVenda, contaBancariaId: valor.contaBancariaId,
      areaId: Number(valor.areaProprietarioId), pastoId: valor.pastoId, observacoes: valor.observacoes?.trim() || null
    }).subscribe({
        next: (resultado) => {
          this.mensagem = `${resultado.quantidade} animais cadastrados com sucesso.`;
          const prefixoAjustado = resultado.prefixoBrinco && resultado.prefixoBrinco !== valor.prefixoBrinco
            ? ` A letra do brinco foi alterada automaticamente de ${valor.prefixoBrinco} para ${resultado.prefixoBrinco}, pois já existia um brinco igual.`
            : '';
          this.mensagemLote = `Lote salvo com sucesso: ${resultado.quantidade} animais foram cadastrados.${prefixoAjustado}`;
        this.salvando = false;
        if (this.rascunhoLoteAtualId) this.excluirRascunhoLote(this.rascunhoLoteAtualId, false);
        this.formularioLote.reset({ quantidade: null, prefixoBrinco: '', numeroInicial: 1, nome: '', especie: 'Bovino', raca: '', sexo: 'F', dataNascimento: '', dataCompra: '', financeiroPendente: true, dataVencimentoCompra: '', contaPagamentoId: null, valorCompra: null, fornecedor: '', numeroNotaFiscal: '', pesoMedio: null, status: 'ATIVO', valorVenda: null, contaBancariaId: null, pastoId: null, observacoes: '' });
        this.arquivoNotaFiscal = ''; this.atualizarConfirmacaoFinanceira();
        this.listar(); this.listarAreas(); this.listarPastos(); this.gerarRelatorios(); this.carregarFinanceiro();
      },
      error: (e: HttpErrorResponse) => { this.erro = this.mensagemApi(e, 'Não foi possível cadastrar o lote.'); this.salvando = false; }
    });
  }

  get total(): number { return this.consolidado.length ? this.totalConsolidado : this.animais.filter(a=>a.status==='ATIVO').length; }
  get valorUnitarioLote(): number | null {
    const total = this.formularioLote.controls.valorCompra.value;
    const quantidade = this.formularioLote.controls.quantidade.value;
    return total && quantidade && quantidade > 0 ? total / quantidade : null;
  }
  get animaisTransferencia(): Animal[] {
    const origem=this.lerLocalTransferencia(this.localOrigemTransferencia);
    return this.animais.filter((animal) => animal.status === 'ATIVO' &&
      (!origem || (animal.pastoId === origem.pastoId && animal.areaId === origem.areaId)))
      .sort((a,b)=>a.sexo.localeCompare(b.sexo)||this.ordemFaixaEtaria(a)-this.ordemFaixaEtaria(b)||a.brinco.localeCompare(b.brinco));
  }
  get pastosDestinoTransferencia() {
    return this.pastosDisponiveis.filter((pasto) => this.chaveLocal(pasto) !== this.localOrigemTransferencia);
  }
  chaveLocal(pasto:Pasto):string{return `${pasto.areaId}:${pasto.id}`;}
  private lerLocalTransferencia(chave:string):{areaId:number;pastoId:number}|null{const[area,pasto]=chave.split(':').map(Number);return area&&pasto?{areaId:area,pastoId:pasto}:null;}
  private ordemFaixaEtaria(animal:Animal):number{const idade=this.idadeMesesAnimal(animal);return idade===null?99:Math.min(Math.floor(idade/12),4);}
  get todosAnimaisTransferenciaSelecionados(): boolean {
    return !!this.animaisTransferencia.length && this.animaisTransferencia.every((animal) =>
      !!animal.id && this.animaisSelecionadosTransferencia.has(animal.id));
  }

  alterarPastoOrigemTransferencia(): void {
    this.animaisSelecionadosTransferencia.clear();
    if (this.localDestinoTransferencia === this.localOrigemTransferencia) this.localDestinoTransferencia = '';
  }

  alternarAnimalTransferencia(animalId: number, selecionado: boolean): void {
    if (selecionado) this.animaisSelecionadosTransferencia.add(animalId);
    else this.animaisSelecionadosTransferencia.delete(animalId);
  }

  alternarTodosAnimaisTransferencia(selecionado: boolean): void {
    for (const animal of this.animaisTransferencia) {
      if (!animal.id) continue;
      if (selecionado) this.animaisSelecionadosTransferencia.add(animal.id);
      else this.animaisSelecionadosTransferencia.delete(animal.id);
    }
  }

  transferirAnimais(): void {
    const ids = [...this.animaisSelecionadosTransferencia];
    if (!ids.length) { this.erro = 'Selecione ao menos um animal para transferir.'; return; }
    const destino=this.lerLocalTransferencia(this.localDestinoTransferencia);
    if (!destino) { this.erro = 'Selecione a inscrição e o pasto de destino.'; return; }
    this.erro = '';
    this.mensagem = '';
    this.transferindo = true;
    this.service.transferir(ids, destino.areaId, destino.pastoId).subscribe({
      next: (resultado) => {
        this.mensagem = `${resultado.quantidade} animal(is) transferido(s) com sucesso.`;
        this.animaisSelecionadosTransferencia.clear();
        this.transferindo = false;
        this.listar();
        this.listarAreas();
        this.listarPastos();
        this.gerarRelatorios();
      },
      error: (e: HttpErrorResponse) => {
        this.erro = this.mensagemApi(e, 'Não foi possível transferir os animais.');
        this.transferindo = false;
      }
    });
  }
  get animaisSemPasto(): Animal[] { return this.animais.filter((animal) => !animal.pastoId); }
  get animaisRelatorioFiltrados():Animal[]{return this.animais.filter(a=>this.filtroStatusAnimaisRelatorio==='TODOS'||a.status===this.filtroStatusAnimaisRelatorio);}
  get pesoTotalAnimaisRelatorio():number{return this.animaisRelatorioFiltrados.reduce((t,a)=>t+Number(a.peso??0),0);}
  get valorTotalAnimaisRelatorio():number{return this.animaisRelatorioFiltrados.reduce((t,a)=>t+Number(a.valorCompra??0),0);}
  get femeas(): number { return this.consolidado.length ? this.consolidado.reduce((total,item)=>total+item.femeas,0) : this.animais.filter((a) => a.status==='ATIVO'&&a.sexo === 'F').length; }
  get machos(): number { return this.consolidado.length ? this.consolidado.reduce((total,item)=>total+item.machos,0) : this.animais.filter((a) => a.status==='ATIVO'&&a.sexo === 'M').length; }

  get gruposAnimais(): { chave: string; prefixo: string; animais: Animal[]; ehLote: boolean }[] {
    const grupos = new Map<string, { chave: string; prefixo: string; animais: Animal[]; ehLote: boolean }>();
    for (const animal of this.animais) {
      const prefixo = animal.brinco.match(/^(.*)-\d+$/)?.[1];
      const chave = prefixo ? `lote:${prefixo}|${animal.numeroNotaFiscal ?? ''}|${animal.dataCompra ?? ''}` : `animal:${animal.id}`;
      const existente = grupos.get(chave);
      if (existente) existente.animais.push(animal);
      else grupos.set(chave, { chave, prefixo: prefixo ?? animal.brinco, animais: [animal], ehLote: false });
    }
    return [...grupos.values()].map((grupo) => ({ ...grupo, ehLote: grupo.animais.length > 1 }));
  }

  alternarLote(chave: string): void {
    if (this.lotesAbertos.has(chave)) this.lotesAbertos.delete(chave);
    else this.lotesAbertos.add(chave);
  }

  valorTotalGrupo(animais: Animal[]): number | null {
    const valores = animais.map((animal) => animal.valorCompra).filter((valor): valor is number => valor !== null && valor !== undefined);
    return valores.length ? valores.reduce((total, valor) => total + valor, 0) : null;
  }

  listar(): void {
    this.carregando = true;
    this.erro = '';
    this.service.listar(this.busca).subscribe({
      next: (animais) => { this.animais = animais; this.carregando = false; },
      error: () => { this.erro = 'Não foi possível carregar os animais. Verifique se a API está ativa.'; this.carregando = false; }
    });
  }

  salvar(): void {
    this.tentouSalvar = true;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.erro = `Preencha os campos obrigatórios: ${this.camposObrigatoriosPendentes.join(', ')}.`;
      return;
    }
    if (this.formulario.controls.status.value === 'VENDIDO' && (!this.formulario.controls.valorVenda.value || !this.formulario.controls.contaBancariaId.value)) {
      this.erro = 'Para vender o animal, informe o valor da venda e a conta bancária de recebimento.';
      return;
    }
    this.salvando = true;
    this.erro = '';
    const valor = this.formulario.getRawValue();
    const animal: Animal = {
      ...valor,
      nome: valor.nome.trim() || null,
      raca: valor.raca.trim() || null,
      dataNascimento: valor.dataNascimento || null,
      dataCompra: valor.dataCompra || null,
      dataVencimentoCompra: valor.dataVencimentoCompra || null,
      contaPagamentoId: valor.contaPagamentoId,
      valorCompra: valor.valorCompra,
      fornecedor: valor.fornecedor.trim() || null,
      numeroNotaFiscal: valor.numeroNotaFiscal.trim() || null,
      peso: valor.peso,
      observacoes: valor.observacoes.trim() || null
    };
    const requisicao = this.editandoId
      ? this.service.atualizar(this.editandoId, animal)
      : this.service.criar(animal);
    requisicao.subscribe({
      next: () => {
        this.mensagem = this.editandoId ? 'Animal atualizado com sucesso.' : 'Animal cadastrado com sucesso.';
        this.salvando = false;
        this.cancelarEdicao();
        this.listar();
        this.listarAreas();
        this.listarPastos();
        this.gerarRelatorios();
        this.carregarGrafico();
        this.carregarFinanceiro();
        setTimeout(() => this.mensagem = '', 3500);
      },
      error: (e: HttpErrorResponse) => {
        this.erro = e.error?.mensagem ?? 'Não foi possível salvar o animal.';
        this.salvando = false;
      }
    });
  }

  editar(animal: Animal): void {
    this.editandoId = animal.id ?? null;
    this.formulario.controls.dataVencimentoCompra.clearValidators();
    this.formulario.controls.contaPagamentoId.clearValidators();
    this.formulario.controls.dataVencimentoCompra.updateValueAndValidity();
    this.formulario.controls.contaPagamentoId.updateValueAndValidity();
    this.formulario.setValue({
      brinco: animal.brinco,
      nome: animal.nome ?? '',
      especie: animal.especie,
      raca: animal.raca ?? '',
      sexo: animal.sexo,
      dataNascimento: animal.dataNascimento ?? '',
      dataCompra: animal.dataCompra ?? '',
      dataVencimentoCompra: '',
      contaPagamentoId: null,
      valorCompra: animal.valorCompra ?? null,
      fornecedor: animal.fornecedor ?? '',
      numeroNotaFiscal: animal.numeroNotaFiscal ?? '',
      peso: animal.peso,
      status: animal.status,
      areaId: animal.areaId ?? null,
      pastoId: animal.pastoId ?? null,
      valorVenda: animal.valorVenda ?? null,
      contaBancariaId: animal.contaBancariaId ?? null,
      observacoes: animal.observacoes ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  visualizarAnimal(animal: Animal): void {
    this.animalVisualizadoId = this.animalVisualizadoId === animal.id ? null : (animal.id ?? null);
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.formulario.controls.dataVencimentoCompra.setValidators(Validators.required);
    this.formulario.controls.contaPagamentoId.setValidators(Validators.required);
    this.tentouSalvar = false;
    this.erro = '';
    this.formulario.reset({
      brinco: '', nome: '', especie: 'Bovino', raca: '', sexo: 'F',
      dataNascimento: '', dataCompra: '', dataVencimentoCompra: '', contaPagamentoId: null, valorCompra: null, fornecedor: '', numeroNotaFiscal: '',
      peso: null, status: 'ATIVO', observacoes: ''
      , areaId: null, pastoId: null, valorVenda: null, contaBancariaId: null
    });
  }

  excluir(animal: Animal): void {
    if (!animal.id || !confirm(`Deseja realmente excluir o animal ${animal.nome || animal.brinco}? Esta ação não poderá ser desfeita.`)) return;
    this.erro = '';
    this.mensagem = '';
    this.service.excluir(animal.id).subscribe({
      next: () => {
        if (this.editandoId === animal.id) this.cancelarEdicao();
        if (this.animalVisualizadoId === animal.id) this.animalVisualizadoId = null;
        this.mensagem = 'Animal excluído com sucesso.';
        this.listar(); this.listarAreas(); this.listarPastos(); this.gerarRelatorios(); this.carregarGrafico(); this.carregarFinanceiro();
      },
      error: (e: HttpErrorResponse) => this.erro = this.mensagemApi(e, 'Não foi possível excluir o animal.')
    });
  }

  statusLabel(status: StatusAnimal): string {
    return { ATIVO: 'Ativo', VENDIDO: 'Vendido', MORTO: 'Morto' }[status];
  }

  private mensagemApi(erro: HttpErrorResponse, fallback: string): string {
    const mensagem = erro.error?.mensagem;
    const erros = erro.error?.erros as Record<string, string[] | undefined> | undefined;
    const detalhes = erros ? Object.values(erros).flat().filter(Boolean).join('; ') : '';
    return [mensagem || fallback, detalhes].filter(Boolean).join(' — ');
  }

  get camposObrigatoriosPendentes(): string[] {
    const campos: string[] = [];
    if (this.formulario.controls.brinco.invalid) campos.push('Brinco');
    if (this.formulario.controls.especie.invalid) campos.push('Espécie');
    if (this.formulario.controls.sexo.invalid) campos.push('Sexo');
    if (this.formulario.controls.status.invalid) campos.push('Status');
    if (this.formulario.controls.valorCompra.invalid) campos.push('Valor da compra');
    if (this.formulario.controls.dataVencimentoCompra.invalid) campos.push('Data de vencimento');
    if (this.formulario.controls.contaPagamentoId.invalid) campos.push('Conta de pagamento');
    if (this.formulario.controls.fornecedor.invalid) campos.push('Fornecedor');
    if (this.formulario.controls.pastoId.invalid) campos.push('Pasto');
    return campos;
  }

  get idadeMeses(): number | null {
    return this.calcularIdadeMeses(this.formulario.controls.dataNascimento.value);
  }

  get idadeMesesLote(): number | null {
    return this.calcularIdadeMeses(this.formularioLote.controls.dataNascimento.value);
  }

  get faixaIdade(): string { return this.faixaIdadeMeses(this.idadeMeses); }
  get faixaIdadeLote(): string { return this.faixaIdadeMeses(this.idadeMesesLote); }

  idadeMesesAnimal(animal: Animal): number | null {
    return this.calcularIdadeMeses(animal.dataNascimento);
  }

  faixaIdadeAnimal(animal: Animal): string { return this.faixaIdadeMeses(this.idadeMesesAnimal(animal)); }

  private faixaIdadeMeses(idade: number | null): string {
    if (idade === null) return '';
    if (idade <= 12) return '0 a 12 meses';
    if (idade <= 24) return '13 a 24 meses';
    if (idade <= 36) return '25 a 36 meses';
    if (idade <= 48) return '37 a 48 meses';
    return 'Acima de 48 meses';
  }

  private calcularIdadeMeses(dataNascimento: string | null | undefined): number | null {
    if (!dataNascimento) return null;
    const partes = dataNascimento.split('-').map(Number);
    if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) return null;
    const [ano, mes, dia] = partes as [number, number, number];
    const hoje = new Date();
    let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes);
    if (hoje.getDate() < dia) meses--;
    return Math.max(0, meses);
  }
}
