import { transpose2D, type Matrix } from './matrix.js';
import { toHtmlTable } from './table.js';
import { getGroupNumbers } from './utils.js';
import { calcAvgForMember } from './scoring.js';
import { Columns } from './constants/columns.js';
import { getGroupMembers } from './utils.js';
import {
  readWorkbookFromFile,
  getFirstSheetName,
  readSheetAsMatrix,
  sortRowsByNumericColumn,
  type Workbook,
  deleteColumnByName,
  normalizeAllCells,
} from './excel.js';

const columnNamesToDelete = [
  Columns.ID,
  Columns.Start,
  Columns.End,
  Columns.Email,
  Columns.Name,
  Columns.LastChanged,
];

const fileInput = getEl<HTMLInputElement>('file');
const btn = getEl<HTMLButtonElement>('transposeBtn');
const output = getEl<HTMLDivElement>('output');

// Row indices (in the transposed matrix) for each scale
const managmentRowNames = [2, 5, 8, 13, 17];
const socialCooperationRowNames = [6, 9, 12, 14, 18];
const honestAndDirectRowNames = [3, 7, 10, 15, 19];
const workCommitmentRowNames = [1, 4, 11, 16, 20];

let workbook: Workbook | null = null;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

/**
 * Reverse a 1–7 Likert average → 7–1.
 * Returns null if the input is null.
 */
export function calculateSafeScore(avg: number | null): number | null {
  if (avg == null) return null;
  return 8 - avg;
}

/**
 * Average score for ONE member (one column) on a given scale.
 * Optionally reverse the scale.
 */
function computeMemberScaleScore(
  transposed: Matrix,
  rowIndices: number[],
  colIndex: number,
  reverse: boolean,
): number | null {
  const raw = calcAvgForMember(transposed, rowIndices, colIndex);
  if (raw == null) return null;
  return reverse ? calculateSafeScore(raw) : raw;
}

/**
 * Group-level score for one scale (like Excel’s SUM(D32:L32)/H27),
 * formatted to a fixed number of decimals.
 */
function computeGroupScaleScore(
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

/**
 * Numeric group averages for all groups for a given scale.
 * Returns raw numbers in a Map for further processing.
 */
function calculateAverageScores(
  transposed: Matrix,
  groupNumbers: number[],
  questionRowNumbers: number[],
  reverse: boolean,
): Map<number, number | null> {
  const scores = new Map<number, number | null>();

  for (const groupNumber of groupNumbers) {
    const memberCols = getGroupMembers(transposed, groupNumber);

    let sum = 0;
    let count = 0;

    for (const colIndex of memberCols) {
      const score = computeMemberScaleScore(
        transposed,
        questionRowNumbers,
        colIndex,
        reverse,
      );

      if (score != null && !Number.isNaN(score)) {
        sum += score;
        count++;
      }
    }

    scores.set(groupNumber, count > 0 ? sum / count : null);
  }

  return scores;
}

// ----------------- Event handlers -----------------

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  output.innerHTML = '';
  btn.disabled = true;
  workbook = null;

  if (!file) return;

  try {
    workbook = await readWorkbookFromFile(file);
    btn.disabled = false;
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});

btn.addEventListener('click', () => {
  if (!workbook) return;

  try {
    output.innerHTML = '';

    const sheetName = getFirstSheetName(workbook);
    const data = readSheetAsMatrix(workbook, sheetName);

    let table = sortRowsByNumericColumn(data, Columns.GroupNumber);
    table = normalizeAllCells(table);

    // Group detection is done before deleting meta-columns
    const transposedBeforeDelete = transpose2D(table);
    const groupNumbers = getGroupNumbers(transposedBeforeDelete);
    const groups = groupNumbers.length;

    output.appendChild(
      document.createTextNode(`Found ${groups} groups: ${groupNumbers.join(', ')}`),
    );
    output.appendChild(document.createElement('br'));
    output.appendChild(document.createElement('br'));

    // Remove meta columns, then transpose to the final working layout
    for (const name of columnNamesToDelete) {
      table = deleteColumnByName(table, name);
    }
    const transposed = transpose2D(table);

    // Print one summary line per group
    for (const group of groupNumbers) {
      // NOTE: set reverse=true only for the scales that are actually "snudd" in Excel.
      const managementScore = computeGroupScaleScore(
        transposed,
        group,
        managmentRowNames,
        /* reverse */ true,
        2,
      );
      const honestAndDirectScore = computeGroupScaleScore(
        transposed,
        group,
        honestAndDirectRowNames,
        /* reverse */ true,
        2,
      );
      const workCommitmentScore = computeGroupScaleScore(
        transposed,
        group,
        workCommitmentRowNames,
        /* reverse */ true,
        2,
      );
      const socialCooperationScore = computeGroupScaleScore(
        transposed,
        group,
        socialCooperationRowNames,
        /* reverse */ false, // "Denne skalaen er snudd"
        2,
      );

      output.appendChild(
        document.createTextNode(
          `Group ${group} — ` +
            `Management: ${managementScore}, ` +
            `Social Cooperation: ${socialCooperationScore}, ` +
            `Honest & Direct: ${honestAndDirectScore}, ` +
            `Work Commitment: ${workCommitmentScore}`,
        ),
      );
      output.appendChild(document.createElement('br'));
    }

    output.appendChild(document.createElement('br'));

    // Example: show management averages for all groups (numeric map)
    const managementByGroup = calculateAverageScores(
      transposed,
      groupNumbers,
      managmentRowNames,
      /* reverse */ false,
    );

    const managementByGroupText = [...managementByGroup]
      .map(([group, score]) => `Group ${group}: ${score == null ? 'N/A' : score.toFixed(3)}`)
      .join(', ');

    output.appendChild(
      document.createTextNode(`Management averages by group: ${managementByGroupText}`),
    );
    output.appendChild(document.createElement('br'));

    output.appendChild(toHtmlTable(transposed));
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});