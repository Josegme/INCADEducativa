import { z } from "zod";

export const USER_ROLES = ["admin", "docente", "alumno", "coordinador", "comunidad", "lead"] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const ROLE_LABEL: Record<UserRoleValue, string> = {
  admin: "Administrador",
  docente: "Docente",
  alumno: "Alumno INCADE",
  coordinador: "Coordinador",
  comunidad: "Comunidad",
  lead: "Lead",
};

export const convertRoleSchema = z
  .object({
    userId: z.string().uuid(),
    newRole: z.enum(USER_ROLES),
    carreraId: z.string().trim().optional(),
    dni: z.string().trim().optional(),
  })
  .refine((data) => data.newRole !== "alumno" || !!data.carreraId, {
    message: "Elegí una carrera para convertir a Alumno INCADE",
    path: ["carreraId"],
  })
  .refine((data) => data.newRole !== "alumno" || !!data.dni, {
    message: "Ingresá el DNI para convertir a Alumno INCADE",
    path: ["dni"],
  });

export interface RoleHistoryEntry {
  from: UserRoleValue;
  to: UserRoleValue;
  at: string;
  by: string;
}
