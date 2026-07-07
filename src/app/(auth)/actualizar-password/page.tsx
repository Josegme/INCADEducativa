import { AuthLayout } from "@/components/layout/AuthLayout";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

export default function ActualizarPasswordPage() {
  return (
    <AuthLayout>
      <SetPasswordForm
        title="Restablecer contraseña"
        description="Elegí tu nueva contraseña para volver a acceder."
        submitLabel="Guardar contraseña"
      />
    </AuthLayout>
  );
}
