"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

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
import { checkInBookingAction } from "@/app/(dashboard)/admin/actions/bookingAdminActions";

const SCANNER_ELEMENT_ID = "coworking-checkin-qr-reader";

export function CheckInScannerModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [manualId, setManualId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);

  async function confirmCheckIn(bookingId: string) {
    const id = bookingId.trim();
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const result = await checkInBookingAction(id, "qr");
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess("Check-in registrado.");
    setManualId("");
    router.refresh();
  }

  React.useEffect(() => {
    if (!open) return;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          void confirmCheckIn(decodedText);
        },
        () => {
          /* per-frame decode miss — no action */
        }
      )
      .catch(() => setCameraError("No se pudo acceder a la cámara. Usá el ingreso manual."));

    return () => {
      const scannerInstance = scannerRef.current;
      scannerRef.current = null;
      if (scannerInstance) {
        scannerInstance.stop().catch(() => {}).finally(() => scannerInstance.clear());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setManualId("");
    setError(null);
    setSuccess(null);
    setCameraError(null);
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
          Escanear QR
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in por QR</DialogTitle>
          <DialogDescription>Escaneá el QR de la reserva o pegá el código manualmente.</DialogDescription>
        </DialogHeader>

        {error ? (
          <NotificationBanner type="danger" className="mb-3">
            {error}
          </NotificationBanner>
        ) : null}
        {success ? (
          <NotificationBanner type="success" className="mb-3">
            {success}
          </NotificationBanner>
        ) : null}

        <div id={SCANNER_ELEMENT_ID} className="mx-auto w-full max-w-[280px] overflow-hidden rounded-md" />
        {cameraError ? <p className="mt-2 text-[12px] text-[--edu-text-muted]">{cameraError}</p> : null}

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="manualId" className="text-[12px] font-medium text-[--edu-text-muted]">
            Ingreso manual (ID de la reserva)
          </label>
          <div className="flex gap-2">
            <Input
              id="manualId"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="uuid de la reserva"
            />
            <Button
              type="button"
              variant="primary"
              disabled={isLoading || !manualId.trim()}
              onClick={() => confirmCheckIn(manualId)}
            >
              {isLoading ? "…" : "Confirmar"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
