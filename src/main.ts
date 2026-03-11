import { transpose2D } from './matrix.js';
import { getGroupNumbers } from './utils.js';
import { Columns } from './constants/columns.js';
import { enableTabButton, isResultsEmpty, switchToResultsTab } from './ui/tabs.js';
import { readWorkbookFromFile, getFirstSheetName, readSheetAsMatrix, sortRowsByNumericColumn, type Workbook, deleteColumnByName, normalizeAllCells,
} from './excel.js';
import { onLanguageChange } from './constants/language.js';
import { getEl } from './ui/dom.js';
import { updateStaticTexts } from './ui/texts.js';
import { buildGroupRadarScores, type GroupRadarScores } from './radar/scores.js';
import { renderRadarCharts } from './ui/render_radar.js';

// ----------------- Types & constants -----------------

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

let workbook: Workbook | null = null;
let lastGroupNumbers: number[] | null = null;
let lastRadarScores: GroupRadarScores | null = null;

// ----------------- Language change: re-render charts -----------------

updateStaticTexts();
onLanguageChange(() => {
  updateStaticTexts();
  if (lastGroupNumbers && lastRadarScores) {
    const dayInput = document.getElementById('dayInput') as HTMLInputElement | null;
    const dayNumber = dayInput?.value || '1';
    renderRadarCharts(lastGroupNumbers, lastRadarScores, dayNumber);
  }
});

// ----------------- Event handlers -----------------

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
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
    const sheetName = getFirstSheetName(workbook);
    const data = readSheetAsMatrix(workbook, sheetName);

    let table = sortRowsByNumericColumn(data, Columns.GroupNumber);
    table = normalizeAllCells(table);

    const transposedBeforeDelete = transpose2D(table);
    const groupNumbers = getGroupNumbers(transposedBeforeDelete);

    for (const name of columnNamesToDelete) {
      table = deleteColumnByName(table, name);
    }
    const transposed = transpose2D(table);

    const radarScores = buildGroupRadarScores(transposed, groupNumbers);

    lastGroupNumbers = groupNumbers;
    lastRadarScores = radarScores;

    const dayInput = document.getElementById('dayInput') as HTMLInputElement | null;
    const dayNumber = dayInput?.value || '1';
    renderRadarCharts(groupNumbers, radarScores, dayNumber);

    if (!isResultsEmpty()) {
      enableTabButton('results');
    }
    switchToResultsTab();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});
