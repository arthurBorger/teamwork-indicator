import { transpose2D, type Matrix } from './matrix.js';
import { toHtmlTable } from './table.js';
import { getGroupNumbers } from './utils.js';
import { calcAvgForMember } from './scoring.js';
import { Columns } from './constants/columns.js';
import {
  readWorkbookFromFile,
  getFirstSheetName,
  readSheetAsMatrix,
  sortRowsByNumericColumn,
  type Workbook,
  deleteColumnByName,
  normalizeAllCells,
  countUnique,
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
const aRowNames = [2, 5, 8, 13, 17];
let workbook: Workbook | null = null;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

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

    const transposedBeforeDelete = transpose2D(table);
    const groupNumbers = getGroupNumbers(transposedBeforeDelete);
    const groups = groupNumbers.length;

    output.appendChild(
      document.createTextNode(`Found ${groups} groups: ${groupNumbers.join(', ')}`),
    );
    output.appendChild(document.createElement('br'));
    output.appendChild(document.createElement('br'));

    for (const name of columnNamesToDelete) {
      table = deleteColumnByName(table, name);
    }

    const transposed = transpose2D(table);
    const A_score = calcAvgForMember(transposed, aRowNames, 1);

    output.appendChild(
      document.createTextNode(`Average A score: ${A_score ?? 'N/A'}`),
    );
    output.appendChild(document.createElement('br'));
    output.appendChild(document.createElement('br'));

    output.appendChild(toHtmlTable(transposed));
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});
