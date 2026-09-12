export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachment_url: string | null
          body: string
          course_id: string
          created_at: string
          id: string
          sender_id: string | null
          titulo: string | null
        }
        Insert: {
          attachment_url?: string | null
          body: string
          course_id: string
          created_at?: string
          id?: string
          sender_id?: string | null
          titulo?: string | null
        }
        Update: {
          attachment_url?: string | null
          body?: string
          course_id?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accion: string
          created_at: string
          detalle: Json | null
          entidad: string
          entidad_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string
          detalle?: Json | null
          entidad: string
          entidad_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string
          detalle?: Json | null
          entidad?: string
          entidad_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          descuento_pct: number
          estado: Database["public"]["Enums"]["booking_status"]
          fecha_fin: string
          fecha_inicio: string
          id: string
          monto: number
          monto_pagado: number
          sena_pct: number
          sena_vence_at: string | null
          no_show_notificado: boolean
          notas: string | null
          recordatorio_enviado: boolean
          space_id: string
          telefono_contacto: string | null
          tipo_descuento: Database["public"]["Enums"]["discount_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          descuento_pct?: number
          estado?: Database["public"]["Enums"]["booking_status"]
          fecha_fin: string
          fecha_inicio: string
          id?: string
          monto: number
          monto_pagado?: number
          sena_pct?: number
          sena_vence_at?: string | null
          no_show_notificado?: boolean
          notas?: string | null
          recordatorio_enviado?: boolean
          space_id: string
          telefono_contacto?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          descuento_pct?: number
          estado?: Database["public"]["Enums"]["booking_status"]
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          monto?: number
          monto_pagado?: number
          sena_pct?: number
          sena_vence_at?: string | null
          no_show_notificado?: boolean
          notas?: string | null
          recordatorio_enviado?: boolean
          space_id?: string
          telefono_contacto?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      career_certificates: {
        Row: {
          carrera_id: string
          emitido_at: string
          estado: Database["public"]["Enums"]["certificate_status"]
          id: string
          pdf_url: string | null
          user_id: string
          uuid_verificacion: string
        }
        Insert: {
          carrera_id: string
          emitido_at?: string
          estado?: Database["public"]["Enums"]["certificate_status"]
          id?: string
          pdf_url?: string | null
          user_id: string
          uuid_verificacion?: string
        }
        Update: {
          carrera_id?: string
          emitido_at?: string
          estado?: Database["public"]["Enums"]["certificate_status"]
          id?: string
          pdf_url?: string | null
          user_id?: string
          uuid_verificacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_certificates_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      careers: {
        Row: {
          activa: boolean
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
          plan_version: string | null
          resolucion: string | null
          duracion_anios: number | null
          titulo_otorga: string | null
          slug: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number
          plan_version?: string | null
          resolucion?: string | null
          duracion_anios?: number | null
          titulo_otorga?: string | null
          slug: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
          plan_version?: string | null
          resolucion?: string | null
          duracion_anios?: number | null
          titulo_otorga?: string | null
          slug?: string
        }
        Relationships: []
      }
      course_careers: {
        Row: {
          course_id: string
          career_id: string
          created_at: string
        }
        Insert: {
          course_id: string
          career_id: string
          created_at?: string
        }
        Update: {
          course_id?: string
          career_id?: string
          created_at?: string
        }
        Relationships: []
      }
      catalogo_planes: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          precio: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          precio: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          precio?: number
        }
        Relationships: []
      }
      catalogo_suscripciones: {
        Row: {
          activa: boolean
          created_at: string
          descuento_pct: number
          fin: string | null
          id: string
          inicio: string | null
          monto: number
          mp_preapproval_id: string | null
          plan_id: string | null
          tipo_descuento: Database["public"]["Enums"]["discount_type"]
          user_id: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          descuento_pct?: number
          fin?: string | null
          id?: string
          inicio?: string | null
          monto: number
          mp_preapproval_id?: string | null
          plan_id?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          descuento_pct?: number
          fin?: string | null
          id?: string
          inicio?: string | null
          monto?: number
          mp_preapproval_id?: string | null
          plan_id?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_suscripciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "catalogo_planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogo_suscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogo_suscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          course_id: string
          emitido_at: string
          estado: Database["public"]["Enums"]["certificate_status"]
          id: string
          nombre_override: string | null
          pdf_url: string | null
          user_id: string
          uuid_verificacion: string
        }
        Insert: {
          course_id: string
          emitido_at?: string
          estado?: Database["public"]["Enums"]["certificate_status"]
          id?: string
          nombre_override?: string | null
          pdf_url?: string | null
          user_id: string
          uuid_verificacion?: string
        }
        Update: {
          course_id?: string
          emitido_at?: string
          estado?: Database["public"]["Enums"]["certificate_status"]
          id?: string
          nombre_override?: string | null
          pdf_url?: string | null
          user_id?: string
          uuid_verificacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          booking_id: string
          id: string
          metodo: Database["public"]["Enums"]["checkin_method"]
          registrado_por: string | null
          timestamp: string
        }
        Insert: {
          booking_id: string
          id?: string
          metodo?: Database["public"]["Enums"]["checkin_method"]
          registrado_por?: string | null
          timestamp?: string
        }
        Update: {
          booking_id?: string
          id?: string
          metodo?: Database["public"]["Enums"]["checkin_method"]
          registrado_por?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compras_curso: {
        Row: {
          course_id: string
          created_at: string
          descuento_pct: number
          estado: string
          id: string
          monto: number
          mp_payment_id: string | null
          mp_preference_id: string | null
          tipo_descuento: Database["public"]["Enums"]["discount_type"]
          user_id: string
          webhook_payload: Json | null
        }
        Insert: {
          course_id: string
          created_at?: string
          descuento_pct?: number
          estado?: string
          id?: string
          monto: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id: string
          webhook_payload?: Json | null
        }
        Update: {
          course_id?: string
          created_at?: string
          descuento_pct?: number
          estado?: string
          id?: string
          monto?: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          tipo_descuento?: Database["public"]["Enums"]["discount_type"]
          user_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compras_curso_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_curso_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compras_curso_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          admin_id: string | null
          comentario: string | null
          course_id: string
          created_at: string
          docente_id: string
          estado: Database["public"]["Enums"]["review_status"]
          id: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          comentario?: string | null
          course_id: string
          created_at?: string
          docente_id: string
          estado?: Database["public"]["Enums"]["review_status"]
          id?: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          comentario?: string | null
          course_id?: string
          created_at?: string
          docente_id?: string
          estado?: Database["public"]["Enums"]["review_status"]
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          descuento_pct: number
          id: string
          usos_actuales: number
          usos_maximos: number | null
          valido_desde: string
          valido_hasta: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          descuento_pct: number
          id?: string
          usos_actuales?: number
          usos_maximos?: number | null
          valido_desde: string
          valido_hasta: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          descuento_pct?: number
          id?: string
          usos_actuales?: number
          usos_maximos?: number | null
          valido_desde?: string
          valido_hasta?: string
        }
        Relationships: []
      }
      course_coordinadores: {
        Row: {
          coordinador_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          coordinador_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          coordinador_id?: string
          course_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_coordinadores_coordinador_id_fkey"
            columns: ["coordinador_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_coordinadores_coordinador_id_fkey"
            columns: ["coordinador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_coordinadores_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          carrera_id: string | null
          created_at: string
          descripcion: string | null
          docente_id: string | null
          duracion_hs: number | null
          es_gratuito: boolean
          estado: Database["public"]["Enums"]["course_status"]
          id: string
          imagen_url: string | null
          nivel: string | null
          precio: number
          precio_tutorias_addon: number
          revisado_at: string | null
          revisado_por: string | null
          revision_comentario: string | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          carrera_id?: string | null
          created_at?: string
          descripcion?: string | null
          docente_id?: string | null
          duracion_hs?: number | null
          es_gratuito?: boolean
          estado?: Database["public"]["Enums"]["course_status"]
          id?: string
          imagen_url?: string | null
          nivel?: string | null
          precio?: number
          precio_tutorias_addon?: number
          revisado_at?: string | null
          revisado_por?: string | null
          revision_comentario?: string | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          carrera_id?: string | null
          created_at?: string
          descripcion?: string | null
          docente_id?: string | null
          duracion_hs?: number | null
          es_gratuito?: boolean
          estado?: Database["public"]["Enums"]["course_status"]
          id?: string
          imagen_url?: string | null
          nivel?: string | null
          precio?: number
          precio_tutorias_addon?: number
          revisado_at?: string | null
          revisado_por?: string | null
          revision_comentario?: string | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_revisado_por_fkey"
            columns: ["revisado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          estado: Database["public"]["Enums"]["enrollment_status"]
          fecha_completado: string | null
          fecha_inscripcion: string
          id: string
          progreso_pct: number
          periodo_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          estado?: Database["public"]["Enums"]["enrollment_status"]
          fecha_completado?: string | null
          fecha_inscripcion?: string
          id?: string
          progreso_pct?: number
          periodo_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          estado?: Database["public"]["Enums"]["enrollment_status"]
          fecha_completado?: string | null
          fecha_inscripcion?: string
          id?: string
          progreso_pct?: number
          periodo_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_attempts: {
        Row: {
          aprobado: boolean | null
          created_at: string
          estado: Database["public"]["Enums"]["attempt_state"]
          evaluation_id: string
          id: string
          intento_num: number
          nota: number | null
          respuestas: Json
          score_auto: number | null
          score_manual: number | null
          user_id: string
        }
        Insert: {
          aprobado?: boolean | null
          created_at?: string
          estado?: Database["public"]["Enums"]["attempt_state"]
          evaluation_id: string
          id?: string
          intento_num?: number
          nota?: number | null
          respuestas?: Json
          score_auto?: number | null
          score_manual?: number | null
          user_id: string
        }
        Update: {
          aprobado?: boolean | null
          created_at?: string
          estado?: Database["public"]["Enums"]["attempt_state"]
          evaluation_id?: string
          id?: string
          intento_num?: number
          nota?: number | null
          respuestas?: Json
          score_auto?: number | null
          score_manual?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_submissions: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["submission_state"]
          evaluation_id: string
          file_url: string | null
          id: string
          submission_url: string | null
          texto: string | null
          tipo_entrega: Database["public"]["Enums"]["submission_kind"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["submission_state"]
          evaluation_id: string
          file_url?: string | null
          id?: string
          submission_url?: string | null
          texto?: string | null
          tipo_entrega: Database["public"]["Enums"]["submission_kind"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["submission_state"]
          evaluation_id?: string
          file_url?: string | null
          id?: string
          submission_url?: string | null
          texto?: string | null
          tipo_entrega?: Database["public"]["Enums"]["submission_kind"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_submissions_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          config: Json
          course_id: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string | null
          nota_minima: number
          preguntas: Json
          tipo: Database["public"]["Enums"]["evaluation_type"]
          titulo: string
        }
        Insert: {
          config?: Json
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          nota_minima?: number
          preguntas?: Json
          tipo?: Database["public"]["Enums"]["evaluation_type"]
          titulo: string
        }
        Update: {
          config?: Json
          course_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          nota_minima?: number
          preguntas?: Json
          tipo?: Database["public"]["Enums"]["evaluation_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          activo: boolean
          flag: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          flag: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          flag?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      foro_publicaciones: {
        Row: {
          autor_id: string
          carrera_id: string | null
          contenido: string
          created_at: string
          id: string
          oculto: boolean
          oculto_at: string | null
          oculto_por: string | null
        }
        Insert: {
          autor_id: string
          carrera_id?: string | null
          contenido: string
          created_at?: string
          id?: string
          oculto?: boolean
          oculto_at?: string | null
          oculto_por?: string | null
        }
        Update: {
          autor_id?: string
          carrera_id?: string | null
          contenido?: string
          created_at?: string
          id?: string
          oculto?: boolean
          oculto_at?: string | null
          oculto_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foro_publicaciones_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foro_publicaciones_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foro_publicaciones_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foro_publicaciones_oculto_por_fkey"
            columns: ["oculto_por"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foro_publicaciones_oculto_por_fkey"
            columns: ["oculto_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_attachments: {
        Row: {
          archivo_url: string
          created_at: string
          id: string
          lesson_id: string
          orden: number
          titulo: string
        }
        Insert: {
          archivo_url: string
          created_at?: string
          id?: string
          lesson_id: string
          orden?: number
          titulo: string
        }
        Update: {
          archivo_url?: string
          created_at?: string
          id?: string
          lesson_id?: string
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_attachments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completada: boolean
          id: string
          lesson_id: string
          tiempo_visto_seg: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completada?: boolean
          id?: string
          lesson_id: string
          tiempo_visto_seg?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completada?: boolean
          id?: string
          lesson_id?: string
          tiempo_visto_seg?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          contenido_text: string | null
          contenido_url: string | null
          created_at: string
          duracion_min: number | null
          id: string
          module_id: string
          orden: number
          publicada: boolean
          tipo: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Insert: {
          contenido_text?: string | null
          contenido_url?: string | null
          created_at?: string
          duracion_min?: number | null
          id?: string
          module_id: string
          orden?: number
          publicada?: boolean
          tipo?: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Update: {
          contenido_text?: string | null
          contenido_url?: string | null
          created_at?: string
          duracion_min?: number | null
          id?: string
          module_id?: string
          orden?: number
          publicada?: boolean
          tipo?: Database["public"]["Enums"]["lesson_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          activa: boolean
          created_at: string
          direccion: string
          id: string
          nombre: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          direccion: string
          id?: string
          nombre: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          direccion?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      maintenance_incidents: {
        Row: {
          created_at: string
          descripcion: string
          id: string
          reportada_por: string | null
          resuelta: boolean
          resuelta_at: string | null
          space_id: string
        }
        Insert: {
          created_at?: string
          descripcion: string
          id?: string
          reportada_por?: string | null
          resuelta?: boolean
          resuelta_at?: string | null
          space_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string
          id?: string
          reportada_por?: string | null
          resuelta?: boolean
          resuelta_at?: string | null
          space_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_incidents_reportada_por_fkey"
            columns: ["reportada_por"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_incidents_reportada_por_fkey"
            columns: ["reportada_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_incidents_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_corrections: {
        Row: {
          attempt_id: string
          comentario: string | null
          corregido_por: string
          created_at: string
          id: string
          nota_parcial: number
        }
        Insert: {
          attempt_id: string
          comentario?: string | null
          corregido_por: string
          created_at?: string
          id?: string
          nota_parcial: number
        }
        Update: {
          attempt_id?: string
          comentario?: string | null
          corregido_por?: string
          created_at?: string
          id?: string
          nota_parcial?: number
        }
        Relationships: [
          {
            foreignKeyName: "manual_corrections_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "evaluation_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_corrections_corregido_por_fkey"
            columns: ["corregido_por"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_corrections_corregido_por_fkey"
            columns: ["corregido_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          activo: boolean
          created_at: string
          creditos_incluidos: number
          id: string
          nombre: string
          precio: number
          tipo: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          creditos_incluidos: number
          id?: string
          nombre: string
          precio: number
          tipo: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          creditos_incluidos?: number
          id?: string
          nombre?: string
          precio?: number
          tipo?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          activa: boolean
          created_at: string
          creditos_restantes: number
          fin: string | null
          id: string
          inicio: string | null
          mp_preapproval_id: string | null
          plan_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          creditos_restantes?: number
          fin?: string | null
          id?: string
          inicio?: string | null
          mp_preapproval_id?: string | null
          plan_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          creditos_restantes?: number
          fin?: string | null
          id?: string
          inicio?: string | null
          mp_preapproval_id?: string | null
          plan_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          descripcion: string | null
          id: string
          orden: number
          titulo: string
        }
        Insert: {
          course_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number
          titulo: string
        }
        Update: {
          course_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          orden?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          canal: Database["public"]["Enums"]["notification_channel"]
          course_id: string | null
          created_at: string
          cuerpo: string | null
          id: string
          leida: boolean
          referencia_id: string | null
          sender_id: string | null
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
          user_id: string
        }
        Insert: {
          canal?: Database["public"]["Enums"]["notification_channel"]
          course_id?: string | null
          created_at?: string
          cuerpo?: string | null
          id?: string
          leida?: boolean
          referencia_id?: string | null
          sender_id?: string | null
          tipo: Database["public"]["Enums"]["notification_type"]
          titulo: string
          user_id: string
        }
        Update: {
          canal?: Database["public"]["Enums"]["notification_channel"]
          course_id?: string | null
          created_at?: string
          cuerpo?: string | null
          id?: string
          leida?: boolean
          referencia_id?: string | null
          sender_id?: string | null
          tipo?: Database["public"]["Enums"]["notification_type"]
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          booking_id: string
          created_at: string
          estado: string
          id: string
          monto: number
          mp_payment_id: string | null
          mp_preference_id: string | null
          webhook_payload: Json | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          estado?: string
          id?: string
          monto: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          webhook_payload?: Json | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          estado?: string
          id?: string
          monto?: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      points_log: {
        Row: {
          created_at: string
          id: string
          motivo: string
          puntos: number
          referencia_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivo: string
          puntos: number
          referencia_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string
          puntos?: number
          referencia_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          activo: boolean
          capacidad: number
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          location_id: string
          nombre: string
          precio_hora: number
          tipo: Database["public"]["Enums"]["space_type"]
        }
        Insert: {
          activo?: boolean
          capacidad?: number
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          location_id: string
          nombre: string
          precio_hora: number
          tipo: Database["public"]["Enums"]["space_type"]
        }
        Update: {
          activo?: boolean
          capacidad?: number
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          location_id?: string
          nombre?: string
          precio_hora?: number
          tipo?: Database["public"]["Enums"]["space_type"]
        }
        Relationships: [
          {
            foreignKeyName: "spaces_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "coworking_revenue"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "spaces_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      taller_inscripciones: {
        Row: {
          asistio: boolean
          id: string
          inscrito_at: string
          taller_id: string
          user_id: string
        }
        Insert: {
          asistio?: boolean
          id?: string
          inscrito_at?: string
          taller_id: string
          user_id: string
        }
        Update: {
          asistio?: boolean
          id?: string
          inscrito_at?: string
          taller_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taller_inscripciones_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "talleres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taller_inscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taller_inscripciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      talleres: {
        Row: {
          capacidad: number | null
          created_at: string
          descripcion: string | null
          duracion_minutos: number
          estado: Database["public"]["Enums"]["taller_estado"]
          fecha_inicio: string
          grabacion_url: string | null
          id: string
          link_virtual: string | null
          titulo: string
        }
        Insert: {
          capacidad?: number | null
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number
          estado?: Database["public"]["Enums"]["taller_estado"]
          fecha_inicio: string
          grabacion_url?: string | null
          id?: string
          link_virtual?: string | null
          titulo: string
        }
        Update: {
          capacidad?: number | null
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number
          estado?: Database["public"]["Enums"]["taller_estado"]
          fecha_inicio?: string
          grabacion_url?: string | null
          id?: string
          link_virtual?: string | null
          titulo?: string
        }
        Relationships: []
      }
      tutoria_addon_compras: {
        Row: {
          course_id: string
          created_at: string
          estado: string
          id: string
          monto: number
          mp_payment_id: string | null
          mp_preference_id: string | null
          user_id: string
          webhook_payload: Json | null
        }
        Insert: {
          course_id: string
          created_at?: string
          estado?: string
          id?: string
          monto: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          user_id: string
          webhook_payload?: Json | null
        }
        Update: {
          course_id?: string
          created_at?: string
          estado?: string
          id?: string
          monto?: number
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          user_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tutoria_addon_compras_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoria_addon_compras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoria_addon_compras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tutoria_asistencias: {
        Row: {
          alumno_id: string
          id: string
          presente: boolean
          registrado_at: string | null
          tutoria_id: string
        }
        Insert: {
          alumno_id: string
          id?: string
          presente?: boolean
          registrado_at?: string | null
          tutoria_id: string
        }
        Update: {
          alumno_id?: string
          id?: string
          presente?: boolean
          registrado_at?: string | null
          tutoria_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutoria_asistencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoria_asistencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutoria_asistencias_tutoria_id_fkey"
            columns: ["tutoria_id"]
            isOneToOne: false
            referencedRelation: "tutorias"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorias: {
        Row: {
          booking_id: string | null
          created_at: string
          curso_id: string
          docente_id: string
          estado: Database["public"]["Enums"]["tutoria_estado"]
          fecha_fin: string
          fecha_inicio: string
          grabacion_url: string | null
          id: string
          link_virtual: string | null
          modalidad: Database["public"]["Enums"]["tutoria_modalidad"]
          recordatorio_1h_enviado: boolean
          recordatorio_24h_enviado: boolean
          space_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          curso_id: string
          docente_id: string
          estado?: Database["public"]["Enums"]["tutoria_estado"]
          fecha_fin: string
          fecha_inicio: string
          grabacion_url?: string | null
          id?: string
          link_virtual?: string | null
          modalidad: Database["public"]["Enums"]["tutoria_modalidad"]
          recordatorio_1h_enviado?: boolean
          recordatorio_24h_enviado?: boolean
          space_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          curso_id?: string
          docente_id?: string
          estado?: Database["public"]["Enums"]["tutoria_estado"]
          fecha_fin?: string
          fecha_inicio?: string
          grabacion_url?: string | null
          id?: string
          link_virtual?: string | null
          modalidad?: Database["public"]["Enums"]["tutoria_modalidad"]
          recordatorio_1h_enviado?: boolean
          recordatorio_24h_enviado?: boolean
          space_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutorias_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutorias_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutorias_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "course_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutorias_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutorias_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          activo: boolean
          apellido: string
          avatar_url: string | null
          can_teach: boolean
          carrera_id: string | null
          coworking_creditos_canje: number
          created_at: string
          dni: string | null
          email: string
          id: string
          nombre: string
          notification_prefs: Json
          nurturing_d1_enviado: boolean
          nurturing_d3_enviado: boolean
          nurturing_d7_enviado: boolean
          onboarding_ok: boolean
          puntos: number
          role: Database["public"]["Enums"]["user_role"]
          role_history: Json
          updated_at: string
        }
        Insert: {
          activo?: boolean
          apellido: string
          avatar_url?: string | null
          can_teach?: boolean
          carrera_id?: string | null
          coworking_creditos_canje?: number
          created_at?: string
          dni?: string | null
          email: string
          id: string
          nombre: string
          notification_prefs?: Json
          nurturing_d1_enviado?: boolean
          nurturing_d3_enviado?: boolean
          nurturing_d7_enviado?: boolean
          onboarding_ok?: boolean
          puntos?: number
          role?: Database["public"]["Enums"]["user_role"]
          role_history?: Json
          updated_at?: string
        }
        Update: {
          activo?: boolean
          apellido?: string
          avatar_url?: string | null
          can_teach?: boolean
          carrera_id?: string | null
          coworking_creditos_canje?: number
          created_at?: string
          dni?: string | null
          email?: string
          id?: string
          nombre?: string
          notification_prefs?: Json
          nurturing_d1_enviado?: boolean
          nurturing_d3_enviado?: boolean
          nurturing_d7_enviado?: boolean
          onboarding_ok?: boolean
          puntos?: number
          role?: Database["public"]["Enums"]["user_role"]
          role_history?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_career"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "careers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      course_students: {
        Row: {
          apellido: string | null
          avatar_url: string | null
          course_id: string | null
          email: string | null
          enrollment_estado:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          fecha_completado: string | null
          fecha_inscripcion: string | null
          id: string | null
          nombre: string | null
          progreso_pct: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coworking_revenue: {
        Row: {
          ingresos: number | null
          location_id: string | null
          periodo: string | null
          reservas_pagadas: number | null
          sede: string | null
          tipo_descuento: Database["public"]["Enums"]["discount_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_points: {
        Args: {
          p_amount: number
          p_reason: string
          p_ref?: string
          p_user_id: string
        }
        Returns: undefined
      }
      can_coordinate_course: { Args: { p_course_id: string }; Returns: boolean }
      can_teach_course: { Args: { p_course_id: string }; Returns: boolean }
      convert_user_role: {
        Args: {
          p_carrera_id?: string
          p_dni?: string
          p_new_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      decrement_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
      detect_completed_bookings: { Args: never; Returns: number }
      detect_completed_tutorias: { Args: never; Returns: number }
      detect_no_shows: { Args: never; Returns: number }
      get_evaluation_for_attempt: {
        Args: { p_evaluation_id: string }
        Returns: {
          config: Json
          course_id: string
          id: string
          module_id: string
          nota_minima: number
          preguntas: Json
          tipo: Database["public"]["Enums"]["evaluation_type"]
          titulo: string
        }[]
      }
      get_occupied_slots: {
        Args: { p_from: string; p_space_id: string; p_to: string }
        Returns: {
          fecha_fin: string
          fecha_inicio: string
        }[]
      }
      get_taller_inscripcion_count: {
        Args: { p_taller_id: string }
        Returns: number
      }
      get_user_discount: { Args: never; Returns: number }
      has_active_course_subscription: { Args: never; Returns: boolean }
      has_tutoria_addon_access: {
        Args: { p_course_id: string }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_role: {
        Args: { p_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      mi_carrera_id: { Args: never; Returns: string }
      notify_admins_course_submitted: {
        Args: { p_course_id: string }
        Returns: {
          admin_email: string
        }[]
      }
      promote_lead_on_course_payment: {
        Args: { p_compra_id: string; p_user_id: string }
        Returns: undefined
      }
      recalculate_progress: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: undefined
      }
      verify_career_certificate: {
        Args: { p_uuid: string }
        Returns: {
          alumno_apellido: string
          alumno_nombre: string
          carrera_nombre: string
          emitido_at: string
          estado: Database["public"]["Enums"]["certificate_status"]
        }[]
      }
      verify_certificate: {
        Args: { p_uuid: string }
        Returns: {
          alumno_apellido: string
          alumno_nombre: string
          curso_titulo: string
          emitido_at: string
          estado: Database["public"]["Enums"]["certificate_status"]
        }[]
      }
    }
    Enums: {
      attempt_state:
        | "bloqueada"
        | "disponible"
        | "en_curso"
        | "pendiente_correccion"
        | "aprobada"
        | "desaprobada"
        | "corregida"
      booking_status:
        | "pendiente"
        | "senada"
        | "confirmada"
        | "en_uso"
        | "completada"
        | "cancelada"
        | "no_show"
      certificate_status: "emitido" | "revocado"
      checkin_method: "qr" | "manual"
      course_status: "borrador" | "revision" | "publicado" | "archivado"
      discount_type: "institucional" | "publico" | "manual" | "canje" | "cupon"
      enrollment_status: "activo" | "completado" | "suspendido"
      evaluation_type: "cuestionario_modulo" | "examen_final" | "tp"
      lesson_type: "video" | "texto" | "documento"
      notification_channel: "in_app" | "email" | "whatsapp"
      notification_type:
        | "announcement"
        | "tutoria"
        | "correccion"
        | "contenido_publicado"
        | "certificado"
        | "puntos"
        | "pago"
        | "sistema"
        | "reserva"
      review_status: "pendiente" | "aprobado" | "rechazado"
      space_type: "hot_desk" | "sala_reunion" | "aula"
      submission_kind: "archivo" | "drive" | "github" | "url" | "texto"
      submission_state: "pendiente_entrega" | "entregado" | "corregido"
      taller_estado: "borrador" | "publicado" | "cancelado"
      tutoria_estado: "programada" | "realizada" | "cancelada"
      tutoria_modalidad: "virtual" | "presencial"
      user_role:
        | "admin"
        | "docente"
        | "alumno"
        | "coordinador"
        | "comunidad"
        | "lead"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attempt_state: [
        "bloqueada",
        "disponible",
        "en_curso",
        "pendiente_correccion",
        "aprobada",
        "desaprobada",
        "corregida",
      ],
      booking_status: [
        "pendiente",
        "senada",
        "confirmada",
        "en_uso",
        "completada",
        "cancelada",
        "no_show",
      ],
      certificate_status: ["emitido", "revocado"],
      checkin_method: ["qr", "manual"],
      course_status: ["borrador", "revision", "publicado", "archivado"],
      discount_type: ["institucional", "publico", "manual", "canje", "cupon"],
      enrollment_status: ["activo", "completado", "suspendido"],
      evaluation_type: ["cuestionario_modulo", "examen_final", "tp"],
      lesson_type: ["video", "texto", "documento"],
      notification_channel: ["in_app", "email", "whatsapp"],
      notification_type: [
        "announcement",
        "tutoria",
        "correccion",
        "contenido_publicado",
        "certificado",
        "puntos",
        "pago",
        "sistema",
        "reserva",
      ],
      review_status: ["pendiente", "aprobado", "rechazado"],
      space_type: ["hot_desk", "sala_reunion", "aula"],
      submission_kind: ["archivo", "drive", "github", "url", "texto"],
      submission_state: ["pendiente_entrega", "entregado", "corregido"],
      taller_estado: ["borrador", "publicado", "cancelado"],
      tutoria_estado: ["programada", "realizada", "cancelada"],
      tutoria_modalidad: ["virtual", "presencial"],
      user_role: [
        "admin",
        "docente",
        "alumno",
        "coordinador",
        "comunidad",
        "lead",
      ],
    },
  },
} as const

