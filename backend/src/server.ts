import cors from 'cors';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import nodemailer from 'nodemailer';
import express, { NextFunction, Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import { ZodError } from 'zod';
import { animalSchema, loteAnimalSchema, transferenciaAnimaisSchema, AnimalInput } from './animal.schema.js';
import { areaSchema, pastoSchema } from './localizacao.schema.js';
import { pool } from './database.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',credentials:true }));
app.use(express.json());

const scrypt=promisify(crypto.scrypt);
const hashToken=(token:string)=>crypto.createHash('sha256').update(token).digest('hex');
const lerCookie=(req:Request,nome:string)=>String(req.headers.cookie??'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${nome}=`))?.slice(nome.length+1)??'';
const atributoCookieSeguro=process.env.NODE_ENV==='production'?'; Secure':'';
const gerarSenha=async(senha:string)=>{const salt=crypto.randomBytes(16).toString('hex'),hash=(await scrypt(senha,salt,64) as Buffer).toString('hex');return`${salt}:${hash}`;};
const conferirSenha=async(senha:string,armazenada:string)=>{const[salt,hash]=armazenada.split(':');if(!salt||!hash)return false;const calculada=await scrypt(senha,salt,64) as Buffer,esperada=Buffer.from(hash,'hex');return calculada.length===esperada.length&&crypto.timingSafeEqual(calculada,esperada);};
const enviarNovaSenha=async(destinatario:string,nome:string,novaSenha:string)=>{
  const porta=Number(process.env.SMTP_PORT??587);
  if(!process.env.SMTP_HOST||!process.env.SMTP_USER||!process.env.SMTP_PASS||!process.env.SMTP_FROM)throw new Error('SMTP_NAO_CONFIGURADO');
  const transporte=nodemailer.createTransport({host:process.env.SMTP_HOST,port:porta,secure:porta===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  await transporte.sendMail({from:process.env.SMTP_FROM,to:destinatario,subject:'AgroSys - nova senha de acesso',text:`OlÃ¡, ${nome}.\n\nSua nova senha temporÃ¡ria do AgroSys Ã©: ${novaSenha}\n\nSe vocÃª nÃ£o solicitou esta alteraÃ§Ã£o, contate o administrador.`});
};

app.post('/api/auth/login',async(req,res,next)=>{try{const login=String(req.body.login??'').trim(),senha=String(req.body.senha??'');const[usuarios]=await pool.query<RowDataPacket[]>(`SELECT u.id,u.nome,u.login,u.senha_hash,p.id AS produtorId,p.nome AS produtorNome,pu.perfil FROM usuarios u JOIN produtor_usuarios pu ON pu.usuario_id=u.id JOIN produtores p ON p.id=pu.produtor_id WHERE u.login=? AND u.ativo=TRUE AND p.ativo=TRUE ORDER BY pu.perfil='ADMIN' DESC LIMIT 1`,[login]);const usuario=usuarios[0];if(!usuario||!await conferirSenha(senha,String(usuario.senha_hash)))return res.status(401).json({mensagem:'Login ou senha inválidos'});const token=crypto.randomBytes(32).toString('hex');await pool.execute(`INSERT INTO sessoes(token_hash,usuario_id,produtor_id,expira_em) VALUES(?,?,?,DATE_ADD(NOW(),INTERVAL 12 HOUR))`,[hashToken(token),usuario.id,usuario.produtorId]);res.setHeader('Set-Cookie',`agrosys_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${atributoCookieSeguro}`);res.json({usuario:{id:Number(usuario.id),nome:usuario.nome,login:usuario.login},produtor:{id:Number(usuario.produtorId),nome:usuario.produtorNome},perfil:usuario.perfil});}catch(erro){next(erro);}});
app.post('/api/auth/esqueci-senha',async(req,res,next)=>{try{
  const login=String(req.body.login??'').trim();
  if(!login)return res.status(400).json({mensagem:'Informe o login para solicitar uma nova senha'});
  const[usuarios]=await pool.query<RowDataPacket[]>('SELECT id,nome,email FROM usuarios WHERE login=? AND ativo=TRUE LIMIT 1',[login]);const usuario=usuarios[0];
  if(!usuario)return res.json({mensagem:'Se o login estiver cadastrado, a nova senha serÃ¡ enviada ao e-mail vinculado.'});
  if(!usuario.email)return res.status(422).json({mensagem:'Este usuÃ¡rio ainda nÃ£o possui e-mail cadastrado. Solicite ao administrador a atualizaÃ§Ã£o do cadastro.'});
  const novaSenha=`Agro-${crypto.randomBytes(6).toString('base64url')}`;const novoHash=await gerarSenha(novaSenha);
  await enviarNovaSenha(String(usuario.email),String(usuario.nome),novaSenha);
  await pool.execute('UPDATE usuarios SET senha_hash=? WHERE id=?',[novoHash,usuario.id]);
  await pool.execute('DELETE FROM sessoes WHERE usuario_id=?',[usuario.id]);
  res.json({mensagem:'Nova senha enviada ao e-mail cadastrado.'});
}catch(erro){next(erro);}});
app.post('/api/auth/logout',async(req,res,next)=>{try{const token=lerCookie(req,'agrosys_session');if(token)await pool.execute('DELETE FROM sessoes WHERE token_hash=?',[hashToken(token)]);res.setHeader('Set-Cookie',`agrosys_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${atributoCookieSeguro}`);res.status(204).end();}catch(erro){next(erro);}});

app.use('/api',async(req,res,next)=>{if(req.path==='/auth/login'||req.path==='/saude')return next();try{const token=lerCookie(req,'agrosys_session');if(!token)return res.status(401).json({mensagem:'Sessão não autenticada'});const[sessoes]=await pool.query<RowDataPacket[]>(`SELECT s.usuario_id AS usuarioId,s.produtor_id AS produtorId,u.nome AS usuarioNome,u.login,p.nome AS produtorNome,pu.perfil FROM sessoes s JOIN usuarios u ON u.id=s.usuario_id JOIN produtores p ON p.id=s.produtor_id JOIN produtor_usuarios pu ON pu.usuario_id=s.usuario_id AND pu.produtor_id=s.produtor_id WHERE s.token_hash=? AND s.expira_em>NOW() AND u.ativo=TRUE AND p.ativo=TRUE`,[hashToken(token)]);if(!sessoes[0])return res.status(401).json({mensagem:'Sessão expirada'});res.locals.sessao=sessoes[0];next();}catch(erro){next(erro);}});

app.get('/api/auth/sessao',(req,res)=>{const s=res.locals.sessao;res.json({usuario:{id:Number(s.usuarioId),nome:s.usuarioNome,login:s.login},produtor:{id:Number(s.produtorId),nome:s.produtorNome},perfil:s.perfil});});
app.get('/api/produtor/usuarios',async(_req,res,next)=>{try{const s=res.locals.sessao;if(s.perfil!=='ADMIN')return res.status(403).json({mensagem:'Somente o administrador pode gerenciar acessos'});const[linhas]=await pool.query<RowDataPacket[]>(`SELECT u.id,u.nome,u.login,u.email,u.ativo,pu.perfil FROM produtor_usuarios pu JOIN usuarios u ON u.id=pu.usuario_id WHERE pu.produtor_id=? ORDER BY pu.perfil='ADMIN' DESC,u.nome`,[s.produtorId]);res.json(linhas.map(l=>({...l,id:Number(l.id),ativo:Boolean(l.ativo)})));}catch(erro){next(erro);}});
app.post('/api/produtor/usuarios',async(req,res,next)=>{try{const s=res.locals.sessao;if(s.perfil!=='ADMIN')return res.status(403).json({mensagem:'Somente o administrador pode gerenciar acessos'});const nome=String(req.body.nome??'').trim(),login=String(req.body.login??'').trim(),email=String(req.body.email??'').trim(),senha=String(req.body.senha??'');if(!nome||!login||!/^\S+@\S+\.\S+$/.test(email)||senha.length<6)return res.status(400).json({mensagem:'Informe nome, login, e-mail válido e uma senha com pelo menos 6 caracteres'});const conexao=await pool.getConnection();try{await conexao.beginTransaction();const[resultado]=await conexao.execute<ResultSetHeader>('INSERT INTO usuarios(nome,login,email,senha_hash) VALUES(?,?,?,?)',[nome,login,email,await gerarSenha(senha)]);await conexao.execute(`INSERT INTO produtor_usuarios(produtor_id,usuario_id,perfil) VALUES(?,?,'USUARIO')`,[s.produtorId,resultado.insertId]);await conexao.commit();res.status(201).json({id:resultado.insertId});}catch(erro){await conexao.rollback();throw erro;}finally{conexao.release();}}catch(erro){next(erro);}});

const campos = `a.id, a.brinco, a.nome, a.especie, a.raca, a.sexo,
  DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS dataNascimento,
  DATE_FORMAT(data_compra, '%Y-%m-%d') AS dataCompra,
  CAST(a.valor_compra AS DOUBLE) AS valorCompra, a.fornecedor, a.numero_nota_fiscal AS numeroNotaFiscal,
  CAST(a.peso AS DOUBLE) AS peso, a.status, a.observacoes, a.pasto_id AS pastoId,
  p.nome AS pastoNome, ar.id AS areaId, ar.nome AS areaNome, ar.inscricao,
  a.criado_em AS criadoEm, a.atualizado_em AS atualizadoEm`;

const joins = `FROM animais a
  LEFT JOIN pastos p ON p.id = a.pasto_id
  LEFT JOIN areas ar ON ar.id = a.area_id`;

app.get('/api/saude', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (erro) { next(erro); }
});

app.get('/api/agenda', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT id,titulo,descricao,
      DATE_FORMAT(data_evento,'%Y-%m-%dT%H:%i') AS dataEvento,prioridade,recorrencia,
      antecedencia_minutos AS antecedenciaMinutos,status
      FROM eventos_agenda ORDER BY status='CONCLUIDO',data_evento,id`);
    res.json(linhas.map((linha) => ({ ...linha, id: Number(linha.id), antecedenciaMinutos: Number(linha.antecedenciaMinutos) })));
  } catch (erro) { next(erro); }
});

app.post('/api/agenda', async (req, res, next) => {
  try {
    const { titulo, descricao, dataEvento, prioridade, recorrencia, antecedenciaMinutos } = req.body;
    if (!String(titulo ?? '').trim() || !dataEvento || !['BAIXA','MEDIA','ALTA'].includes(prioridade) || !['NENHUMA','DIARIA','SEMANAL','MENSAL','ANUAL'].includes(recorrencia) || !Number.isInteger(Number(antecedenciaMinutos)) || Number(antecedenciaMinutos) < 0) return res.status(400).json({ mensagem: 'Título, data, prioridade, recorrência e antecedência são obrigatórios' });
    const [resultado] = await pool.execute<ResultSetHeader>(`INSERT INTO eventos_agenda
      (titulo,descricao,data_evento,prioridade,recorrencia,antecedencia_minutos) VALUES (?,?,?,?,?,?)`,
      [String(titulo).trim(),String(descricao??'').trim()||null,dataEvento,prioridade,recorrencia,Number(antecedenciaMinutos)]);
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) { next(erro); }
});

app.patch('/api/agenda/:id/status', async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!['PENDENTE','CONCLUIDO'].includes(status)) return res.status(400).json({ mensagem: 'Status inválido' });
    const [resultado] = await pool.execute<ResultSetHeader>('UPDATE eventos_agenda SET status=? WHERE id=?',[status,req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    res.json({ id:Number(req.params.id),status });
  } catch (erro) { next(erro); }
});

app.delete('/api/agenda/:id', async (req, res, next) => {
  try { const [resultado]=await pool.execute<ResultSetHeader>('DELETE FROM eventos_agenda WHERE id=?',[req.params.id]);if(!resultado.affectedRows)return res.status(404).json({mensagem:'Evento não encontrado'});res.status(204).send(); }
  catch (erro) { next(erro); }
});

app.get('/api/animais', async (req, res, next) => {
  try {
    const busca = String(req.query.busca ?? '').trim();
    const areaId = Number(req.query.areaId) || null;
    const termo = `%${busca}%`;
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT ${campos} ${joins}
       WHERE (? IS NULL OR ar.id = ?) AND
       (? = '' OR a.brinco LIKE ? OR a.nome LIKE ? OR a.raca LIKE ? OR p.nome LIKE ? OR ar.nome LIKE ?
         OR a.fornecedor LIKE ? OR a.numero_nota_fiscal LIKE ?)
       ORDER BY a.criado_em ASC, a.id ASC`,
      [areaId, areaId, busca, termo, termo, termo, termo, termo, termo, termo]
    );
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.get('/api/animais/:id', async (req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT ${campos} ${joins} WHERE a.id = ?`, [req.params.id]
    );
    if (!linhas[0]) return res.status(404).json({ mensagem: 'Animal não encontrado' });
    res.json(linhas[0]);
  } catch (erro) { next(erro); }
});

const valores = (animal: AnimalInput, brinco=animal.brinco) => [
  brinco, animal.nome, animal.especie, animal.raca, animal.sexo,
  animal.dataNascimento, animal.dataCompra, animal.valorCompra ?? null, animal.fornecedor,
  animal.numeroNotaFiscal, animal.peso ?? null, animal.status, animal.pastoId ?? null, animal.areaId, animal.observacoes
];

const avancarLetraBrinco=(brinco:string)=>{const correspondencia=brinco.match(/^(.*?)([A-Z])$/i);if(!correspondencia)return`${brinco}A`;const codigo=correspondencia[2].toUpperCase().charCodeAt(0);return codigo<90?`${correspondencia[1]}${String.fromCharCode(codigo+1)}`:`${brinco}A`;};
const obterBrincoDisponivel=async(conexao:PoolConnection,brincoOriginal:string)=>{let brinco=brincoOriginal;for(let tentativa=0;tentativa<100;tentativa++){const[existentes]=await conexao.query<RowDataPacket[]>('SELECT id FROM animais WHERE brinco=? LIMIT 1',[brinco]);if(!existentes.length)return brinco;brinco=avancarLetraBrinco(brinco);}throw new Error('BRINCO_SEM_VARIACAO');};

app.post('/api/animais', async (req, res, next) => {
  try {
    const animal = animalSchema.parse(req.body);
    await validarDataTrava(Number(res.locals.sessao.produtorId),animal.dataCompra);
    if (!animal.valorCompra || !animal.dataVencimentoCompra || !animal.contaPagamentoId || !animal.fornecedor) {
      return res.status(400).json({ mensagem: 'Fornecedor, valor da compra, data de vencimento e conta bancária são obrigatórios na aquisição' });
    }
    const conexao = await pool.getConnection();
    let resultado: ResultSetHeader;
    let brinco = animal.brinco;
    try {
      await conexao.beginTransaction();
      const[vinculos]=await conexao.query<RowDataPacket[]>('SELECT 1 FROM areas_pastos WHERE area_id=? AND pasto_id=?',[animal.areaId,animal.pastoId]);
      if(!vinculos.length)throw new Error('PASTO_DESTINO_INEXISTENTE');
      brinco=await obterBrincoDisponivel(conexao,animal.brinco);
      [resultado] = await conexao.execute<ResultSetHeader>(`INSERT INTO animais
        (brinco, nome, especie, raca, sexo, data_nascimento, data_compra, valor_compra, fornecedor, numero_nota_fiscal, peso, status, pasto_id, area_id, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, valores(animal,brinco));
      if (animal.pastoId) await conexao.execute(`INSERT INTO historico_pastos
        (animal_id, pasto_destino_id, area_destino_id, observacao) VALUES (?, ?, ?, 'Entrada inicial no pasto')`, [resultado.insertId, animal.pastoId, animal.areaId]);
      await conexao.execute(`INSERT INTO lancamentos_financeiros
        (conta_bancaria_id, animal_id, area_id, pasto_id, tipo, categoria, descricao, fornecedor_cliente, valor, data_vencimento, data_efetivacao, data_lancamento)
        VALUES (?, ?, ?, ?, 'COMPRA_GADO', 'Aquisição de animais', ?, ?, ?, ?, NULL, COALESCE(?, CURRENT_DATE))`,
        [animal.contaPagamentoId, resultado.insertId, animal.areaId, animal.pastoId, `Aquisição do animal ${brinco} - 1 animal`,
          animal.fornecedor || 'Fornecedor não informado', animal.valorCompra, animal.dataVencimentoCompra,
          animal.dataCompra]);
      await conexao.commit();
    } catch (erro) { await conexao.rollback(); throw erro; } finally { conexao.release(); }
    res.status(201).json({ id: resultado.insertId, ...animal, brinco });
  } catch (erro) { next(erro); }
});

