import { AuthLayout } from "@/components/layout/AuthLayout";
import { RequestResetForm } from "@/components/auth/RequestResetForm";

export default function RecuperarPage() {
  return (
    <AuthLayout>
      <RequestResetForm />
    </AuthLayout>
  );
}
