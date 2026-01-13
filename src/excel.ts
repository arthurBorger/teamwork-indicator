import type { Matrix } from "./matrix.js";

// XLSX is provided by the CDN script tag
declare global {
  const XLSX: any;
}

export type Workbook = any;

// Reads an Excel workbook from a File object.
export async function readWorkbookFromFile(file: File): Promise<Workbook> {
  const arrayBuffer = await file.arrayBuffer();
  return XLSX.read(arrayBuffer, { type: "array" });
}

// Returns the name of the first sheet in the workbook.
export function getFirstSheetName(workbook: Workbook): string {
  return workbook.SheetNames[0];
}

// Reads the specified sheet from the workbook and returns it as a matrix (2D array).
export function readSheetAsMatrix(workbook: Workbook, sheetName: string): Matrix {
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
  }) as Matrix;
}

// Sorts the rows of the matrix based on a numeric column specified by its name.
export function sortRowsByNumericColumn(data: Matrix, columnName: string): Matrix {
  if (data.length < 2) throw new Error("Sheet has no data");

  const header = data[0] ?? [];
  const rows = data.slice(1);

  const colIndex = header.indexOf(columnName);
  if (colIndex === -1) throw new Error(`Column "${columnName}" not found`);

  rows.sort((a, b) => Number(a[colIndex]) - Number(b[colIndex]));
  return [header, ...rows];
}

// Deletes a column by its name from the matrix.
export function deleteColumnByName(data: Matrix, columnName: string): Matrix {
  if (data.length === 0) return data;

  const header = data[0]?.map(String) ?? [];
  const colIndex = header.indexOf(columnName);

  if (colIndex === -1) return data;

  return data.map(row => [
    ...row.slice(0, colIndex),
    ...row.slice(colIndex + 1)
  ]);
}

export function extractLeadingNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;

  const match = value.match(/^\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

// Remove text content from cell if it matches the given regex.
export function normalizeAllCells(matrix: Matrix): Matrix {
  return matrix.map(row =>
    row.map(cell => extractLeadingNumber(cell) ?? cell)
  );
}

// Calculate how many instances there are based on the columnName.
export function countUnique(
  matrix: Matrix,
  columnName: string
): number {
  if (matrix.length === 0) return 0;

  const header = matrix[0]?.map(String) ?? [];
  const colIndex = header.indexOf(columnName);
  if (colIndex === -1) {
    throw new Error(`Column "${columnName}" not found`);
  }

  const groupNumbers = new Set<number>();

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    if (!row || row.length === 0) continue;

    const groupNumber = extractLeadingNumber(row[colIndex]);
    if (groupNumber !== null) {
      groupNumbers.add(groupNumber);
    }
  }

  return groupNumbers.size;
}