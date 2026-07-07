"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { loginAction, type LoginActionState } from "@/app/(auth)/actions/loginAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";

export function LoginForm() {
  const [state, setState] = useState<LoginActionState>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setState(result);
    });
  }

  return (
    <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Iniciar sesión</h1>
        <p className="text-sm text-[--edu-text-muted]">Accedé a tu cuenta de INCADEducativa</p>
      </div>

      {state.error ? <NotificationBanner type="danger">{state.error}</NotificationBanner> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-[12px] font-medium text-[--edu-text-muted]">
          Email
        </label>
        <Input id="email" name="email" type="email" placeholder="nombre@incade.edu.ar" required />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-[12px] font-medium text-[--edu-text-muted]">
          Contraseña
        </label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Ingresando..." : "Ingresar"}
      </Button>

      <Link href="/recuperar" className="text-center text-[13px] text-[--inc-violet] hover:underline">
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  );
}
