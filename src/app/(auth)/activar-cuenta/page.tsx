import { AuthLayout } from "@/components/layout/AuthLayout";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

export default function ActivarCuentaPage() {
  return (
    <AuthLayout>
      <SetPasswordForm
        title="Activar tu cuenta"
        description="Elegí una contraseña para empezar a usar la plataforma."
        submitLabel="Activar cuenta"
      />
    </AuthLayout>
  );
}
