import Link from "next/link";
import { CreditCard } from "lucide-react";

export interface MembershipStatusProps {
  activa: boolean;
  creditosRestantes: number;
  fin: string | null;
}

export function MembershipStatus({ activa, creditosRestantes, fin }: MembershipStatusProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-[--inc-violet]" aria-hidden />
        <h2 className="text-[13px] font-semibold text-[--edu-text]">Mi membresía</h2>
      </div>

      {activa ? (
        <p className="text-[13px] text-[--edu-text-muted]">
          <span className="font-semibold text-white">{creditosRestantes} créditos</span> restantes — vence el{" "}
          {fin ? new Date(fin).toLocaleDateString("es-AR") : "—"}.
        </p>
      ) : (
        <p className="text-[13px] text-[--edu-text-muted]">
          No tenés una membresía activa.{" "}
          <Link href="/servicios/coworking/membresia" className="text-[--inc-violet-text] hover:underline">
            Ver planes
          </Link>
          .
        </p>
      )}
    </div>
  );
}
