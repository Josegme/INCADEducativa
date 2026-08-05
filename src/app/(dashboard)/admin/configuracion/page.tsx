import { NotificationBanner } from "@/components/ui/notification-banner";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { getFlags } from "@/lib/flags";
import { TOGGLEABLE_FLAGS } from "@/modules/admin/featureFlags";

export default async function AdminConfiguracionPage() {
  const flags = await getFlags();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Configuración</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Feature flags de los módulos de servicio. La plataforma educativa (E1) es el
          producto central y no se apaga desde acá.
        </p>
      </div>

      <NotificationBanner type="info">
        Un flag apagado oculta el módulo de la navegación y bloquea sus rutas para todos
        los roles. Reservas, cursos y datos ya cargados no se borran — solo dejan de ser
        accesibles hasta reactivarlo.
      </NotificationBanner>

      <div className="flex flex-col gap-2">
        {TOGGLEABLE_FLAGS.map(({ flag, label, etapa }) => (
          <FeatureFlagToggle key={flag} flag={flag} label={label} etapa={etapa} activo={flags[flag]} />
        ))}
      </div>
    </div>
  );
}
