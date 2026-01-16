import type { Matrix } from './matrix.js';
import { extractLeadingNumber } from './excel.js';
import { Columns } from './constants/columns.js';

function findRowByName(matrix: Matrix, rowName: string): unknown[] {
  const row = matrix.find((r) => String(r?.[0] ?? '') === rowName);
  if (!row) throw new Error(`Row "${rowName}" not found`);
  return row;
}

export function getGroupNumbers(transposed: Matrix): number[] {
  const groupRow = findRowByName(transposed, Columns.GroupNumber);

  const set = new Set<number>();
  for (let c = 1; c < groupRow.length; c++) {
    const g = extractLeadingNumber(groupRow[c]);
    if (g != null) set.add(g);
  }

  return [...set].sort((a, b) => a - b);
}

// Returns the column indices of members in the given group.
export function getGroupMembers(transposed: Matrix, groupNumber: number): number[] {
  const groupRow = findRowByName(transposed, Columns.GroupNumber);
  if (!groupRow) {
    return [];
  }
  const members: number[] = [];
  // start at 1 to skip header at column 0
  for (let c = 1; c < groupRow.length; c++) {
    const g = extractLeadingNumber(groupRow[c]);
    if (g === groupNumber) {
      members.push(c);
    }
  }
  return members;
}