app.post('/api/animais/lote', async (req, res, next) => {
  try {
    const lote = loteAnimalSchema.parse(req.body);
    await validarDataTrava(Number(res.locals.sessao.produtorId),lote.dataCompra);
    const conexao = await pool.getConnection();
    const ids: number[] = [];
    let prefixoBrinco=lote.prefixoBrinco;
    try {
      await conexao.beginTransaction();
      const[vinculos]=await conexao.query<RowDataPacket[]>('SELECT 1 FROM areas_pastos WHERE area_id=? AND pasto_id=?',[lote.areaId,lote.pastoId]);
      if(!vinculos.length)throw new Error('PASTO_DESTINO_INEXISTENTE');
      if (lote.numeroNotaFiscal && lote.fornecedor) {
        const [notasExistentes] = await conexao.query<RowDataPacket[]>(
          `SELECT id FROM animais WHERE numero_nota_fiscal = ? AND fornecedor = ? AND brinco LIKE ? LIMIT 1 FOR UPDATE`,
          [lote.numeroNotaFiscal, lote.fornecedor, `${lote.prefixoBrinco}-%`]
        );
        if (notasExistentes.length) throw new Error('NOTA_FISCAL_DUPLICADA');
      }
      const largura = Math.max(3, String(lote.numeroInicial + lote.quantidade - 1).length);
      const valorCompraUnitario = lote.valorCompra ? Number((lote.valorCompra / lote.quantidade).toFixed(2)) : null;
      for(let tentativa=0;tentativa<100;tentativa++){const[existentes]=await conexao.query<RowDataPacket[]>('SELECT id FROM animais WHERE brinco LIKE ? LIMIT 1',[`${prefixoBrinco}-%`]);if(!existentes.length)break;prefixoBrinco=avancarLetraBrinco(prefixoBrinco);}
      for (let indice = 0; indice < lote.quantidade; indice++) {
        const numero = String(lote.numeroInicial + indice).padStart(largura, '0');
        const brinco = await obterBrincoDisponivel(conexao,`${prefixoBrinco}-${numero}`);
        const [resultado] = await conexao.execute<ResultSetHeader>(
          `INSERT INTO animais (brinco, nome, especie, raca, sexo, data_nascimento, data_compra,
            valor_compra, fornecedor, numero_nota_fiscal, peso, status, pasto_id, area_id, observacoes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [brinco, lote.nome, lote.especie, lote.raca, lote.sexo, lote.dataNascimento, lote.dataCompra,
            valorCompraUnitario, lote.fornecedor, lote.numeroNotaFiscal, lote.pesoMedio,
            lote.status, lote.pastoId ?? null, lote.areaId, lote.observacoes]
        );
        ids.push(resultado.insertId);
        if (lote.pastoId) await conexao.execute(
          `INSERT INTO historico_pastos (animal_id, pasto_destino_id, area_destino_id, observacao)
           VALUES (?, ?, ?, 'Entrada por aquisição em lote')`, [resultado.insertId, lote.pastoId, lote.areaId]
        );
        if (lote.status === 'VENDIDO') {
          if (!lote.valorVenda || !lote.contaBancariaId) throw new Error('VENDA_SEM_DADOS_FINANCEIROS');
          await conexao.execute(`INSERT INTO lancamentos_financeiros
            (conta_bancaria_id, animal_id, area_id, pasto_id, tipo, categoria, descricao, valor, data_vencimento, data_efetivacao, data_lancamento)
            VALUES (?, ?, ?, ?, 'ENTRADA', 'VENDA_GADO', ?, ?, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)`,
            [lote.contaBancariaId, resultado.insertId, lote.areaId, lote.pastoId, `Venda do animal ${brinco}`, lote.valorVenda]
          );
        }
      }
      if (!lote.financeiroPendente) await conexao.execute(`INSERT INTO lancamentos_financeiros
        (conta_bancaria_id, area_id, pasto_id, tipo, categoria, descricao, fornecedor_cliente, valor, data_vencimento, data_efetivacao, data_lancamento)
        VALUES (?, ?, ?, 'COMPRA_GADO', 'Aquisição de animais', ?, ?, ?, ?, NULL, COALESCE(?, CURRENT_DATE))`,
        [lote.contaPagamentoId ?? null, lote.areaId, lote.pastoId, `Aquisição em lote - ${prefixoBrinco} - ${lote.quantidade} ${lote.quantidade===1?'animal':'animais'}`,
          lote.fornecedor || 'Fornecedor não informado', lote.valorCompra ?? null, lote.dataVencimentoCompra ?? null,
          lote.dataCompra]);
      await conexao.commit();
    } catch (erro) { await conexao.rollback(); throw erro; } finally { conexao.release(); }
    res.status(201).json({ quantidade: ids.length, ids, prefixoBrinco });
  } catch (erro) { next(erro); }
});

app.post('/api/animais/transferencia', async (req, res, next) => {
  try {
    const transferencia = transferenciaAnimaisSchema.parse(req.body);
    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();
      const [pastos] = await conexao.query<RowDataPacket[]>('SELECT pasto_id FROM areas_pastos WHERE area_id = ? AND pasto_id = ? FOR UPDATE', [transferencia.areaDestinoId, transferencia.pastoDestinoId]);
      if (!pastos[0]) throw new Error('PASTO_DESTINO_INEXISTENTE');

      const marcadores = transferencia.animalIds.map(() => '?').join(',');
      const [animais] = await conexao.query<RowDataPacket[]>(
        `SELECT id, pasto_id AS pastoId, area_id AS areaId FROM animais WHERE id IN (${marcadores}) AND status = 'ATIVO' FOR UPDATE`,
        transferencia.animalIds
      );
      if (animais.length !== transferencia.animalIds.length) {
        throw new Error('ANIMAIS_TRANSFERENCIA_INVALIDOS');
      }

      const animaisMovidos = animais.filter((animal) => animal.pastoId !== transferencia.pastoDestinoId || animal.areaId !== transferencia.areaDestinoId);
      for (const animal of animaisMovidos) {
        await conexao.execute('UPDATE animais SET pasto_id = ?, area_id = ? WHERE id = ?', [transferencia.pastoDestinoId, transferencia.areaDestinoId, animal.id]);
        await conexao.execute(
          `INSERT INTO historico_pastos (animal_id, pasto_origem_id, area_origem_id, pasto_destino_id, area_destino_id, observacao)
           VALUES (?, ?, ?, ?, ?, 'Transferência coletiva de pasto')`,
          [animal.id, animal.pastoId ?? null, animal.areaId ?? null, transferencia.pastoDestinoId, transferencia.areaDestinoId]
        );
      }
      await conexao.commit();
      res.json({ quantidade: animaisMovidos.length });
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally { conexao.release(); }
  } catch (erro) { next(erro); }
});

app.put('/api/animais/:id', async (req, res, next) => {
  try {
    const animal = animalSchema.parse(req.body);
    const conexao = await pool.getConnection();
    let resultado: ResultSetHeader;
    try {
      await conexao.beginTransaction();
      const[vinculos]=await conexao.query<RowDataPacket[]>('SELECT 1 FROM areas_pastos WHERE area_id=? AND pasto_id=?',[animal.areaId,animal.pastoId]);
      if(!vinculos.length)throw new Error('PASTO_DESTINO_INEXISTENTE');
      const [atual] = await conexao.query<RowDataPacket[]>(`SELECT a.pasto_id, a.area_id, a.status
        FROM animais a WHERE a.id = ? FOR UPDATE`, [req.params.id]);
      [resultado] = await conexao.execute<ResultSetHeader>(`UPDATE animais SET brinco = ?, nome = ?, especie = ?, raca = ?, sexo = ?,
        data_nascimento = ?, data_compra = ?, valor_compra = ?, fornecedor = ?, numero_nota_fiscal = ?,
        peso = ?, status = ?, pasto_id = ?, area_id = ?, observacoes = ? WHERE id = ?`, [...valores(animal), req.params.id]);
      const origem = atual[0]?.pasto_id ?? null;
      const destino = animal.pastoId ?? null;
      if (resultado.affectedRows && (origem !== destino || atual[0]?.area_id !== animal.areaId)) await conexao.execute(`INSERT INTO historico_pastos
        (animal_id, pasto_origem_id, area_origem_id, pasto_destino_id, area_destino_id, observacao) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.params.id, origem, atual[0]?.area_id ?? null, destino, animal.areaId, destino ? (origem ? 'Transferência de pasto' : 'Entrada no pasto') : 'Saída do pasto']);
      if (resultado.affectedRows && atual[0]?.status !== animal.status) await conexao.execute(
        'INSERT INTO historico_status (animal_id, status_origem, status_destino) VALUES (?, ?, ?)',
        [req.params.id, atual[0]?.status ?? null, animal.status]
      );
      if (resultado.affectedRows && atual[0]?.status !== 'VENDIDO' && animal.status === 'VENDIDO') {
        if (!animal.valorVenda || !animal.contaBancariaId) throw new Error('VENDA_SEM_DADOS_FINANCEIROS');
        await conexao.execute(`INSERT INTO lancamentos_financeiros
          (conta_bancaria_id, animal_id, area_id, pasto_id, tipo, categoria, descricao, valor, data_vencimento, data_efetivacao, data_lancamento)
          VALUES (?, ?, ?, ?, 'ENTRADA', 'VENDA_GADO', ?, ?, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)`,
          [animal.contaBancariaId, req.params.id, atual[0]?.area_id, atual[0]?.pasto_id, `Venda do animal ${animal.brinco}`, animal.valorVenda]);
      }
      await conexao.commit();
    } catch (erro) { await conexao.rollback(); throw erro; } finally { conexao.release(); }
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Animal não encontrado' });
    res.json({ id: Number(req.params.id), ...animal });
  } catch (erro) { next(erro); }
});

