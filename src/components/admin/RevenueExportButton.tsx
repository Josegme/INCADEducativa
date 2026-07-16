"use client";

import { Button } from "@/components/ui/button";
import { buildCsv } from "@/modules/admin/bookings";

interface RevenueExportButtonProps {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function RevenueExportButton({ headers, rows, filename }: RevenueExportButtonProps) {
  function handleExport() {
    const csv = buildCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" disabled={rows.length === 0} onClick={handleExport}>
      Exportar CSV
    </Button>
  );
}
