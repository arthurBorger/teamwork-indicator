import type { Matrix } from './matrix.js';
import { extractLeadingNumber } from './excel.js';
import { Columns } from './constants/columns.js';
import { getGroupMembers } from './utils.js';

const groupNumber = Columns.GroupNumber;
// dimension name -> question row names
export type DimensionConfig = Record<string, string[]>;
// Example:
// {
//   "Ærlig og direkte": ["1","2","3"],
//   "Forpliktelse til arbeidet": ["4","5","6"],
//   "Ledelse": ["7","8","9"],
//   "Sosialt samarbeid": ["10","11","12"]
// }

/**
 * Reverse a 1–7 Likert average → 7–1.
 * Returns null if the input is null.
 */
export function calculateSafeScore(avg: number | null): number | null {
  if (avg == null) return null;
  return 8 - avg;
}

function findRowByName(matrix: Matrix, rowName: string): unknown[] {
  const row = matrix.find((r) => String(r?.[0] ?? '') === rowName);
  if (!row) throw new Error(`Row "${rowName}" not found`);
  return row;
}

export function indexColumnsByGroup(
  transposed: Matrix,
  groupRowName = groupNumber,
): Map<number, number[]> {
  const groupRow = findRowByName(transposed, groupRowName);
  const map = new Map<number, number[]>();

  for (let c = 1; c < groupRow.length; c++) {
    const g = extractLeadingNumber(groupRow[c]);
    if (g == null) continue;
    (map.get(g) ?? map.set(g, []).get(g)!).push(c);
  }
  return map;
}

export function countMembersByGroup(
  transposed: Matrix,
  groupRowName = groupNumber,
): Map<number, number> {
  const groupToCols = indexColumnsByGroup(transposed, groupRowName);
  const counts = new Map<number, number>();
  for (const [g, cols] of groupToCols) counts.set(g, cols.length);
  return counts;
}

export function scoreDimensionForGroup(
  transposed: Matrix,
  groupCols: readonly number[],
  questionRowNames: readonly string[],
): number | null {
  let sum = 0;
  let n = 0;

  for (const q of questionRowNames) {
    const row = findRowByName(transposed, q);

    for (const c of groupCols) {
      const v = extractLeadingNumber(row[c]);
      if (v == null) continue;
      sum += v;
      n++;
    }
  }

  return n === 0 ? null : sum / n;
}

/**
 * Returns group -> scores in the SAME ORDER as axisOrder
 */
export function scoreAllGroups(
  transposed: Matrix,
  axisOrder: readonly string[],
  dimensions: DimensionConfig,
): Map<number, (number | null)[]> {
  const groupToCols = indexColumnsByGroup(transposed, groupNumber);
  const out = new Map<number, (number | null)[]>();

  for (const [group, cols] of groupToCols) {
    const scores = axisOrder.map((axisName) => {
      const questions = dimensions[axisName];
      if (!questions) throw new Error(`Missing dimension config for "${axisName}"`);
      return scoreDimensionForGroup(transposed, cols, questions);
    });

    out.set(group, scores);
  }

  return out;
}

/**
 * Average for ONE member (one respondent column) across the given question rows.
 *
 * Column 0 = row label
 * memberColumnIndex = 1..N
 */
export function calcAvgForMember(
  transposed: Matrix,
  questionRows: readonly (string | number)[],
  memberColumnIndex: number,
): number | null {
  let totalScore = 0;
  let valueCount = 0;

  for (const question of questionRows) {
    const questionRow = findRowByName(transposed, String(question));

    const score = extractLeadingNumber(questionRow[memberColumnIndex]);
    if (score === null) continue;

    totalScore += score;
    valueCount++;
  }

  return valueCount === 0 ? null : totalScore / valueCount;
}

/**
 * Average score for ONE member (one column) on a given scale.
 * Optionally reverse the scale.
 * 
 * - If member has no valid answers → treat their score as 0 (not "missing").
 */
function computeMemberScaleScore(
  transposed: Matrix,
  rowIndices: readonly number[],
  colIndex: number,
  reverse: boolean,
): number {
  const raw = calcAvgForMember(transposed, rowIndices, colIndex); // number | null

  // Excel: if no answers at all → 0
  const base = raw ?? 0;

  // Reverse scale if needed (calculateSafeScore never returns null for a real number)
  return reverse ? calculateSafeScore(base)! : base;
}
/**
 * Numeric group averages for all groups for a given scale.
 * Returns raw numbers in a Map for further processing.
 */
export function calculateAverageScores(
  transposed: Matrix,
  groupNumbers: readonly number[],
  questionRowNumbers: readonly number[],
  reverse: boolean,
): Map<number, number | null> {
  const scores = new Map<number, number | null>();

  for (const groupNumber of groupNumbers) {
    const memberCols = getGroupMembers(transposed, groupNumber);

    let sum = 0;
    let count = 0;

    for (const colIndex of memberCols) {
      const score = computeMemberScaleScore(transposed, questionRowNumbers, colIndex, reverse);

      if (score != null && !Number.isNaN(score)) {
        sum += score;
        count++;
      }
    }

    scores.set(groupNumber, count > 0 ? sum / count : null);
  }

  return scores;
}

/**
 * Group-level score for one scale (like Excel’s SUM(D32:L32)/H27),
 * formatted to a fixed number of decimals.
 */
export function computeGroupScaleScore(
  transposed: Matrix,
  groupNumber: number,
  rowIndices: number[],
  reverse: boolean,
  decimals: number = 2,
): string {
  const memberCols = getGroupMembers(transposed, groupNumber);

  let sum = 0;
  let count = 0;

  for (const colIndex of memberCols) {
    const score = computeMemberScaleScore(transposed, rowIndices, colIndex, reverse);
    if (score != null && !Number.isNaN(score)) {
      sum += score;
      count++;
    }
  }

  return count > 0 ? (sum / count).toFixed(decimals) : 'N/A';
}