app.delete('/api/animais/:id', async (req, res, next) => {
  try {
    const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM animais WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Animal não encontrado' });
    res.status(204).send();
  } catch (erro) { next(erro); }
});

app.get('/api/areas', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT ar.id, ar.nome, ar.inscricao, p.id AS pastoId, p.nome AS pastoNome,
       p.capacidade, COUNT(a.id) AS totalAnimais
       FROM areas ar LEFT JOIN areas_pastos ap ON ap.area_id = ar.id LEFT JOIN pastos p ON p.id = ap.pasto_id
       LEFT JOIN animais a ON a.pasto_id = p.id AND a.area_id = ar.id
       GROUP BY ar.id, p.id ORDER BY ar.nome, p.nome`
    );
    const areas = new Map<number, { id: number; nome: string; inscricao: string; pastos: unknown[] }>();
    for (const linha of linhas) {
      if (!areas.has(linha.id)) areas.set(linha.id, { id: linha.id, nome: linha.nome, inscricao: linha.inscricao, pastos: [] });
      if (linha.pastoId) areas.get(linha.id)!.pastos.push({ id: linha.pastoId, nome: linha.pastoNome, capacidade: linha.capacidade, totalAnimais: Number(linha.totalAnimais) });
    }
    res.json([...areas.values()]);
  } catch (erro) { next(erro); }
});

app.post('/api/areas', async (req, res, next) => {
  try {
    const area = areaSchema.parse(req.body);
    const [resultado] = await pool.execute<ResultSetHeader>('INSERT INTO areas (nome, inscricao) VALUES (?, ?)', [area.nome, area.inscricao]);
    res.status(201).json({ id: resultado.insertId, ...area, pastos: [] });
  } catch (erro) { next(erro); }
});

app.put('/api/areas/:id', async (req, res, next) => {
  try {
    const area = areaSchema.parse(req.body);
    const [resultado] = await pool.execute<ResultSetHeader>(
      'UPDATE areas SET nome = ?, inscricao = ? WHERE id = ?', [area.nome, area.inscricao, req.params.id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Área não encontrada' });
    res.json({ id: Number(req.params.id), ...area });
  } catch (erro) { next(erro); }
});

app.get('/api/pastos/catalogo',async(_req,res,next)=>{try{const[linhas]=await pool.query<RowDataPacket[]>('SELECT id,nome,capacidade FROM pastos ORDER BY nome');res.json(linhas.map(l=>({...l,id:Number(l.id),capacidade:l.capacidade==null?null:Number(l.capacidade)})));}catch(erro){next(erro);}});
app.post('/api/pastos/catalogo',async(req,res,next)=>{try{const nome=String(req.body.nome??'').trim();if(!nome)return res.status(400).json({mensagem:'Informe o nome do pasto'});const[resultado]=await pool.execute<ResultSetHeader>('INSERT INTO pastos(area_id,nome,capacidade) VALUES(NULL,?,NULL)',[nome]);res.status(201).json({id:resultado.insertId,nome,capacidade:null});}catch(erro){next(erro);}});
app.post('/api/pastos', async (req, res, next) => {
  try {
    const pasto = pastoSchema.parse(req.body);
    const conexao=await pool.getConnection();let id:number;
    try{await conexao.beginTransaction();const[existentes]=await conexao.query<RowDataPacket[]>('SELECT id FROM pastos WHERE nome = ? LIMIT 1 FOR UPDATE',[pasto.nome]);
      if(existentes[0]){id=Number(existentes[0].id);await conexao.execute('UPDATE pastos SET capacidade=COALESCE(?,capacidade) WHERE id=?',[pasto.capacidade??null,id]);}
      else{const[resultado]=await conexao.execute<ResultSetHeader>('INSERT INTO pastos (area_id, nome, capacidade) VALUES (?, ?, ?)',[pasto.areaIds[0],pasto.nome,pasto.capacidade??null]);id=resultado.insertId;}
      for(const areaId of pasto.areaIds)await conexao.execute('INSERT IGNORE INTO areas_pastos(area_id,pasto_id) VALUES(?,?)',[areaId,id]);
      await conexao.commit();
    }catch(erro){await conexao.rollback();throw erro;}finally{conexao.release();}
    res.status(201).json({ id, ...pasto, totalAnimais: 0 });
  } catch (erro) { next(erro); }
});

app.put('/api/pastos/:id', async (req, res, next) => {
  try {
    const pasto = pastoSchema.parse(req.body);
    const conexao=await pool.getConnection();let destinoId=0;
    try{await conexao.beginTransaction();
      const[origens]=await conexao.query<RowDataPacket[]>('SELECT id FROM pastos WHERE id=? FOR UPDATE',[req.params.id]);
      if(!origens[0])throw new Error('PASTO_ORIGEM_INEXISTENTE');
      const[destinos]=await conexao.query<RowDataPacket[]>('SELECT id FROM pastos WHERE nome=? LIMIT 1 FOR UPDATE',[pasto.nome]);
      if(!destinos[0])throw new Error('PASTO_DESTINO_INEXISTENTE');
      destinoId=Number(destinos[0].id);
      await conexao.execute('UPDATE pastos SET capacidade=? WHERE id=?',[pasto.capacidade??null,destinoId]);
      const marcadores=pasto.areaIds.map(()=>'?').join(',');
      if(destinoId!==Number(req.params.id)){
        for(const areaId of pasto.areaIds)await conexao.execute('INSERT IGNORE INTO areas_pastos(area_id,pasto_id) VALUES(?,?)',[areaId,destinoId]);
        await conexao.execute(`INSERT INTO historico_pastos(animal_id,pasto_origem_id,area_origem_id,pasto_destino_id,area_destino_id,observacao)
          SELECT id,pasto_id,area_id,?,area_id,'Alteração coletiva do vínculo do pasto' FROM animais
          WHERE pasto_id=? AND area_id IN (${marcadores})`,[destinoId,req.params.id,...pasto.areaIds]);
        await conexao.execute(`UPDATE animais SET pasto_id=? WHERE pasto_id=? AND area_id IN (${marcadores})`,[destinoId,req.params.id,...pasto.areaIds]);
        await conexao.execute(`DELETE FROM areas_pastos WHERE pasto_id=? AND area_id IN (${marcadores})`,[req.params.id,...pasto.areaIds]);
      }
      await conexao.commit();
    }catch(erro){await conexao.rollback();throw erro;}finally{conexao.release();}
    res.json({ id: destinoId, ...pasto });
  } catch (erro) { next(erro); }
});

app.delete('/api/pastos/:id', async (req, res, next) => {
  try {
    const pastoId = Number(req.params.id);
    if (!Number.isInteger(pastoId) || pastoId <= 0) return res.status(400).json({ mensagem: 'Pasto inválido' });
    const [vinculos] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS animais FROM animais WHERE pasto_id = ?',
      [pastoId]
    );
    const uso = vinculos[0];
    if (Number(uso?.animais)) {
      return res.status(409).json({ mensagem: 'Este pasto possui animais vinculados. Transfira ou exclua os animais antes de excluir o pasto.' });
    }
    const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM pastos WHERE id = ?', [pastoId]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Pasto não encontrado' });
    res.status(204).send();
  } catch (erro) { next(erro); }
});

app.get('/api/pastos', async (_req, res, next) => {
  try {
    const [pastos] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.nome, p.capacidade, ar.id AS areaId,
       ar.nome AS areaNome, ar.inscricao, COUNT(CASE WHEN a.status='ATIVO' THEN a.id END) AS totalAnimais
       FROM pastos p JOIN areas_pastos ap ON ap.pasto_id=p.id JOIN areas ar ON ar.id=ap.area_id
       LEFT JOIN animais a ON a.pasto_id = p.id AND a.area_id=ar.id
       GROUP BY p.id, ar.id
       ORDER BY ar.nome, p.nome`
    );
    res.json(pastos.map((pasto) => ({ ...pasto, totalAnimais: Number(pasto.totalAnimais) })));
  } catch (erro) { next(erro); }
});

