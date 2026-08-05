"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

import { Button } from "@/components/ui/button";

// Reporte imprimible — fondo claro, misma excepción documentada al dark
// mode exclusivo que certificatePdf.tsx (DS v2.1 §1: "único documento
// imprimible").
const styles = StyleSheet.create({
  page: { padding: 32, backgroundColor: "#FFFFFF", fontFamily: "Helvetica" },
  marca: { fontSize: 10, color: "#9B30FF", fontWeight: 700, letterSpacing: 2, marginBottom: 4 },
  titulo: { fontSize: 16, color: "#111111", fontWeight: 700, marginBottom: 2 },
  subtitulo: { fontSize: 10, color: "#555555", marginBottom: 16 },
  table: { display: "flex", flexDirection: "column", borderWidth: 1, borderColor: "#E5E5E5" },
  headerRow: { flexDirection: "row", backgroundColor: "#F3F0FF" },
  row: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E5E5E5" },
  headerCell: { flex: 1, padding: 6, fontSize: 9, fontWeight: 700, color: "#333333" },
  cell: { flex: 1, padding: 6, fontSize: 9, color: "#333333" },
});

interface ReportDocumentProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
}

function ReportDocument({ title, subtitle, headers, rows }: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.marca}>INCADEDUCATIVA</Text>
        <Text style={styles.titulo}>{title}</Text>
        {subtitle ? <Text style={styles.subtitulo}>{subtitle}</Text> : null}
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {headers.map((h, i) => (
              <Text key={i} style={styles.headerCell}>
                {h}
              </Text>
            ))}
          </View>
          {rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((cell, j) => (
                <Text key={j} style={styles.cell}>
                  {String(cell)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

interface PdfReportExportButtonProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function PdfReportExportButton({ title, subtitle, headers, rows, filename }: PdfReportExportButtonProps) {
  async function handleExport() {
    const blob = await pdf(<ReportDocument title={title} subtitle={subtitle} headers={headers} rows={rows} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" disabled={rows.length === 0} onClick={handleExport}>
      Exportar PDF
    </Button>
  );
}
