import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImportCsvModal } from "@/components/admin/ImportCsvModal";
import { ConvertRoleModal } from "@/components/admin/ConvertRoleModal";
import { RoleHistoryTimeline } from "@/components/admin/RoleHistoryTimeline";
import { CanTeachToggle } from "@/components/admin/CanTeachToggle";
import { createClient } from "@/lib/supabase/server";
import type { RoleHistoryEntry, UserRoleValue } from "@/modules/admin/convertRole";

const ROLE_BADGE: Record<UserRoleValue, "active" | "pending" | "completed" | "locked"> = {
  admin: "active",
  docente: "pending",
  alumno: "completed",
  coordinador: "pending",
  comunidad: "locked",
  lead: "locked",
};

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const [{ data: users }, { data: careers }] = await Promise.all([
    supabase
      .from("users")
      .select("id, nombre, apellido, email, dni, role, activo, carrera_id, can_teach, role_history")
      .order("created_at", { ascending: false }),
    supabase.from("careers").select("id, nombre"),
  ]);

  const careerNameById = new Map((careers ?? []).map((c) => [c.id as string, c.nombre as string]));
  const careerOptions = (careers ?? []).map((c) => ({ id: c.id as string, nombre: c.nombre as string }));

  const adminIds = new Set<string>();
  for (const user of users ?? []) {
    for (const entry of (user.role_history ?? []) as RoleHistoryEntry[]) {
      adminIds.add(entry.by);
    }
  }
  const { data: admins } =
    adminIds.size > 0
      ? await supabase.from("users").select("id, nombre, apellido").in("id", Array.from(adminIds))
      : { data: [] as { id: string; nombre: string; apellido: string }[] };
  const adminNameById = Object.fromEntries(
    (admins ?? []).map((a) => [a.id as string, `${a.nombre} ${a.apellido}`])
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Usuarios</h1>
          <p className="text-sm text-[--edu-text-muted]">
            Importá alumnos por CSV o gestioná los usuarios existentes.
          </p>
        </div>
        <ImportCsvModal />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users ?? []).map((user) => {
            const role = user.role as UserRoleValue;
            const userName = `${user.nombre} ${user.apellido}`;
            return (
              <TableRow key={user.id}>
                <TableCell>{userName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.dni ?? "—"}</TableCell>
                <TableCell>{user.carrera_id ? careerNameById.get(user.carrera_id) ?? "—" : "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge state={ROLE_BADGE[role]}>{user.role}</Badge>
                    {user.can_teach ? <Badge state="pending">docente (dual)</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge state={user.activo ? "completed" : "locked"}>
                    {user.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <ConvertRoleModal
                      userId={user.id}
                      userName={userName}
                      currentRole={role}
                      careers={careerOptions}
                    />
                    {role === "alumno" ? (
                      <CanTeachToggle userId={user.id} canTeach={Boolean(user.can_teach)} />
                    ) : null}
                    <RoleHistoryTimeline
                      userName={userName}
                      entries={(user.role_history ?? []) as RoleHistoryEntry[]}
                      adminNameById={adminNameById}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