app.get('/api/relatorios/consolidado-pastos', async (req, res, next) => {
  try {
    const areaId = Number(req.query.areaId) || null;
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT p.id AS pastoId, p.nome AS pastoNome,
       p.capacidade, SUM(a.status = 'ATIVO') AS total, SUM(a.status = 'ATIVO' AND a.sexo = 'F') AS femeas, SUM(a.status = 'ATIVO' AND a.sexo = 'M') AS machos,
       SUM(a.status = 'ATIVO') AS ativos, SUM(a.status = 'VENDIDO') AS vendidos,
       SUM(a.status = 'MORTO') AS mortos, ROUND(SUM(COALESCE(a.peso, 0)), 2) AS pesoTotal
       FROM pastos p JOIN areas_pastos ap ON ap.pasto_id=p.id
       LEFT JOIN animais a ON a.pasto_id=p.id AND a.area_id=ap.area_id
       WHERE (? IS NULL OR ap.area_id = ?) GROUP BY p.id, p.nome, p.capacidade ORDER BY p.nome`, [areaId, areaId]
    );
    res.json(linhas.map((l) => ({ ...l, total: Number(l.total), femeas: Number(l.femeas), machos: Number(l.machos), ativos: Number(l.ativos), vendidos: Number(l.vendidos), mortos: Number(l.mortos), pesoTotal: Number(l.pesoTotal) })));
  } catch (erro) { next(erro); }
});

app.get('/api/relatorios/historico-pastos', async (req, res, next) => {
  try {
    const areaId = Number(req.query.areaId) || null;
    const dataInicio = String(req.query.dataInicio ?? '') || null;
    const dataFim = String(req.query.dataFim ?? '') || null;
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT h.id, h.movimentado_em AS movimentadoEm, h.observacao, a.id AS animalId, a.brinco, a.nome AS animalNome,
       CAST(a.valor_compra AS DOUBLE) AS valorCompra,
       po.nome AS pastoOrigem, ao.nome AS areaOrigem, ao.inscricao AS inscricaoOrigem,
       pd.nome AS pastoDestino, ad.nome AS areaDestino, ad.inscricao AS inscricaoDestino
       FROM historico_pastos h JOIN animais a ON a.id = h.animal_id
       LEFT JOIN pastos po ON po.id = h.pasto_origem_id LEFT JOIN areas ao ON ao.id = h.area_origem_id
       LEFT JOIN pastos pd ON pd.id = h.pasto_destino_id LEFT JOIN areas ad ON ad.id = h.area_destino_id
       WHERE (? IS NULL OR ao.id = ? OR ad.id = ?)
       AND (? IS NULL OR DATE(h.movimentado_em) >= ?) AND (? IS NULL OR DATE(h.movimentado_em) <= ?)
       ORDER BY h.movimentado_em DESC, h.id DESC`, [areaId, areaId, areaId, dataInicio, dataInicio, dataFim, dataFim]
    );
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.get('/api/relatorios/aquisicoes-vendas', async (_req, res, next) => {
  try {
    const [aquisicoes] = await pool.query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(criado_em, '%Y-%m') AS mes, COUNT(*) AS total FROM animais
       WHERE criado_em >= DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 11 MONTH)
       GROUP BY mes`
    );
    const [vendas] = await pool.query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(alterado_em, '%Y-%m') AS mes, COUNT(*) AS total FROM historico_status
       WHERE status_destino = 'VENDIDO' AND alterado_em >= DATE_SUB(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 11 MONTH)
       GROUP BY mes`
    );
    const mapaAquisicoes = new Map(aquisicoes.map((l) => [l.mes, Number(l.total)]));
    const mapaVendas = new Map(vendas.map((l) => [l.mes, Number(l.total)]));
    const dados = [];
    const hoje = new Date();
    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      dados.push({ mes, aquisicoes: mapaAquisicoes.get(mes) ?? 0, vendas: mapaVendas.get(mes) ?? 0 });
    }
    res.json(dados);
  } catch (erro) { next(erro); }
});

app.get('/api/relatorios/controle-animais', async (req, res, next) => {
  try {
    const dataInicio=String(req.query.dataInicio??''),dataFim=String(req.query.dataFim??'');
    const dataValida=/^\d{4}-\d{2}-\d{2}$/;
    if(!dataValida.test(dataInicio)||!dataValida.test(dataFim)||dataInicio>dataFim)return res.status(400).json({mensagem:'Informe um período válido'});
    const [saldoLinhas]=await pool.query<RowDataPacket[]>(`SELECT
      (SELECT COUNT(*) FROM animais a WHERE COALESCE(a.data_compra,DATE(a.criado_em))<?) -
      (SELECT COUNT(*) FROM venda_animais va JOIN vendas v ON v.id=va.venda_id WHERE v.data_emissao<?) AS saldoAnterior`,[dataInicio,dataInicio]);
    const [movimentos]=await pool.query<RowDataPacket[]>(`SELECT data,SUM(entradas) AS entradas,SUM(saidas) AS saidas FROM (
      SELECT COALESCE(a.data_compra,DATE(a.criado_em)) AS data,COUNT(*) AS entradas,0 AS saidas FROM animais a
      WHERE COALESCE(a.data_compra,DATE(a.criado_em)) BETWEEN ? AND ? GROUP BY data
      UNION ALL
      SELECT v.data_emissao AS data,0 AS entradas,COUNT(*) AS saidas FROM venda_animais va JOIN vendas v ON v.id=va.venda_id
      WHERE v.data_emissao BETWEEN ? AND ? GROUP BY data
    ) m GROUP BY data ORDER BY data`,[dataInicio,dataFim,dataInicio,dataFim]);
    const detalhes=await Promise.all(movimentos.map(async movimento=>{const data=String(movimento.data);const[faixas]=await pool.query<RowDataPacket[]>(`SELECT a.sexo,CASE
      WHEN a.data_nascimento IS NULL THEN 'Idade não informada'
      WHEN TIMESTAMPDIFF(MONTH,a.data_nascimento,?)<=12 THEN '0 a 12 meses'
      WHEN TIMESTAMPDIFF(MONTH,a.data_nascimento,?)<=24 THEN '13 a 24 meses'
      WHEN TIMESTAMPDIFF(MONTH,a.data_nascimento,?)<=36 THEN '25 a 36 meses'
      WHEN TIMESTAMPDIFF(MONTH,a.data_nascimento,?)<=48 THEN '37 a 48 meses'
      ELSE 'Acima de 48 meses' END AS faixa,COUNT(*) AS total
      FROM animais a LEFT JOIN venda_animais va ON va.animal_id=a.id LEFT JOIN vendas v ON v.id=va.venda_id
      WHERE COALESCE(a.data_compra,DATE(a.criado_em))<=? AND (v.id IS NULL OR v.data_emissao>?) GROUP BY a.sexo,faixa`,[data,data,data,data,data,data]);
      const machos:Record<string,number>={},femeas:Record<string,number>={};for(const faixa of faixas)(faixa.sexo==='M'?machos:femeas)[String(faixa.faixa)]=Number(faixa.total);return{machos,femeas};}));
    let saldo=Number(saldoLinhas[0]?.saldoAnterior??0);
    const linhas=movimentos.map((movimento,indice)=>{const entradas=Number(movimento.entradas),saidas=Number(movimento.saidas);saldo+=entradas-saidas;return{data:String(movimento.data),entradas,saidas,saldo,...detalhes[indice]};});
    res.json({dataInicio,dataFim,saldoAnterior:Number(saldoLinhas[0]?.saldoAnterior??0),linhas});
  } catch(erro){next(erro);}
});

