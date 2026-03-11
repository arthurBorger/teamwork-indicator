import type { Matrix } from './matrix.js';
/**
 * Returns the first row whose first cell matches `rowName` (as string).
 * Throws a descriptive error if the row is not found.
 */
export declare function findRowByName(matrix: Matrix, rowName: string): readonly unknown[];
export declare function getGroupNumbers(transposed: Matrix): number[];
export declare function getGroupMembers(transposed: Matrix, groupNumber: number): number[];
//# sourceMappingURL=utils.d.ts.map