"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import {
  requestPasswordResetAction,
  type RequestPasswordResetState,
} from "@/app/(auth)/actions/requestPasswordResetAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";

export function RequestResetForm() {
  const [state, setState] = useState<RequestPasswordResetState>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      setState(result);
    });
  }

  if (state.success) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <NotificationBanner type="success">
          Si el email existe en la plataforma, te enviamos un link para restablecer tu contraseña.
        </NotificationBanner>
        <Link href="/login" className="text-center text-[13px] text-[--inc-violet-text] hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Recuperar contraseña</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Ingresá tu email y te mandamos un link para restablecerla.
        </p>
      </div>

      {state.error ? <NotificationBanner type="danger">{state.error}</NotificationBanner> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-[12px] font-medium text-[--edu-text-muted]">
          Email
        </label>
        <Input id="email" name="email" type="email" placeholder="nombre@incade.edu.ar" required />
      </div>

      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar link"}
      </Button>

      <Link href="/login" className="text-center text-[13px] text-[--inc-violet-text] hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
