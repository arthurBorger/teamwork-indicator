import type { Matrix } from "./matrix.js";

// XLSX is provided by the CDN script tag
declare global {
  const XLSX: any;
}

export type Workbook = any;

export async function readWorkbookFromFile(file: File): Promise<Workbook> {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, { type: "array" });
}

export function getFirstSheetName(workbook: Workbook): string {
  return workbook.SheetNames[0];
}

export function readSheetAsMatrix(workbook: Workbook, sheetName: string): Matrix {
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
  }) as Matrix;
}

export function sortRowsByNumericColumn(data: Matrix, columnName: string): Matrix {
  if (data.length < 2) throw new Error("Sheet has no data");

  const header = data[0] ?? [];
  const rows = data.slice(1);

  const colIndex = header.indexOf(columnName);
  if (colIndex === -1) throw new Error(`Column "${columnName}" not found`);

  rows.sort((a, b) => Number(a[colIndex]) - Number(b[colIndex]));
  return [header, ...rows];
}