import { transpose2D } from "./matrix.js";
import { toHtmlTable } from "./table.js";
import { getGroupNumbers } from "./utils.js";
import { calcAvgForMember } from "./scoring.js";
import {
  readWorkbookFromFile,
  getFirstSheetName,
  readSheetAsMatrix,
  sortRowsByNumericColumn,
  type Workbook,
  deleteColumnByName,
  normalizeAllCells,
  countUnique
} from "./excel.js";

const columnNamesToDelete = ["ID", "Starttidspunkt", "Fullføringstidspunkt", "E-postadresse", "Navn", "Tidspunkt for siste endring"];
const fileInput = getEl<HTMLInputElement>("file");
const btn = getEl<HTMLButtonElement>("transposeBtn");
const output = getEl<HTMLDivElement>("output");
let workbook: Workbook | null = null;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}


fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  output.innerHTML = "";
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

btn.addEventListener("click", () => {
  if (!workbook) return;

  try {
    output.innerHTML = "";
    const columnGroupNumber = "Gruppenummer";

    const sheetName = getFirstSheetName(workbook);
    const data = readSheetAsMatrix(workbook, sheetName);

    let table = sortRowsByNumericColumn(data, columnGroupNumber);
    table = normalizeAllCells(table);

    // transpose ONCE
    const transposedBeforeDelete = transpose2D(table);

    // real group numbers from data
    const groupNumbers = getGroupNumbers(transposedBeforeDelete, columnGroupNumber);
    const groups = groupNumbers.length;

    output.appendChild(
      document.createTextNode(`Found ${groups} groups: ${groupNumbers.join(", ")}`)
    );
    output.appendChild(document.createElement("br"));
    output.appendChild(document.createElement("br"));

    // delete meta columns (keep Gruppenummer for later scoring)
    for (const name of columnNamesToDelete) {
      table = deleteColumnByName(table, name);
    }

    const transposed = transpose2D(table);
    const A_score = calcAvgForMember(transposed, [2,5,8,13,17], 1);
    document.body.appendChild(document.createTextNode(`Average A score: ${A_score ?? "N/A"}`));
    output.appendChild(toHtmlTable(transposed));
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});