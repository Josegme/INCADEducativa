export type NurturingDia = 1 | 3 | 7;
export type NurturingFlagColumn = "nurturing_d1_enviado" | "nurturing_d3_enviado" | "nurturing_d7_enviado";

export interface NurturingMilestone {
  dias: NurturingDia;
  flagColumn: NurturingFlagColumn;
}

/**
 * Secuencia de nurturing post-taller gratuito (T12, `resolver_loop1.md`).
 * Orden ascendente a propósito: el cron procesa d1 antes que d3/d7 así un
 * lead recién creado no salta directo al mail de día 7 si el cron estuvo
 * caído varios días.
 */
export const NURTURING_MILESTONES: NurturingMilestone[] = [
  { dias: 1, flagColumn: "nurturing_d1_enviado" },
  { dias: 3, flagColumn: "nurturing_d3_enviado" },
  { dias: 7, flagColumn: "nurturing_d7_enviado" },
];

/**
 * "Al menos N días desde el alta", no una ventana angosta — a diferencia de
 * los recordatorios de Coworking/Tutorías (que apuntan a un instante futuro
 * exacto), acá lo que importa es no perder el envío si el cron estuvo caído,
 * no la precisión horaria. Idempotente vía el flag de la milestone, nunca
 * duplica.
 */
export function isNurturingDue(createdAt: Date, dias: NurturingDia, now: Date = new Date()): boolean {
  const thresholdMs = createdAt.getTime() + dias * 24 * 60 * 60 * 1000;
  return now.getTime() >= thresholdMs;
}

export interface NurturingEmailContent {
  subject: string;
  html: string;
}

/**
 * Copy borrador ES/AR, tono institucional INCADE — pendiente de revisión
 * del usuario (T12, `resolver_loop1.md`: "no se aprueba tácitamente por
 * default"), ver `docs/design/COMPONENTS.md` para el detalle y el estado
 * de aprobación.
 */
export function nurturingEmailContent(dias: NurturingDia, nombre: string): NurturingEmailContent {
  const saludo = nombre ? `Hola ${nombre}` : "Hola";

  switch (dias) {
    case 1:
      return {
        subject: "Gracias por sumarte al taller — INCADE",
        html: `<p>${saludo},</p><p>Gracias por registrarte en nuestro taller gratuito. Esperamos que te haya sido útil.</p><p>Si te interesó, en INCADE tenés cursos y carreras completas para seguir formándote. Cuando quieras, date una vuelta por nuestro catálogo.</p><p>Un saludo,<br/>Equipo INCADE</p>`,
      };
    case 3:
      return {
        subject: "Cursos que te pueden interesar — INCADE",
        html: `<p>${saludo},</p><p>Te dejamos algunos de los cursos más elegidos de nuestro catálogo educativo, por si querés seguir aprendiendo con nosotros.</p><p>Podés verlos completos en <a href="https://incadeducativa.com/cursos">incadeducativa.com/cursos</a>.</p><p>Un saludo,<br/>Equipo INCADE</p>`,
      };
    case 7:
      return {
        subject: "¿Seguimos en contacto? — INCADE",
        html: `<p>${saludo},</p><p>Esperamos que el taller te haya servido. Si querés seguir cerca de INCADE, sumate a nuestra comunidad: te avisamos de nuevos talleres, cursos y contenido.</p><p>Nos encontrás en <a href="https://incadeducativa.com/cursos">incadeducativa.com</a> cuando quieras.</p><p>Un saludo,<br/>Equipo INCADE</p>`,
      };
  }
}
