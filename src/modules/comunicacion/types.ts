export type NotificationType =
  | "announcement"
  | "tutoria"
  | "correccion"
  | "contenido_publicado"
  | "certificado"
  | "puntos"
  | "pago"
  | "sistema"
  | "reserva";

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  announcement: "Anuncio",
  tutoria: "Tutoría",
  correccion: "Corrección",
  contenido_publicado: "Contenido publicado",
  certificado: "Certificado",
  puntos: "Puntos",
  pago: "Pago",
  sistema: "Sistema",
  reserva: "Reserva",
};

export interface NotificationRow {
  id: string;
  tipo: NotificationType;
  course_id: string | null;
  referencia_id: string | null;
  titulo: string;
  cuerpo: string | null;
  leida: boolean;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  course_id: string;
  sender_id: string;
  titulo: string | null;
  body: string;
  attachment_url: string | null;
  created_at: string;
  sender_nombre: string;
  sender_apellido: string;
}
