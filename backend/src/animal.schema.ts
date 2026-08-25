import { z } from 'zod';

const textoOpcional = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional().transform((v) => v || null);

export const animalSchema = z.object({
  brinco: z.string().trim().min(1, 'O brinco é obrigatório').max(30),
  nome: textoOpcional(100),
  especie: z.string().trim().min(1, 'A espécie é obrigatória').max(50),
  raca: textoOpcional(80),
  sexo: z.enum(['M', 'F']),
  dataNascimento: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  dataCompra: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  dataVencimentoCompra: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  contaPagamentoId: z.union([z.number().int().positive(), z.null()]).optional(),
  valorCompra: z.union([z.number().positive().max(9999999999.99), z.null()]).optional(),
  fornecedor: z.string().trim().min(1, 'O fornecedor é obrigatório').max(150),
  numeroNotaFiscal: textoOpcional(60),
  peso: z.union([z.number().positive().max(99999999.99), z.null()]).optional(),
  status: z.enum(['ATIVO', 'VENDIDO', 'MORTO']).default('ATIVO'),
  areaId: z.number().int().positive('A inscrição é obrigatória'),
  pastoId: z.number().int().positive('O pasto é obrigatório'),
  valorVenda: z.union([z.number().positive(), z.null()]).optional(),
  contaBancariaId: z.union([z.number().int().positive(), z.null()]).optional(),
  observacoes: textoOpcional(2000)
});

export const loteAnimalSchema = z.object({
  quantidade: z.number().int().min(1).max(1000),
  prefixoBrinco: z.string().trim().min(1).max(20),
  numeroInicial: z.number().int().min(1).max(999999999).default(1),
  nome: textoOpcional(100),
  especie: z.string().trim().min(1).max(50),
  raca: textoOpcional(80),
  sexo: z.enum(['M', 'F']),
  dataNascimento: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  dataCompra: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  financeiroPendente: z.boolean().default(false),
  dataVencimentoCompra: z.union([z.string().date(), z.literal(''), z.null()]).optional().transform((v) => v || null),
  contaPagamentoId: z.union([z.number().int().positive(), z.null()]).optional(),
  valorCompra: z.union([z.number().positive().max(9999999999.99), z.null()]).optional(),
  fornecedor: z.string().trim().min(1, 'O fornecedor é obrigatório').max(150),
  numeroNotaFiscal: textoOpcional(60),
  pesoMedio: z.number().positive().max(99999999.99),
  status: z.enum(['ATIVO', 'VENDIDO', 'MORTO']).default('ATIVO'),
  valorVenda: z.union([z.number().positive(), z.null()]).optional(),
  contaBancariaId: z.union([z.number().int().positive(), z.null()]).optional(),
  areaId: z.number().int().positive('A inscrição é obrigatória'),
  pastoId: z.number().int().positive('O pasto é obrigatório'),
  observacoes: textoOpcional(2000)
}).superRefine((lote, contexto) => {
  if (lote.financeiroPendente) return;
  if (!lote.valorCompra) contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['valorCompra'], message: 'O valor total da compra é obrigatório' });
  if (!lote.dataVencimentoCompra) contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['dataVencimentoCompra'], message: 'A data de vencimento da compra é obrigatória' });
  if (!lote.contaPagamentoId) contexto.addIssue({ code: z.ZodIssueCode.custom, path: ['contaPagamentoId'], message: 'A conta de pagamento é obrigatória' });
});

export const transferenciaAnimaisSchema = z.object({
  animalIds: z.array(z.number().int().positive()).min(1, 'Selecione ao menos um animal').max(1000),
  areaDestinoId: z.number().int().positive('Selecione a inscrição de destino'),
  pastoDestinoId: z.number().int().positive('Selecione o pasto de destino')
}).transform((dados) => ({ ...dados, animalIds: [...new Set(dados.animalIds)] }));

export type AnimalInput = z.infer<typeof animalSchema>;
