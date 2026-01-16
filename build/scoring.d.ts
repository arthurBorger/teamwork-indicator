import type { Matrix } from './matrix.js';
export type DimensionConfig = Record<string, string[]>;
export declare function indexColumnsByGroup(transposed: Matrix, groupRowName?: "Gruppenummer"): Map<number, number[]>;
export declare function countMembersByGroup(transposed: Matrix, groupRowName?: "Gruppenummer"): Map<number, number>;
export declare function scoreDimensionForGroup(transposed: Matrix, groupCols: readonly number[], questionRowNames: readonly string[]): number | null;
/**
 * Returns group -> scores in the SAME ORDER as axisOrder
 */
export declare function scoreAllGroups(transposed: Matrix, axisOrder: readonly string[], dimensions: DimensionConfig, groupRowName?: string): Map<number, (number | null)[]>;
/**
 * Average for ONE member (one respondent column) across the given question rows.
 *
 * Column 0 = row label
 * memberColumnIndex = 1..N
 */
export declare function calcAvgForMember(transposed: Matrix, questionRows: readonly (string | number)[], memberColumnIndex: number): number | null;
//# sourceMappingURL=scoring.d.ts.map