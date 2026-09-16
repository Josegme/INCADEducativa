import { z } from "zod";

export const registerFieldsSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().trim().email("Ingresá un email válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type RegisterFieldsValues = z.infer<typeof registerFieldsSchema>;
