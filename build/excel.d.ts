import type { Matrix } from "./matrix.js";
declare global {
    const XLSX: any;
}
export type Workbook = any;
export declare function readWorkbookFromFile(file: File): Promise<Workbook>;
export declare function getFirstSheetName(workbook: Workbook): string;
export declare function readSheetAsMatrix(workbook: Workbook, sheetName: string): Matrix;
export declare function sortRowsByNumericColumn(data: Matrix, columnName: string): Matrix;
export declare function deleteColumnByName(data: Matrix, columnName: string): Matrix;
export declare function extractLeadingNumber(value: unknown): number | null;
export declare function normalizeAllCells(matrix: Matrix): Matrix;
export declare function countUnique(matrix: Matrix, columnName: string): number;
//# sourceMappingURL=excel.d.ts.map