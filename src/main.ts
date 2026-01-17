import { transpose2D, type Matrix } from './matrix.js';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Chart: any;

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
  decimals: number = 3,
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

// ---------------- Radar chart helpers ----------------

type GroupRadarScores = Record<
  number,
  {
    honestAndDirect: number | null;
    workCommitment: number | null;
    management: number | null;
    socialCooperation: number | null;
  }
>;

function buildGroupRadarScores(transposed: Matrix, groupNumbers: number[]): GroupRadarScores {
  // Adjust reverse flags here to match Excel
  const managementMap = calculateAverageScores(
    transposed,
    groupNumbers,
    managmentRowNames,
    /* reverse */ true,
  );
  const honestMap = calculateAverageScores(
    transposed,
    groupNumbers,
    honestAndDirectRowNames,
    /* reverse */ true,
  );
  const commitmentMap = calculateAverageScores(
    transposed,
    groupNumbers,
    workCommitmentRowNames,
    /* reverse */ true,
  );
  const socialMap = calculateAverageScores(
    transposed,
    groupNumbers,
    socialCooperationRowNames,
    /* reverse */ false, // "Denne skalaen er snudd"
  );

  const result: GroupRadarScores = {};

  for (const g of groupNumbers) {
    result[g] = {
      honestAndDirect: honestMap.get(g) ?? null,
      workCommitment: commitmentMap.get(g) ?? null,
      management: managementMap.get(g) ?? null,
      socialCooperation: socialMap.get(g) ?? null,
    };
  }

  return result;
}

const radarLabels = [
  'Ærlig og direkte',
  'Forpliktelse til arbeidet',
  'Ledelse',
  'Sosialt samarbeid',
];

function renderRadarCharts(groupNumbers: number[], radarScores: GroupRadarScores): void {
  const container = document.getElementById('charts');
  if (!container) return;

  // Clear any old charts
  container.innerHTML = '';

  for (const group of groupNumbers) {
    const scores = radarScores[group];
    if (!scores) continue;

    const values = [
      scores.honestAndDirect ?? 0,
      scores.workCommitment ?? 0,
      scores.management ?? 0,
      scores.socialCooperation ?? 0,
    ];

    // Card wrapper
    const card = document.createElement('div');
    card.className = 'card';
    card.style.minWidth = '350px';

    const title = document.createElement('h3');
    title.textContent = `Gruppe ${group}`;
    card.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    card.appendChild(canvas);

    container.appendChild(card);

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: `Gruppe ${group}`,
            data: values,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 5,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Samarbeidsindikatoren (1–7)' },
        },
        scales: {
          r: {
            min: 1,
            max: 7,
            ticks: {
              stepSize: 1,
              showLabelBackdrop: false,
              callback: (v: string | number) => v,
            },
            grid: {
              circular: false,
            },
            angleLines: {
              display: true,
            },
            pointLabels: {
              font: { size: 12 },
            },
            startAngle: 0,
          },
        },
      },
    });
  }
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

    // Text summary per group
    for (const group of groupNumbers) {
      const managementScore = computeGroupScaleScore(
        transposed,
        group,
        managmentRowNames,
        /* reverse */ true,
        3,
      );
      const honestAndDirectScore = computeGroupScaleScore(
        transposed,
        group,
        honestAndDirectRowNames,
        /* reverse */ true,
        3,
      );
      const workCommitmentScore = computeGroupScaleScore(
        transposed,
        group,
        workCommitmentRowNames,
        /* reverse */ true,
        3,
      );
      const socialCooperationScore = computeGroupScaleScore(
        transposed,
        group,
        socialCooperationRowNames,
        /* reverse */ false,
        3,
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

    // Render radar charts for all groups using the 4 dimensions
    const radarScores = buildGroupRadarScores(transposed, groupNumbers);
    renderRadarCharts(groupNumbers, radarScores);
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});
