import { z } from "zod";

// Schemas de validação
export const LoginSchema = z.object({
  username: z.string().min(1).max(80),
  password: z.string().min(1).max(120)
});

export const IdSchema = z.string().uuid();

export const UpdateProductSchema = z.object({
  id: z.string().uuid(),
  updates: z.object({
    name: z.string().min(1).max(120).optional(),
    price: z.number().nonnegative().optional()
  })
});

export const MovementSchema = z.object({
  product_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  // Destino pode existir só se for transferência, não é obrigatório
  destination_branch_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(999999), // limite pra evitar enviar "1 milhão" por acidente
  type: z.enum(["entrada", "saida"]),
  notes: z.string().max(500).optional(),           // protege contra entrada gigante
  invoice_number: z.string().max(64).optional(),   // protege contra colisão de XML & injeções
});

export const ProductSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  code: z.string().min(2, "Código obrigatório"),
  description: z.string().optional(),
  unit: z.string().min(2, "Unidade obrigatória"),
  department: z.enum(["rh", "transferencia", ""])
});

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  role: z.enum(["admin", "operator", "manager"]).default("operator"),
  department: z.string().nullable().optional().transform(val => val ?? null),
  branchId: z.string().uuid("branchId inválido"),
});

export const BranchSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório").max(10, "Código muito longo"),
});

export const ReportFilterSchema = z.object({
  branchId: z.string().uuid().or(z.literal("all")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
