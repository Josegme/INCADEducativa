"use client";

import * as React from "react";

import { purchaseCourseAction } from "@/app/(dashboard)/cursos/actions/purchaseCourseActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { computeCoursePurchaseAmount } from "@/modules/educativa/coursePurchase";

interface CoursePurchaseFormProps {
  courseId: string;
  precio: number;
  descuentoPct: number;
  isAnonymous: boolean;
  /** flags.comunidad && flags.publica — habilita la rama de autorregistro de invitado. */
  showGuestFields: boolean;
}

export function CoursePurchaseForm({
  courseId,
  precio,
  descuentoPct,
  isAnonymous,
  showGuestFields,
}: CoursePurchaseFormProps) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [cuponCodigo, setCuponCodigo] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const amount = computeCoursePurchaseAmount(precio, descuentoPct);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("courseId", courseId);
    if (cuponCodigo) formData.set("cuponCodigo", cuponCodigo);
    if (isAnonymous) {
      formData.set("nombre", nombre);
      formData.set("email", email);
      formData.set("password", password);
    }

    const result = await purchaseCourseAction(formData);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  if (isAnonymous && !showGuestFields) {
    return <Badge state="locked">Iniciá sesión para comprar este curso</Badge>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <NotificationBanner type="danger" role="alert">
          {error}
        </NotificationBanner>
      ) : null}

      <div className="rounded-[14px] border-[0.5px] border-[--edu-border] bg-[--edu-surface-alt] p-4">
        <p className="text-[13px] text-[--edu-text-muted]">Precio</p>
        <div className="mt-1 flex items-baseline gap-2">
          {descuentoPct > 0 ? (
            <>
              <span className="text-[14px] text-[--edu-text-faint] line-through">${amount.montoOriginal}</span>
              <span className="text-[22px] font-semibold text-[--edu-success-text]">${amount.montoFinal}</span>
              <Badge state="completed">{descuentoPct}% descuento</Badge>
            </>
          ) : (
            <span className="text-[22px] font-semibold text-white">${amount.montoFinal}</span>
          )}
        </div>
      </div>

      {isAnonymous ? (
        <fieldset className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] p-4">
          <legend className="px-1 text-[13px] font-semibold text-white">Creá tu cuenta para comprar</legend>
          <Input placeholder="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="cuponCodigo" className="mb-1 block text-[13px] font-medium text-[--edu-text-muted]">
          Código de descuento (opcional)
        </label>
        <Input
          id="cuponCodigo"
          value={cuponCodigo}
          onChange={(e) => setCuponCodigo(e.target.value.toUpperCase())}
          placeholder="EARLYBIRD25"
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Procesando…" : "Comprar curso"}
      </Button>
    </form>
  );
}
