"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { createCatalogSubscriptionAction } from "@/app/(dashboard)/cursos/actions/subscriptionActions";

interface SubscribeFormProps {
  planId: string;
  isAnonymous: boolean;
  /** flags.publica — habilita la rama de autorregistro de invitado. */
  showGuestFields: boolean;
}

export function SubscribeForm({ planId, isAnonymous, showGuestFields }: SubscribeFormProps) {
  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("planId", planId);
    if (isAnonymous) {
      formData.set("nombre", nombre);
      formData.set("email", email);
      formData.set("password", password);
    }

    const result = await createCatalogSubscriptionAction(formData);
    // Si sale todo bien, createCatalogSubscriptionAction hace redirect()
    // internamente (nunca llega acá). Solo llegamos si hubo un error real.
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  if (isAnonymous && !showGuestFields) {
    return <Badge state="locked">Iniciá sesión para suscribirte</Badge>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <NotificationBanner type="danger" role="alert">
          {error}
        </NotificationBanner>
      ) : null}

      {isAnonymous ? (
        <fieldset className="flex flex-col gap-3 rounded-[14px] border-[0.5px] border-[--edu-border] p-4">
          <legend className="px-1 text-[13px] font-semibold text-white">Creá tu cuenta para suscribirte</legend>
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

      <Button type="submit" size="lg" disabled={isLoading} className="w-fit">
        {isLoading ? "Procesando…" : "Suscribirme y pagar"}
      </Button>
    </form>
  );
}
