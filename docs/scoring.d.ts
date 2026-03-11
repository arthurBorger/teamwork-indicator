import type { Matrix } from './matrix.js';
export type DimensionConfig = Record<string, string[]>;
/**
 * Reverse a 1–7 Likert average → 7–1.
 * Returns null if the input is null.
 */
export declare function calculateSafeScore(avg: number | null): number | null;
export declare function indexColumnsByGroup(transposed: Matrix, groupRowName?: "Gruppenummer"): Map<number, number[]>;
export declare function countMembersByGroup(transposed: Matrix, groupRowName?: "Gruppenummer"): Map<number, number>;
export declare function scoreDimensionForGroup(transposed: Matrix, groupCols: readonly number[], questionRowNames: readonly string[]): number | null;
/**
 * Returns group -> scores in the SAME ORDER as axisOrder
 */
export declare function scoreAllGroups(transposed: Matrix, axisOrder: readonly string[], dimensions: DimensionConfig): Map<number, (number | null)[]>;
/**
 * Average for ONE member (one respondent column) across the given question rows.
 *
 * Column 0 = row label
 * memberColumnIndex = 1..N
 */
export declare function calcAvgForMember(transposed: Matrix, questionRows: readonly (string | number)[], memberColumnIndex: number): number | null;
/**
 * Numeric group averages for all groups for a given scale.
 * Returns raw numbers in a Map for further processing.
 */
export declare function calculateAverageScores(transposed: Matrix, groupNumbers: readonly number[], questionRowNumbers: readonly number[], reverse: boolean): Map<number, number | null>;
/**
 * Group-level score for one scale (like Excel’s SUM(D32:L32)/H27),
 * formatted to a fixed number of decimals.
 */
export declare function computeGroupScaleScore(transposed: Matrix, groupNumber: number, rowIndices: number[], reverse: boolean, decimals?: number): string;
//# sourceMappingURL=scoring.d.ts.map