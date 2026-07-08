"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { ROLE_LABEL, USER_ROLES, type UserRoleValue } from "@/modules/admin/convertRole";
import { convertUserRoleAction } from "@/app/(dashboard)/admin/actions/convertRoleActions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border-[0.5px] border-[--edu-border] bg-white/[0.06] px-3 py-2 text-sm text-[--edu-text] transition-colors focus-visible:border-[--edu-border-strong] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--inc-violet-border-strong]";

interface ConvertRoleModalProps {
  userId: string;
  userName: string;
  currentRole: UserRoleValue;
  careers: { id: string; nombre: string }[];
}

export function ConvertRoleModal({ userId, userName, currentRole, careers }: ConvertRoleModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState<UserRoleValue>(currentRole);
  const [carreraId, setCarreraId] = React.useState("");
  const [dni, setDni] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  function reset() {
    setNewRole(currentRole);
    setCarreraId("");
    setDni("");
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("newRole", newRole);
    formData.set("carreraId", carreraId);
    formData.set("dni", dni);

    const result = await convertUserRoleAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Convertir rol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convertir rol — {userName}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Rol actual: <Badge state="active">{ROLE_LABEL[currentRole]}</Badge>
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        {success ? (
          <NotificationBanner type="success">
            Rol actualizado a {ROLE_LABEL[newRole]}. El usuario recibió una notificación.
          </NotificationBanner>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="newRole" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                Nuevo rol
              </label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRoleValue)}
                className={SELECT_CLASS}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-[--edu-surface-raised]">
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </div>

            {newRole === "alumno" ? (
              <>
                <div>
                  <label htmlFor="carreraId" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                    Carrera
                  </label>
                  <select
                    id="carreraId"
                    value={carreraId}
                    onChange={(e) => setCarreraId(e.target.value)}
                    required
                    className={SELECT_CLASS}
                  >
                    <option value="" className="bg-[--edu-surface-raised]">
                      Elegí una carrera
                    </option>
                    {careers.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[--edu-surface-raised]">
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dni" className="mb-1 block text-[12px] font-medium text-[--edu-text-muted]">
                    DNI
                  </label>
                  <Input
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    placeholder="30111222"
                  />
                </div>
              </>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isLoading} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isLoading || newRole === currentRole}>
                {isLoading ? "Convirtiendo…" : "Confirmar conversión"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
