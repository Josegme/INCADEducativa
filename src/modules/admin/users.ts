import { z } from "zod";

export const userEditFormSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  dni: z.string().trim().optional(),
  carreraId: z.string().trim().optional(),
});

export type UserEditFormValues = z.infer<typeof userEditFormSchema>;