const dataMesSeguinte = (data: string, meses: number) => {
  const [ano, mes, dia] = data.split('-').map(Number);
  const ultimoDia = new Date(ano, mes + meses, 0).getDate();
  const destino = new Date(ano, mes - 1 + meses, Math.min(dia, ultimoDia));
  return `${destino.getFullYear()}-${String(destino.getMonth() + 1).padStart(2, '0')}-${String(destino.getDate()).padStart(2, '0')}`;
};

async function obterDataTrava(produtorId:number){const[linhas]=await pool.query<RowDataPacket[]>(`SELECT DATE_FORMAT(data_trava,'%Y-%m-%d') AS dataTrava FROM travas_financeiras WHERE produtor_id=?`,[produtorId]);return linhas[0]?.dataTrava?String(linhas[0].dataTrava):null;}
async function validarDataTrava(produtorId:number,data:string|null|undefined){const trava=await obterDataTrava(produtorId);if(trava&&data&&data<=trava)throw new Error(`PERIODO_TRAVADO:${trava}`);}

app.get('/api/financeiro/trava',async(_req,res,next)=>{try{res.json({dataTrava:await obterDataTrava(Number(res.locals.sessao.produtorId))});}catch(erro){next(erro);}});
app.put('/api/financeiro/trava',async(req,res,next)=>{try{const dataTrava=String(req.body.dataTrava??''),s=res.locals.sessao;if(s.perfil!=='ADMIN')return res.status(403).json({mensagem:'Somente o administrador pode definir a trava financeira'});if(!/^\d{4}-\d{2}-\d{2}$/.test(dataTrava))return res.status(400).json({mensagem:'Informe uma data válida para a trava'});await pool.execute(`INSERT INTO travas_financeiras(produtor_id,data_trava,usuario_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE data_trava=VALUES(data_trava),usuario_id=VALUES(usuario_id)`,[s.produtorId,dataTrava,s.usuarioId]);res.json({dataTrava});}catch(erro){next(erro);}});

app.get('/api/vendas', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT v.id,v.area_id AS areaId,ar.nome AS areaNome,ar.inscricao,
      v.numero_nota_fiscal AS numeroNotaFiscal,v.comprador_nome AS compradorNome,
      v.comprador_documento AS compradorDocumento,v.comprador_telefone AS compradorTelefone,
      v.comprador_endereco AS compradorEndereco,DATE_FORMAT(v.data_emissao,'%Y-%m-%d') AS dataEmissao,
      CAST(v.valor_total AS DOUBLE) AS valorTotal,DATE_FORMAT(v.data_primeiro_vencimento,'%Y-%m-%d') AS dataPrimeiroVencimento,
      v.quantidade_parcelas AS quantidadeParcelas,v.conta_bancaria_id AS contaBancariaId,c.nome AS contaNome,
      v.observacoes,v.status,GROUP_CONCAT(CONCAT(a.id, ':', REPLACE(a.brinco, ',', '')) ORDER BY a.brinco SEPARATOR ',') AS animaisTexto
      FROM vendas v JOIN areas ar ON ar.id=v.area_id LEFT JOIN contas_bancarias c ON c.id=v.conta_bancaria_id
      LEFT JOIN venda_animais va ON va.venda_id=v.id LEFT JOIN animais a ON a.id=va.animal_id
      GROUP BY v.id ORDER BY v.data_emissao DESC,v.id DESC`);
    res.json(linhas.map(linha => ({...linha,id:Number(linha.id),areaId:Number(linha.areaId),
      quantidadeParcelas:linha.quantidadeParcelas===null?null:Number(linha.quantidadeParcelas),
      contaBancariaId:linha.contaBancariaId===null?null:Number(linha.contaBancariaId),
      animais:String(linha.animaisTexto??'').split(',').filter(Boolean).map(item=>{const separador=item.indexOf(':');return{id:Number(item.slice(0,separador)),brinco:item.slice(separador+1)};}),animaisTexto:undefined})));
  } catch (erro) { next(erro); }
});

const validarVenda = (body: Record<string, unknown>) => {
  const areaId=Number(body.areaId), animalIds=Array.isArray(body.animalIds)?body.animalIds.map(Number):[];
  const numeroNotaFiscal=String(body.numeroNotaFiscal??'').trim(), compradorNome=String(body.compradorNome??'').trim();
  const compradorDocumento=String(body.compradorDocumento??'').trim(), dataEmissao=String(body.dataEmissao??'');
  if(!Number.isInteger(areaId)||areaId<=0||!numeroNotaFiscal||!compradorNome||!compradorDocumento||!/^\d{4}-\d{2}-\d{2}$/.test(dataEmissao)||!animalIds.length||animalIds.some(id=>!Number.isInteger(id)||id<=0)) throw new Error('VENDA_DADOS_INVALIDOS');
  const quantidadeNotaFiscal=body.quantidadeNotaFiscal===null||body.quantidadeNotaFiscal===''||body.quantidadeNotaFiscal===undefined?null:Number(body.quantidadeNotaFiscal);
  if(quantidadeNotaFiscal!==null&&(!Number.isInteger(quantidadeNotaFiscal)||quantidadeNotaFiscal<1||quantidadeNotaFiscal!==new Set(animalIds).size)) throw new Error('VENDA_QUANTIDADE_DIVERGENTE');
  const possuiFinanceiro=body.valorTotal!==null&&body.valorTotal!==''&&body.valorTotal!==undefined;
  const valorTotal=possuiFinanceiro?Number(body.valorTotal):null;
  const dataPrimeiroVencimento=String(body.dataPrimeiroVencimento??'')||dataEmissao;
  const quantidadeParcelas=possuiFinanceiro?Number(body.quantidadeParcelas??1):null;
  const contaBancariaId=body.contaBancariaId===null||body.contaBancariaId===''||body.contaBancariaId===undefined?null:Number(body.contaBancariaId);
  if(possuiFinanceiro&&(!(valorTotal!>0)||!Number.isInteger(quantidadeParcelas)||quantidadeParcelas!<1||quantidadeParcelas!>120)) throw new Error('VENDA_FINANCEIRO_INCOMPLETO');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dataPrimeiroVencimento)) throw new Error('VENDA_FINANCEIRO_INCOMPLETO');
  if(contaBancariaId!==null&&(!Number.isInteger(contaBancariaId)||contaBancariaId<=0)) throw new Error('VENDA_FINANCEIRO_INCOMPLETO');
  return {areaId,animalIds:[...new Set(animalIds)],numeroNotaFiscal,compradorNome,compradorDocumento,
    compradorTelefone:String(body.compradorTelefone??'').trim()||null,compradorEndereco:String(body.compradorEndereco??'').trim()||null,
    dataEmissao,valorTotal,dataPrimeiroVencimento,quantidadeParcelas,contaBancariaId,observacoes:String(body.observacoes??'').trim()||null};
};

async function salvarVenda(body: Record<string, unknown>, vendaId?: number, concluir=true,produtorId?:number) {
  const venda=validarVenda(body), conexao=await pool.getConnection();
  try {
    await conexao.beginTransaction();
    if(produtorId)await validarDataTrava(produtorId,venda.dataEmissao);
    if(!vendaId){
      const [vendasExistentes]=await conexao.query<RowDataPacket[]>(
        'SELECT id,status FROM vendas WHERE area_id=? AND numero_nota_fiscal=? LIMIT 1 FOR UPDATE',
        [venda.areaId,venda.numeroNotaFiscal]
      );
      if(vendasExistentes.length){
        vendaId=Number(vendasExistentes[0].id);
      }
    }
    const animaisOriginais=new Set<number>();
    const marcadores=venda.animalIds.map(()=>'?').join(',');
    const [animais]=await conexao.query<RowDataPacket[]>(`SELECT a.id,a.brinco,a.status,ar.id AS areaId,a.pasto_id AS pastoId
      FROM animais a JOIN pastos p ON p.id=a.pasto_id JOIN areas ar ON ar.id=a.area_id
      WHERE a.id IN (${marcadores}) FOR UPDATE`,venda.animalIds);
    if(animais.length!==venda.animalIds.length||animais.some(a=>Number(a.areaId)!==venda.areaId||(a.status!=='ATIVO'&&(!vendaId||a.status!=='VENDIDO')))) throw new Error('VENDA_ANIMAIS_INVALIDOS');
    let id=vendaId;
    if(id){
      const [existentes]=await conexao.query<RowDataPacket[]>('SELECT animal_id AS id FROM venda_animais WHERE venda_id=?',[id]);
      const permitidos=new Set(existentes.map(a=>Number(a.id)));
      permitidos.forEach(animalId=>animaisOriginais.add(animalId));
      if(animais.some(a=>a.status==='VENDIDO'&&!permitidos.has(Number(a.id)))) throw new Error('VENDA_ANIMAIS_INVALIDOS');
      const [recebidos]=await conexao.query<RowDataPacket[]>('SELECT id FROM lancamentos_financeiros WHERE venda_id=? AND data_efetivacao IS NOT NULL LIMIT 1',[id]);
      if(recebidos.length) throw new Error('VENDA_JA_RECEBIDA');
      await conexao.execute(`UPDATE vendas SET area_id=?,numero_nota_fiscal=?,comprador_nome=?,comprador_documento=?,comprador_telefone=?,comprador_endereco=?,data_emissao=?,valor_total=?,data_primeiro_vencimento=?,quantidade_parcelas=?,conta_bancaria_id=?,observacoes=?,status=? WHERE id=?`,[venda.areaId,venda.numeroNotaFiscal,venda.compradorNome,venda.compradorDocumento,venda.compradorTelefone,venda.compradorEndereco,venda.dataEmissao,venda.valorTotal,venda.dataPrimeiroVencimento,venda.quantidadeParcelas,venda.contaBancariaId,venda.observacoes,concluir?'CONCLUIDA':'RASCUNHO',id]);
      await conexao.execute(`UPDATE animais a JOIN venda_animais va ON va.animal_id=a.id SET a.status='ATIVO' WHERE va.venda_id=?`,[id]);
      await conexao.execute('DELETE FROM venda_animais WHERE venda_id=?',[id]);
      await conexao.execute('DELETE FROM lancamentos_financeiros WHERE venda_id=?',[id]);
    }else{
      const [resultado]=await conexao.execute<ResultSetHeader>(`INSERT INTO vendas (area_id,numero_nota_fiscal,comprador_nome,comprador_documento,comprador_telefone,comprador_endereco,data_emissao,valor_total,data_primeiro_vencimento,quantidade_parcelas,conta_bancaria_id,observacoes,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,[venda.areaId,venda.numeroNotaFiscal,venda.compradorNome,venda.compradorDocumento,venda.compradorTelefone,venda.compradorEndereco,venda.dataEmissao,venda.valorTotal,venda.dataPrimeiroVencimento,venda.quantidadeParcelas,venda.contaBancariaId,venda.observacoes,concluir?'CONCLUIDA':'RASCUNHO']);id=resultado.insertId;
    }
    for(const animal of animais){await conexao.execute('INSERT INTO venda_animais (venda_id,animal_id) VALUES (?,?)',[id,animal.id]);await conexao.execute(`UPDATE animais SET status='VENDIDO' WHERE id=?`,[animal.id]);if(!animaisOriginais.has(Number(animal.id)))await conexao.execute(`INSERT INTO historico_status (animal_id,status_origem,status_destino) VALUES (?,'ATIVO','VENDIDO')`,[animal.id]);}
    if(concluir&&venda.valorTotal&&venda.dataPrimeiroVencimento&&venda.quantidadeParcelas){
      const base=Math.floor(venda.valorTotal*100/venda.quantidadeParcelas)/100, diferenca=Number((venda.valorTotal-base*venda.quantidadeParcelas).toFixed(2));
      for(let indice=0;indice<venda.quantidadeParcelas;indice++) await conexao.execute(`INSERT INTO lancamentos_financeiros (conta_bancaria_id,venda_id,area_id,tipo,categoria,descricao,fornecedor_cliente,valor,data_vencimento,data_efetivacao,data_lancamento) VALUES (?,?,?,'ENTRADA','Venda de animais',?,?,?,?,NULL,?)`,[venda.contaBancariaId,id,venda.areaId,`Venda NF ${venda.numeroNotaFiscal} (${indice+1}/${venda.quantidadeParcelas}) - ${venda.animalIds.length} ${venda.animalIds.length===1?'animal':'animais'}`,venda.compradorNome,Number((base+(indice===venda.quantidadeParcelas-1?diferenca:0)).toFixed(2)),dataMesSeguinte(venda.dataPrimeiroVencimento,indice),venda.dataEmissao]);
    }
    await conexao.commit();return id!;
  } catch(erro){await conexao.rollback();throw erro;} finally{conexao.release();}
}

