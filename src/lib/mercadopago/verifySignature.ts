import { createHmac, timingSafeEqual } from "crypto";

export interface VerifyWebhookSignatureInput {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}

/**
 * Verifica la firma `x-signature` del webhook de MercadoPago (CLAUDE.md
 * regla #9). Algoritmo documentado por MP: manifest
 * `id:{data.id};request-id:{x-request-id};ts:{ts};` firmado con HMAC-SHA256
 * usando MP_WEBHOOK_SECRET, comparado contra el `v1` del header.
 * Si MP_WEBHOOK_SECRET no está configurada, rechaza siempre (nunca procesa
 * un webhook sin poder verificar la firma).
 */
export function verifyMercadoPagoSignature({
  xSignature,
  xRequestId,
  dataId,
}: VerifyWebhookSignatureInput): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !xRequestId || !dataId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(v1, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}
