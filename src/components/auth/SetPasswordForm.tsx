"use client";

import { useState, useTransition } from "react";

import { setPasswordAction, type SetPasswordState } from "@/app/(auth)/actions/setPasswordAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationBanner } from "@/components/ui/notification-banner";

export interface SetPasswordFormProps {
  title: string;
  description: string;
  submitLabel: string;
}

export function SetPasswordForm({ title, description, submitLabel }: SetPasswordFormProps) {
  const [state, setState] = useState<SetPasswordState>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await setPasswordAction(formData);
      if (result?.error) setState(result);
    });
  }

  return (
    <form action={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">{title}</h1>
        <p className="text-sm text-[--edu-text-muted]">{description}</p>
      </div>

      {state.error ? <NotificationBanner type="danger">{state.error}</NotificationBanner> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-[12px] font-medium text-[--edu-text-muted]">
          Nueva contraseña
        </label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>

      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
