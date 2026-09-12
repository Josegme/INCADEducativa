import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getFlags } from "@/lib/flags";

export default async function RegistroPage() {
  const flags = await getFlags();
  if (!flags.publica) {
    redirect("/login");
  }

  return (
    <AuthLayout>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-title font-semibold text-white">Creá tu cuenta</h1>
        <p className="text-body text-[--edu-text-muted]">
          Registro de comunidad. Si sos alumno INCADE, pedí la activación a la administración.
        </p>
        <RegisterForm />
        <p className="text-caption text-[--edu-text-muted]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[--inc-violet-text] hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
