import { z } from "zod";
import departments from "../shared/config/departments.json";

export const DepartmentSchema = z.enum(
  departments.allowed.map(d => d.id) as [string, ...string[]]
);

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
  type: z.enum(["entrada", "saida", "all"]),
  notes: z.string().max(500).optional(),           // protege contra entrada gigante
  invoice_number: z.string().max(64).optional(),   // protege contra colisão de XML & injeções
});

export const ProductSchema = z.object({
  name: z.string().min(3, "Nome obrigatório e com pelo menos 3 caracteres"),
  code: z.string().min(2, "Código obrigatório e com pelo menos 2 caracteres"),
  description: z.string().optional(),
  unit: z.string().min(2, "Unidade obrigatória e com pelo menos 2 caracteres"),
  department: DepartmentSchema
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
  name: z.string().min(2, "Nome é obrigatório e deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  code: z.string().min(1, "Código é obrigatório").max(10, "Código muito longo"),
});

export const ReportFilterSchema = z.object({
  branchId: z.string().uuid().or(z.literal("all")).default("all"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(50),
  type: z.enum(["entrada", "saida", "all"]).default("all"),
});
