import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";

// El certificado es un documento imprimible/descargable, no una pantalla de la
// app — usa fondo claro (pensado para imprimir) en vez del dark mode exclusivo
// del resto de INCADEducativa (DS v2.1 §1), con los acentos de marca violeta.
const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  border: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#9B30FF",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  marca: { fontSize: 12, color: "#9B30FF", fontWeight: 700, letterSpacing: 2, marginBottom: 24 },
  titulo: { fontSize: 28, color: "#111111", fontWeight: 700, marginBottom: 8 },
  subtitulo: { fontSize: 12, color: "#555555", marginBottom: 32 },
  texto: { fontSize: 13, color: "#333333", marginBottom: 6 },
  nombre: { fontSize: 22, color: "#111111", fontWeight: 700, marginVertical: 10 },
  curso: { fontSize: 18, color: "#C026D3", fontWeight: 700, marginVertical: 10 },
  fecha: { fontSize: 11, color: "#666666", marginTop: 24 },
  qr: { width: 90, height: 90, marginTop: 24 },
  verificacion: { fontSize: 9, color: "#888888", marginTop: 8 },
});

interface CertificateDocumentProps {
  alumnoNombre: string;
  cursoTitulo: string;
  fechaEmision: string;
  qrDataUrl: string;
  verificacionUrl: string;
}

function CertificateDocument({ alumnoNombre, cursoTitulo, fechaEmision, qrDataUrl, verificacionUrl }: CertificateDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.marca}>INCADEDUCATIVA</Text>
          <Text style={styles.titulo}>Certificado de Finalización</Text>
          <Text style={styles.subtitulo}>INCADE Escuela de Negocios — Posadas, Misiones</Text>
          <Text style={styles.texto}>Se certifica que</Text>
          <Text style={styles.nombre}>{alumnoNombre}</Text>
          <Text style={styles.texto}>completó satisfactoriamente el curso</Text>
          <Text style={styles.curso}>{cursoTitulo}</Text>
          <Text style={styles.fecha}>Emitido el {fechaEmision}</Text>
          <Image src={qrDataUrl} style={styles.qr} />
          <Text style={styles.verificacion}>Verificá este certificado en {verificacionUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCertificatePdf(input: {
  alumnoNombre: string;
  cursoTitulo: string;
  fechaEmision: string;
  verificacionUrl: string;
}): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(input.verificacionUrl, { margin: 1 });
  return renderToBuffer(<CertificateDocument {...input} qrDataUrl={qrDataUrl} />);
}