app.post('/api/vendas',async(req,res,next)=>{try{res.status(201).json({id:await salvarVenda(req.body,undefined,true,Number(res.locals.sessao.produtorId))});}catch(erro){next(erro);}});
app.put('/api/vendas/:id',async(req,res,next)=>{try{const id=Number(req.params.id);if(!Number.isInteger(id)||id<=0)return res.status(400).json({mensagem:'Venda inválida'});res.json({id:await salvarVenda(req.body,id,true,Number(res.locals.sessao.produtorId))});}catch(erro){next(erro);}});
app.post('/api/vendas/baixa',async(req,res,next)=>{try{res.status(201).json({id:await salvarVenda(req.body,undefined,false,Number(res.locals.sessao.produtorId))});}catch(erro){next(erro);}});

app.get('/api/financeiro/contas', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT c.id, c.nome, c.banco, c.agencia, c.conta, CAST(c.saldo_inicial AS DOUBLE) AS saldoInicial,
      CAST(c.saldo_inicial + COALESCE(SUM(CASE WHEN l.data_efetivacao IS NULL THEN 0 WHEN l.tipo='ENTRADA' THEN l.valor ELSE -l.valor END),0) AS DOUBLE) AS saldo
      FROM contas_bancarias c LEFT JOIN lancamentos_financeiros l ON l.conta_bancaria_id=c.id GROUP BY c.id ORDER BY c.nome`);
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.post('/api/financeiro/contas', async (req, res, next) => {
  try {
    const { nome, banco, agencia, conta, saldoInicial } = req.body;
    if (!String(nome ?? '').trim() || !String(banco ?? '').trim()) return res.status(400).json({ mensagem: 'Nome da conta e banco são obrigatórios' });
    const [resultado] = await pool.execute<ResultSetHeader>(`INSERT INTO contas_bancarias
      (nome,banco,agencia,conta,saldo_inicial) VALUES (?,?,?,?,?)`, [String(nome).trim(), String(banco).trim(), agencia || null, conta || null, Number(saldoInicial) || 0]);
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) { next(erro); }
});

app.put('/api/financeiro/contas/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nome, banco, agencia, conta, saldoInicial } = req.body;
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensagem: 'Conta bancária inválida' });
    if (!String(nome ?? '').trim() || !String(banco ?? '').trim()) return res.status(400).json({ mensagem: 'Nome da conta e banco são obrigatórios' });
    const saldo = Number(saldoInicial);
    if (!Number.isFinite(saldo)) return res.status(400).json({ mensagem: 'Informe um saldo inicial válido' });
    const [resultado] = await pool.execute<ResultSetHeader>(
      'UPDATE contas_bancarias SET nome=?, banco=?, agencia=?, conta=?, saldo_inicial=? WHERE id=?',
      [String(nome).trim(), String(banco).trim(), agencia || null, conta || null, saldo, id]
    );
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Conta bancária não encontrada' });
    res.json({ id });
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/categorias-despesa', async (_req, res, next) => {
  try { const [linhas] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM categorias_despesa ORDER BY nome'); res.json(linhas); }
  catch (erro) { next(erro); }
});

app.post('/api/financeiro/categorias-despesa', async (req, res, next) => {
  try {
    const nome = String(req.body.nome ?? '').trim();
    if (!nome || nome.length > 60) return res.status(400).json({ mensagem: 'Informe uma categoria de despesa válida' });
    const [resultado] = await pool.execute<ResultSetHeader>('INSERT INTO categorias_despesa (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: resultado.insertId, nome });
  } catch (erro) { next(erro); }
});

app.put('/api/financeiro/categorias-despesa/:id', async (req, res, next) => {
  const conexao = await pool.getConnection();
  try {
    const id = Number(req.params.id), nome = String(req.body.nome ?? '').trim();
    if (!Number.isInteger(id) || id <= 0 || !nome || nome.length > 60) return res.status(400).json({ mensagem: 'Informe uma categoria de despesa válida' });
    await conexao.beginTransaction();
    const [atuais] = await conexao.query<RowDataPacket[]>('SELECT nome FROM categorias_despesa WHERE id=? FOR UPDATE', [id]);
    if (!atuais[0]) { await conexao.rollback(); return res.status(404).json({ mensagem: 'Categoria não encontrada' }); }
    const nomeAnterior = String(atuais[0].nome);
    await conexao.execute('UPDATE categorias_despesa SET nome=? WHERE id=?', [nome, id]);
    await conexao.execute('UPDATE lancamentos_financeiros SET categoria=? WHERE categoria=?', [nome, nomeAnterior]);
    await conexao.commit();
    res.json({ id, nome });
  } catch (erro) { await conexao.rollback(); next(erro); } finally { conexao.release(); }
});

app.get('/api/financeiro/lancamentos', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT l.id,l.conta_bancaria_id AS contaBancariaId,l.animal_id AS animalId,l.area_id AS areaId,l.pasto_id AS pastoId,l.tipo,l.categoria,l.subcategoria,l.descricao,CAST(l.valor AS DOUBLE) AS valor,
      DATE_FORMAT(l.data_lancamento,'%Y-%m-%d') AS dataLancamento,
      DATE_FORMAT(l.data_vencimento,'%Y-%m-%d') AS dataVencimento,
      DATE_FORMAT(l.data_efetivacao,'%Y-%m-%d') AS dataEfetivacao,
      COALESCE(l.fornecedor_cliente,l.descricao) AS fornecedorCliente,c.nome AS contaNome,a.brinco,
      ar.nome AS areaNome,p.nome AS pastoNome
      FROM lancamentos_financeiros l LEFT JOIN contas_bancarias c ON c.id=l.conta_bancaria_id
      LEFT JOIN animais a ON a.id=l.animal_id LEFT JOIN areas ar ON ar.id=l.area_id
      LEFT JOIN pastos p ON p.id=l.pasto_id ORDER BY l.data_vencimento ASC,l.id ASC`);
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/extrato', async (req, res, next) => {
  try {
    const contaBancariaId = Number(req.query.contaBancariaId);
    const dataInicio = String(req.query.dataInicio ?? '');
    const dataFim = String(req.query.dataFim ?? '');
    const dataValida = /^\d{4}-\d{2}-\d{2}$/;
    if (!Number.isInteger(contaBancariaId) || contaBancariaId <= 0 || !dataValida.test(dataInicio) || !dataValida.test(dataFim) || dataInicio > dataFim) {
      return res.status(400).json({ mensagem: 'Informe a conta bancária e um período válido' });
    }
    const [contas] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.nome, c.banco, c.agencia, c.conta,
       CAST(c.saldo_inicial + COALESCE(SUM(CASE WHEN l.data_efetivacao < ? THEN
         CASE WHEN l.tipo = 'ENTRADA' THEN l.valor ELSE -l.valor END ELSE 0 END), 0) AS DOUBLE) AS saldoInicial
       FROM contas_bancarias c LEFT JOIN lancamentos_financeiros l ON l.conta_bancaria_id = c.id
       WHERE c.id = ? GROUP BY c.id`, [dataInicio, contaBancariaId]
    );
    if (!contas[0]) return res.status(404).json({ mensagem: 'Conta bancária não encontrada' });
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT l.id, DATE_FORMAT(l.data_efetivacao, '%Y-%m-%d') AS data,
       l.descricao, COALESCE(l.fornecedor_cliente, l.descricao) AS favorecido,
       l.tipo, CAST(l.valor AS DOUBLE) AS valor
       FROM lancamentos_financeiros l
       WHERE l.conta_bancaria_id = ? AND l.data_efetivacao BETWEEN ? AND ?
       ORDER BY l.data_efetivacao, l.id`, [contaBancariaId, dataInicio, dataFim]
    );
    let saldo = Number(contas[0].saldoInicial);
    const movimentos = linhas.map((linha) => {
      const valor = Number(linha.valor);
      const entrada = linha.tipo === 'ENTRADA' ? valor : 0;
      const saida = linha.tipo === 'ENTRADA' ? 0 : valor;
      saldo = Number((saldo + entrada - saida).toFixed(2));
      return { id: Number(linha.id), data: linha.data, descricao: linha.descricao, favorecido: linha.favorecido, entrada, saida, saldo };
    });
    res.json({ conta: { id: Number(contas[0].id), nome: contas[0].nome, banco: contas[0].banco, agencia: contas[0].agencia, numero: contas[0].conta }, saldoInicial: Number(contas[0].saldoInicial), saldoFinal: saldo, movimentos });
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/dre', async (req, res, next) => {
  try {
    const dataInicio = String(req.query.dataInicio ?? '');
    const dataFim = String(req.query.dataFim ?? '');
    const dataValida = /^\d{4}-\d{2}-\d{2}$/;
    if (!dataValida.test(dataInicio) || !dataValida.test(dataFim) || dataInicio > dataFim) {
      return res.status(400).json({ mensagem: 'Informe um período válido para gerar a DRE' });
    }
    const [linhas] = await pool.query<RowDataPacket[]>(
      `SELECT grupo,categoria,CAST(SUM(valor) AS DOUBLE) AS valor FROM (
         SELECT CASE WHEN tipo='ENTRADA' THEN 'RECEITA' ELSE 'DESPESA' END AS grupo,categoria,valor
         FROM lancamentos_financeiros
         WHERE tipo<>'COMPRA_GADO' AND data_lancamento BETWEEN ? AND ?
         UNION ALL
         SELECT 'DESPESA','Custo de aquisição de gado',COALESCE(a.valor_compra,0)
         FROM vendas v JOIN venda_animais va ON va.venda_id=v.id JOIN animais a ON a.id=va.animal_id
         WHERE v.status='CONCLUIDA' AND v.data_emissao BETWEEN ? AND ?
       ) dre GROUP BY grupo,categoria ORDER BY grupo DESC,categoria`,
      [dataInicio,dataFim,dataInicio,dataFim]
    );
    const receitas = linhas.filter((linha) => linha.grupo === 'RECEITA').map((linha) => ({ categoria: linha.categoria, valor: Number(linha.valor) }));
    const despesas = linhas.filter((linha) => linha.grupo === 'DESPESA').map((linha) => ({ categoria: linha.categoria, valor: Number(linha.valor) }));
    const totalReceitas = receitas.reduce((total, item) => total + item.valor, 0);
    const totalDespesas = despesas.reduce((total, item) => total + item.valor, 0);
    const [animaisVendidos] = await pool.query<RowDataPacket[]>(`SELECT a.id,a.brinco,a.sexo,
      DATE_FORMAT(a.data_compra,'%Y-%m-%d') AS dataCompra,DATE_FORMAT(v.data_emissao,'%Y-%m-%d') AS dataVenda,
      TIMESTAMPDIFF(MONTH,a.data_nascimento,v.data_emissao) AS idadeMeses,
      CAST(COALESCE(a.valor_compra,0) AS DOUBLE) AS valorCompra,
      CAST(COALESCE(v.valor_total,0)/(SELECT COUNT(*) FROM venda_animais vx WHERE vx.venda_id=v.id) AS DOUBLE) AS valorVenda
      FROM vendas v JOIN venda_animais va ON va.venda_id=v.id JOIN animais a ON a.id=va.animal_id
      WHERE v.status='CONCLUIDA' AND v.data_emissao BETWEEN ? AND ? ORDER BY v.data_emissao,a.brinco`,[dataInicio,dataFim]);
    res.json({ dataInicio, dataFim, receitas, despesas, totalReceitas, totalDespesas,
      resultado: Number((totalReceitas - totalDespesas).toFixed(2)),
      animaisVendidos: animaisVendidos.map(a=>({...a,id:Number(a.id),idadeMeses:a.idadeMeses===null?null:Number(a.idadeMeses),
        valorCompra:Number(a.valorCompra),valorVenda:Number(a.valorVenda),resultado:Number((Number(a.valorVenda)-Number(a.valorCompra)).toFixed(2))})) });
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/dre-analise', async (req,res,next)=>{
  try{
    const mesFinal=String(req.query.mesFinal??'');
    if(!/^\d{4}-\d{2}$/.test(mesFinal))return res.status(400).json({mensagem:'Informe um mês válido para a análise da DRE'});
    const ano=Number(mesFinal.slice(0,4)),mes=Number(mesFinal.slice(5,7));
    if(ano!==new Date().getFullYear()||mes<1||mes>12)return res.status(400).json({mensagem:'A análise deve usar o ano corrente'});
    const inicio=`${ano}-01-01`,fim=dataMesSeguinte(`${mesFinal}-01`,1);
    const [linhas]=await pool.query<RowDataPacket[]>(`SELECT mes,grupo,categoria,CAST(SUM(valor) AS DOUBLE) AS valor FROM (
      SELECT DATE_FORMAT(data_lancamento,'%Y-%m') AS mes,
        CASE WHEN tipo='ENTRADA' THEN 'RECEITA' ELSE 'DESPESA' END AS grupo,categoria,valor
      FROM lancamentos_financeiros WHERE tipo<>'COMPRA_GADO' AND data_lancamento>=? AND data_lancamento<?
      UNION ALL
      SELECT DATE_FORMAT(v.data_emissao,'%Y-%m'),'DESPESA','Custo de aquisição de gado',COALESCE(a.valor_compra,0)
      FROM vendas v JOIN venda_animais va ON va.venda_id=v.id JOIN animais a ON a.id=va.animal_id
      WHERE v.status='CONCLUIDA' AND v.data_emissao>=? AND v.data_emissao<?
      ) dre GROUP BY mes,grupo,categoria ORDER BY mes,grupo DESC,categoria`,[inicio,fim,inicio,fim]);
    const meses=Array.from({length:mes},(_,i)=>`${ano}-${String(i+1).padStart(2,'0')}`);
    const totais=new Map<string,number>();for(const l of linhas)totais.set(`${l.mes}|${l.grupo}`,(totais.get(`${l.mes}|${l.grupo}`)??0)+Number(l.valor));
    const anteriores=new Map<string,number>();
    const dados=linhas.map(l=>{const valor=Number(l.valor),chave=`${l.grupo}|${l.categoria}`,anterior=anteriores.get(chave)??0;anteriores.set(chave,valor);return{mes:l.mes,grupo:l.grupo,categoria:l.categoria,valor,vertical:totais.get(`${l.mes}|${l.grupo}`)?Number((valor/(totais.get(`${l.mes}|${l.grupo}`)??1)*100).toFixed(2)):0,horizontal:anterior?Number(((valor-anterior)/anterior*100).toFixed(2)):null};});
    res.json({inicio,mesFinal,meses,dados});
  }catch(erro){next(erro);}
});

