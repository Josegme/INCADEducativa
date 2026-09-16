import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditCertificateNameModal } from "@/components/admin/EditCertificateNameModal";
import { RegenerateCertificateButton } from "@/components/admin/RegenerateCertificateButton";
import { CERTIFICATE_BUCKET } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCertificadosPage() {
  const supabase = await createClient();

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, pdf_url, estado, emitido_at, nombre_override, user:users(nombre, apellido, email), course:courses(titulo)")
    .order("emitido_at", { ascending: false })
    .limit(200);

  const rows = await Promise.all(
    (certificates ?? []).map(async (cert) => {
      const user = cert.user as unknown as { nombre: string; apellido: string; email: string } | null;
      const course = cert.course as unknown as { titulo: string } | null;
      const nombreReal = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();

      let downloadUrl: string | null = null;
      if (cert.pdf_url) {
        const { data: signed } = await supabase.storage.from(CERTIFICATE_BUCKET).createSignedUrl(cert.pdf_url, 3600);
        downloadUrl = signed?.signedUrl ?? null;
      }

      return {
        id: cert.id as string,
        nombreReal,
        nombreOverride: cert.nombre_override as string | null,
        email: user?.email ?? "—",
        cursoTitulo: course?.titulo ?? "—",
        estado: cert.estado as "emitido" | "revocado",
        emitidoAt: cert.emitido_at as string,
        downloadUrl,
      };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-semibold text-white">Certificados</h1>
        <p className="text-sm text-[--edu-text-muted]">
          Últimos 200 certificados de curso emitidos. Editar el nombre regenera el PDF automáticamente.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Curso</TableHead>
            <TableHead>Nombre en el certificado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Emitido</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span>{row.nombreReal}</span>
                  <span className="text-[12px] text-[--edu-text-faint]">{row.email}</span>
                </div>
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">{row.cursoTitulo}</TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {row.nombreOverride ?? <span className="italic text-[--edu-text-faint]">Sin corregir</span>}
              </TableCell>
              <TableCell>
                <Badge state={row.estado === "emitido" ? "gold" : "error"}>
                  {row.estado === "emitido" ? "Emitido" : "Revocado"}
                </Badge>
              </TableCell>
              <TableCell className="text-[--edu-text-muted]">
                {new Date(row.emitidoAt).toLocaleDateString("es-AR")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <EditCertificateNameModal
                    certificateId={row.id}
                    nombreActual={row.nombreReal}
                    nombreOverride={row.nombreOverride}
                  />
                  <RegenerateCertificateButton certificateId={row.id} />
                  {row.downloadUrl ? (
                    <a
                      href={row.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-[--inc-violet-text] hover:underline"
                    >
                      Ver PDF
                    </a>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[--edu-text-muted]">
                Todavía no hay certificados emitidos.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
