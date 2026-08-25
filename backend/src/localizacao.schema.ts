import { z } from 'zod';

export const areaSchema = z.object({
  nome: z.string().trim().min(1, 'O nome da área é obrigatório').max(100),
  inscricao: z.string().trim().min(1, 'A inscrição é obrigatória').max(80)
});

export const pastoSchema = z.object({
  areaIds: z.array(z.number().int().positive()).min(1, 'Selecione ao menos uma inscrição'),
  nome: z.string().trim().min(1, 'O nome do pasto é obrigatório').max(100),
  capacidade: z.union([z.number().int().positive(), z.null()]).optional()
});
