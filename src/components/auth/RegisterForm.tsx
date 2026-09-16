"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPublicAction } from "@/modules/identity/registerPublicAction";

export function RegisterForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await registerPublicAction(formData);
    if (result && "ok" in result && !result.ok) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      {error ? <p className="text-caption text-[--edu-danger-text]">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Registrarme"}
      </Button>
    </form>
  );
}
