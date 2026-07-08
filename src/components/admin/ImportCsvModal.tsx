"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ImportPreviewRow, ImportRowStatus } from "@/modules/admin/importUsers";
import { confirmImportAction, previewImportAction } from "@/app/(dashboard)/admin/actions/importUsersActions";

const STATUS_BADGE: Record<ImportRowStatus, { state: "completed" | "pending" | "error"; label: string }> = {
  nuevo: { state: "completed", label: "Nuevo" },
  duplicado: { state: "pending", label: "Duplicado" },
  error: { state: "error", label: "Error" },
};

interface ConfirmSummary {
  imported: number;
  failed: { email: string; motivo: string }[];
}

export function ImportCsvModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<ImportPreviewRow[] | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<ConfirmSummary | null>(null);

  function reset() {
    setRows(null);
    setFileName(null);
    setIsDragging(false);
    setError(null);
    setSummary(null);
  }

  async function handleFile(file: File) {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const result = await previewImportAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setFileName(result.fileName ?? file.name);
    setRows(result.rows ?? []);
  }

  async function handleConfirm() {
    if (!rows) return;
    setIsLoading(true);
    const result = await confirmImportAction(rows);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSummary({ imported: result.imported ?? 0, failed: result.failed ?? [] });
    router.refresh();
  }

  const nuevos = rows?.filter((r) => r.status === "nuevo").length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">
          <FileUp className="h-4 w-4" aria-hidden />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar usuarios</DialogTitle>
          <DialogDescription>
            Columnas esperadas: <code className="text-[--edu-text]">nombre, apellido, dni, email, carrera</code>.
            La carrera debe coincidir con el nombre exacto registrado en el sistema.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}

        {summary ? (
          <NotificationBanner type={summary.failed.length > 0 ? "warning" : "success"}>
            <div className="flex flex-col gap-1">
              <span>
                {summary.imported} usuario{summary.imported === 1 ? "" : "s"} importado
                {summary.imported === 1 ? "" : "s"}.
              </span>
              {summary.failed.length > 0 ? (
                <ul className="list-inside list-disc">
                  {summary.failed.map((f) => (
                    <li key={f.email}>
                      {f.email}: {f.motivo}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </NotificationBanner>
        ) : !rows ? (
          <label
            htmlFor="csv-input"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-[--inc-violet-border-strong] bg-[--inc-violet-subtle]"
                : "border-[--edu-border-strong] hover:bg-white/[0.03]"
            )}
          >
            <Upload className="h-6 w-6 text-[--inc-violet]" aria-hidden />
            <span className="text-[13px] text-[--edu-text]">
              {isLoading ? "Procesando archivo…" : "Arrastrá tu CSV acá o hacé clic para seleccionar"}
            </span>
            <span className="text-[12px] text-[--edu-text-faint]">Archivos .csv únicamente</span>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="sr-only"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] text-[--edu-text-muted]">
              Vista previa de <span className="text-[--edu-text]">{fileName}</span> — {nuevos} de{" "}
              {rows.length} filas listas para importar.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.email || row.dni}>
                    <TableCell>
                      {row.nombre} {row.apellido}
                    </TableCell>
                    <TableCell>{row.dni}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.carrera}</TableCell>
                    <TableCell>
                      <Badge state={STATUS_BADGE[row.status].state} title={row.motivo}>
                        {STATUS_BADGE[row.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              if (rows || summary) reset();
              else setOpen(false);
            }}
          >
            {rows || summary ? "Elegir otro archivo" : "Cancelar"}
          </Button>
          {rows && !summary ? (
            <Button variant="primary" disabled={isLoading || nuevos === 0} onClick={handleConfirm}>
              {isLoading ? "Importando…" : "Confirmar importación"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
