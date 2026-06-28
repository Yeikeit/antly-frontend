import * as XLSX from "xlsx";
import type { TransactionRow } from "@/hooks/transaction/useTransactions";
import { formatCLP } from "@/lib/utils/currency";

interface ExportRow {
  Fecha: string;
  Hora: string;
  Tipo: string;
  "Categoría / Fuente": string;
  Descripción: string;
  Monto: string;
}

function buildRows(
  transactions: TransactionRow[],
  categoryMap: Record<string, string>
): ExportRow[] {
  return transactions.map((tx) => {
    const [datePart, timePart] = tx.createdAt.split("T");
    const [y, m, d] = tx.transactionDate.split("T")[0].split("-");
    const fecha = `${d}/${m}/${y}`;
    const hora = timePart ? timePart.slice(0, 5) : "";

    const tipo =
      tx.type === "INCOME" ? "Ingreso" :
      tx.type === "SAVING" ? "Ahorro" : "Gasto";

    const categoria =
      tx.type === "INCOME"
        ? (tx.incomeSource?.name ?? "Fuente de ingreso")
        : (categoryMap[tx.categoryId] ?? tx.categoryId);

    return {
      Fecha: fecha,
      Hora: hora,
      Tipo: tipo,
      "Categoría / Fuente": categoria,
      Descripción: tx.description ?? "",
      Monto: `$${formatCLP(Math.abs(Number(tx.amount)))}`,
    };
  });
}

export function exportToCSV(
  transactions: TransactionRow[],
  categoryMap: Record<string, string>,
  filename: string
) {
  const rows = buildRows(transactions, categoryMap);
  const headers = Object.keys(rows[0] ?? {});
  const csvLines = [
    headers.join(";"),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String(r[h as keyof ExportRow]);
        return val.includes(";") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(";")
    ),
  ];
  const blob = new Blob(["﻿" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportToExcel(
  transactions: TransactionRow[],
  categoryMap: Record<string, string>,
  filename: string
) {
  const rows = buildRows(transactions, categoryMap);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas
  ws["!cols"] = [
    { wch: 12 }, // Fecha
    { wch: 8 },  // Hora
    { wch: 10 }, // Tipo
    { wch: 28 }, // Categoría
    { wch: 32 }, // Descripción
    { wch: 14 }, // Monto
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
