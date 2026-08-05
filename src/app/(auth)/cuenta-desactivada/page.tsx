import Link from "next/link";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { NotificationBanner } from "@/components/ui/notification-banner";

export default function CuentaDesactivadaPage() {
  return (
    <AuthLayout>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Cuenta desactivada</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Tu cuenta fue desactivada por un administrador de INCADE.
          </p>
        </div>

        <NotificationBanner type="warning">
          Si creés que esto es un error, contactá al administrador de la plataforma para
          reactivar tu acceso.
        </NotificationBanner>

        <Link href="/login">
          <Button variant="outline" className="w-full">
            Volver al login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
