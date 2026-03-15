import type { Matrix } from '../matrix.js';
export type GroupRadarScores = Record<number, {
    honestAndDirect: number | null;
    workCommitment: number | null;
    management: number | null;
    socialCooperation: number | null;
}>;
export declare function buildGroupRadarScores(transposed: Matrix, groupNumbers: number[]): GroupRadarScores;
//# sourceMappingURL=scores.d.ts.map