app.get('/api/financeiro/demonstrativo-vendas',async(req,res,next)=>{try{
  const dataInicio=String(req.query.dataInicio??''),dataFim=String(req.query.dataFim??'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)||!/^\d{4}-\d{2}-\d{2}$/.test(dataFim)||dataInicio>dataFim)
    return res.status(400).json({mensagem:'Informe um período válido para o demonstrativo de vendas'});
  const[linhas]=await pool.query<RowDataPacket[]>(`SELECT a.id,a.brinco,a.sexo,
    DATE_FORMAT(a.data_compra,'%Y-%m-%d') AS dataCompra,DATE_FORMAT(v.data_emissao,'%Y-%m-%d') AS dataVenda,
    TIMESTAMPDIFF(MONTH,a.data_nascimento,v.data_emissao) AS idadeMeses,
    CAST(COALESCE(a.valor_compra,0) AS DOUBLE) AS valorCompra,
    CAST(COALESCE(v.valor_total,0)/NULLIF(COUNT(*) OVER(PARTITION BY v.id),0) AS DOUBLE) AS valorVenda
    FROM vendas v JOIN venda_animais va ON va.venda_id=v.id JOIN animais a ON a.id=va.animal_id
    WHERE v.status='CONCLUIDA' AND v.data_emissao BETWEEN ? AND ? ORDER BY v.data_emissao,a.brinco`,[dataInicio,dataFim]);
  const animais=linhas.map(a=>({...a,id:Number(a.id),idadeMeses:a.idadeMeses===null?null:Number(a.idadeMeses),
    valorCompra:Number(a.valorCompra),valorVenda:Number(a.valorVenda),resultado:Number((Number(a.valorVenda)-Number(a.valorCompra)).toFixed(2))}));
  res.json({dataInicio,dataFim,animais,totalCompras:Number(animais.reduce((t,a)=>t+a.valorCompra,0).toFixed(2)),
    totalVendas:Number(animais.reduce((t,a)=>t+a.valorVenda,0).toFixed(2)),totalResultado:Number(animais.reduce((t,a)=>t+a.resultado,0).toFixed(2))});
}catch(erro){next(erro);}});

app.post('/api/financeiro/lancamentos', async (req, res, next) => {
  try {
    const { contaBancariaId, tipo, categoria, subcategoria, descricao, fornecedorCliente, valor, dataLancamento, dataVencimento, dataEfetivacao, areaId, pastoId, recorrente, quantidadeParcelas } = req.body;
    const descricaoLancamento = tipo === 'COMPRA_GADO' ? String(descricao ?? '').trim() || 'Aquisição de gado' : String(descricao ?? '').trim();
    if (!contaBancariaId || !['ENTRADA','SAIDA','COMPRA_GADO'].includes(tipo) || !String(categoria ?? '').trim() || !descricaoLancamento || !String(fornecedorCliente ?? '').trim() || !(Number(valor) > 0) || !dataLancamento || !dataVencimento) {
      return res.status(400).json({ mensagem: 'Conta, tipo, categoria, fornecedor/cliente, valor total, emissão e vencimento são obrigatórios; a descrição só é obrigatória quando não for compra de gado' });
    }
    if(dataEfetivacao&&dataEfetivacao<dataLancamento)return res.status(400).json({mensagem:'A data de pagamento ou recebimento não pode ser menor que a data de emissão'});
    await validarDataTrava(Number(res.locals.sessao.produtorId),dataLancamento);
    if (tipo === 'ENTRADA' && !areaId) return res.status(400).json({ mensagem: 'Toda receita, incluindo venda de gado, deve estar vinculada a uma área' });
    const parcelas = recorrente ? Number(quantidadeParcelas) : 1;
    if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 120 || (parcelas > 1 && tipo === 'ENTRADA')) return res.status(400).json({ mensagem: 'Informe de 1 a 120 parcelas; recorrência é permitida somente para despesas e compras de gado' });
    const proximoMes = (data: string, meses: number) => {
      const [ano, mes, dia] = data.split('-').map(Number);
      const ultimoDia = new Date(ano, mes + meses, 0).getDate();
      const destino = new Date(ano, mes - 1 + meses, Math.min(dia, ultimoDia));
      return `${destino.getFullYear()}-${String(destino.getMonth() + 1).padStart(2, '0')}-${String(destino.getDate()).padStart(2, '0')}`;
    };
    const conexao = await pool.getConnection();
    const ids: number[] = [];
    try {
      await conexao.beginTransaction();
      for (let indice = 0; indice < parcelas; indice++) {
        const vencimento = proximoMes(dataVencimento, indice);
        const descricaoParcela = parcelas > 1 ? `${descricaoLancamento} (${indice + 1}/${parcelas})` : descricaoLancamento;
        const [resultado] = await conexao.execute<ResultSetHeader>(`INSERT INTO lancamentos_financeiros
          (conta_bancaria_id,tipo,categoria,subcategoria,descricao,fornecedor_cliente,valor,data_vencimento,data_efetivacao,data_lancamento,area_id,pasto_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [contaBancariaId,tipo,String(categoria).trim(),String(subcategoria??'').trim().slice(0,100)||null,descricaoParcela,String(fornecedorCliente).trim(),Number(valor),vencimento,indice === 0 ? dataEfetivacao||null : null,dataLancamento,areaId||null,pastoId||null]);
        ids.push(resultado.insertId);
      }
      await conexao.commit();
    } catch (erro) { await conexao.rollback(); throw erro; } finally { conexao.release(); }
    res.status(201).json({ id: ids[0], ids, quantidade: ids.length });
  } catch (erro) { next(erro); }
});

app.put('/api/financeiro/lancamentos/:id', async (req, res, next) => {
  try {
    const { contaBancariaId, tipo, categoria, subcategoria, descricao, fornecedorCliente, valor, dataLancamento, dataVencimento, dataEfetivacao, areaId, pastoId } = req.body;
    const[atuais]=await pool.query<RowDataPacket[]>(`SELECT DATE_FORMAT(COALESCE(v.data_emissao,l.data_lancamento),'%Y-%m-%d') AS dataEmissao FROM lancamentos_financeiros l LEFT JOIN vendas v ON v.id=l.venda_id WHERE l.id=?`,[req.params.id]);
    if(!atuais[0])return res.status(404).json({mensagem:'Lançamento financeiro não encontrado'});
    const emissao=String(dataLancamento||atuais[0].dataEmissao);
    if(dataEfetivacao&&dataEfetivacao<emissao)return res.status(400).json({mensagem:'A data de pagamento ou recebimento não pode ser menor que a data de emissão'});
    await validarDataTrava(Number(res.locals.sessao.produtorId),String(atuais[0].dataEmissao));
    const descricaoLancamento = tipo === 'COMPRA_GADO' ? String(descricao ?? '').trim() || 'Aquisição de gado' : String(descricao ?? '').trim();
    if (!contaBancariaId || !['ENTRADA','SAIDA','COMPRA_GADO'].includes(tipo) || !String(categoria ?? '').trim() || !descricaoLancamento || !String(fornecedorCliente ?? '').trim() || !(Number(valor) > 0) || !dataVencimento) return res.status(400).json({ mensagem: 'Conta, tipo, categoria, fornecedor/cliente, valor total e vencimento são obrigatórios; a descrição só é obrigatória quando não for compra de gado' });
    if (tipo === 'ENTRADA' && !areaId) return res.status(400).json({ mensagem: 'Toda receita, incluindo venda de gado, deve estar vinculada a uma área' });
    const [resultado] = await pool.execute<ResultSetHeader>(`UPDATE lancamentos_financeiros SET conta_bancaria_id=?,tipo=?,categoria=?,subcategoria=?,descricao=?,fornecedor_cliente=?,valor=?,data_lancamento=?,data_vencimento=?,data_efetivacao=?,area_id=?,pasto_id=? WHERE id=?`,
      [contaBancariaId,tipo,String(categoria).trim(),String(subcategoria??'').trim().slice(0,100)||null,descricaoLancamento,String(fornecedorCliente).trim(),Number(valor),emissao,dataVencimento,dataEfetivacao||null,areaId||null,pastoId||null,req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Lançamento financeiro não encontrado' });
    res.json({ id: Number(req.params.id) });
  } catch (erro) { next(erro); }
});

app.delete('/api/financeiro/lancamentos/:id', async (req, res, next) => {
  try {
    const[atuais]=await pool.query<RowDataPacket[]>(`SELECT DATE_FORMAT(data_lancamento,'%Y-%m-%d') AS dataLancamento FROM lancamentos_financeiros WHERE id=?`,[req.params.id]);
    if(!atuais[0])return res.status(404).json({mensagem:'Lançamento financeiro não encontrado'});
    await validarDataTrava(Number(res.locals.sessao.produtorId),String(atuais[0].dataLancamento));
    const [resultado] = await pool.execute<ResultSetHeader>('DELETE FROM lancamentos_financeiros WHERE id = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ mensagem: 'Lançamento financeiro não encontrado' });
    res.status(204).send();
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/custos-localizacao', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT ar.id AS areaId,ar.nome AS areaNome,ar.inscricao,
      p.id AS pastoId,p.nome AS pastoNome,CAST(SUM(l.valor) AS DOUBLE) AS custo
      FROM lancamentos_financeiros l JOIN areas ar ON ar.id=l.area_id LEFT JOIN pastos p ON p.id=l.pasto_id
      WHERE l.tipo IN ('SAIDA','COMPRA_GADO') GROUP BY ar.id,p.id ORDER BY ar.nome,p.nome`);
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.get('/api/financeiro/fluxo-caixa', async (_req, res, next) => {
  try {
    const [linhas] = await pool.query<RowDataPacket[]>(`SELECT id,tipo,fornecedor,
      DATE_FORMAT(data_vencimento,'%Y-%m-%d') AS dataVencimento,CAST(valor AS DOUBLE) AS valor
      FROM titulos_financeiros ORDER BY data_vencimento,id`);
    res.json(linhas);
  } catch (erro) { next(erro); }
});

app.post('/api/financeiro/fluxo-caixa', async (req, res, next) => {
  try {
    const { tipo, fornecedor, dataVencimento, valor } = req.body;
    if (!['RECEBER','PAGAR'].includes(tipo) || !String(fornecedor ?? '').trim() || !dataVencimento || !(Number(valor) > 0)) {
      return res.status(400).json({ mensagem: 'Tipo, fornecedor, data de vencimento e valor são obrigatórios' });
    }
    await validarDataTrava(Number(res.locals.sessao.produtorId),dataVencimento);
    const [resultado] = await pool.execute<ResultSetHeader>(`INSERT INTO titulos_financeiros
      (tipo,fornecedor,data_vencimento,valor) VALUES (?,?,?,?)`, [tipo,String(fornecedor).trim(),dataVencimento,Number(valor)]);
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) { next(erro); }
});

app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (erro instanceof ZodError) {
    return res.status(400).json({ mensagem: 'Dados inválidos', erros: erro.flatten().fieldErrors });
  }
  const mysqlErro = erro as { code?: string };
  if (erro instanceof Error && erro.message === 'VENDA_SEM_DADOS_FINANCEIROS') {
    return res.status(400).json({ mensagem: 'Informe o valor da venda e a conta bancária de recebimento' });
  }
  if(erro instanceof Error&&erro.message==='SMTP_NAO_CONFIGURADO')return res.status(503).json({mensagem:'O envio de e-mail ainda não foi configurado no servidor.'});
  if (erro instanceof Error && erro.message === 'PASTO_DESTINO_INEXISTENTE') {
    return res.status(404).json({ mensagem: 'Pasto de destino não encontrado' });
  }
  if(erro instanceof Error&&erro.message==='PASTO_ORIGEM_INEXISTENTE')return res.status(404).json({mensagem:'Pasto original não encontrado'});
  if (erro instanceof Error && erro.message === 'ANIMAIS_TRANSFERENCIA_INVALIDOS') {
    return res.status(400).json({ mensagem: 'Um ou mais animais não existem ou não estão ativos' });
  }
  if (erro instanceof Error && erro.message === 'NOTA_FISCAL_DUPLICADA') {
    return res.status(409).json({ mensagem: 'Esta nota fiscal já foi lançada anteriormente' });
  }
  if (erro instanceof Error && erro.message === 'VENDA_DADOS_INVALIDOS') return res.status(400).json({ mensagem: 'Informe inscrição, nota fiscal, comprador, documento, data de emissão e ao menos um animal' });
  if (erro instanceof Error && erro.message === 'VENDA_FINANCEIRO_INCOMPLETO') return res.status(400).json({ mensagem: 'Confira o valor, o vencimento, a quantidade de parcelas e a conta bancária informados' });
  if (erro instanceof Error && erro.message === 'VENDA_ANIMAIS_INVALIDOS') return res.status(400).json({ mensagem: 'Os animais devem estar ativos, disponíveis e pertencer à inscrição selecionada' });
  if (erro instanceof Error && erro.message === 'VENDA_QUANTIDADE_DIVERGENTE') return res.status(400).json({ mensagem: 'A quantidade de animais da nota fiscal deve ser igual à quantidade de brincos selecionados para baixa' });
  if (erro instanceof Error && erro.message === 'VENDA_JA_RECEBIDA') return res.status(409).json({ mensagem: 'A venda possui parcela recebida; ajuste o recebimento no Financeiro' });
  if(erro instanceof Error&&erro.message.startsWith('PERIODO_TRAVADO:'))return res.status(423).json({mensagem:`O período financeiro está travado até ${erro.message.split(':')[1]}. Não é permitido incluir, alterar ou excluir movimentações nessa data ou anteriormente.`});
  if (mysqlErro.code === 'ER_DUP_ENTRY') {
    const detalhe=String((erro as {sqlMessage?:string}).sqlMessage??'');
    if(detalhe.includes('uq_venda_nota_inscricao')) return res.status(409).json({ mensagem: 'Esta nota fiscal já foi usada em uma venda nesta inscrição' });
    if(detalhe.includes('uq_animal_vendido')) return res.status(409).json({ mensagem: 'Um dos animais selecionados já está vinculado a outra venda' });
    return res.status(409).json({ mensagem: 'Já existe um registro com esses dados' });
  }
  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

const porta = Number(process.env.PORT ?? 3000);
app.listen(porta, () => console.log(`API AgroSys disponível na porta ${porta}`));
