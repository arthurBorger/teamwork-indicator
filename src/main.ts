import { transpose2D } from "./matrix.js";
import { toHtmlTable } from "./table.js";
import {
  readWorkbookFromFile,
  getFirstSheetName,
  readSheetAsMatrix,
  sortRowsByNumericColumn,
  type Workbook
} from "./excel.js";

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const fileInput = getEl<HTMLInputElement>("file");
const btn = getEl<HTMLButtonElement>("transposeBtn");
const output = getEl<HTMLDivElement>("output");

let workbook: Workbook | null = null;

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
    const sheetName = getFirstSheetName(workbook);
    const data = readSheetAsMatrix(workbook, sheetName);

    const sorted = sortRowsByNumericColumn(data, "Gruppenummer");
    const transposed = transpose2D(sorted);

    output.innerHTML = "";
    output.appendChild(
      document.createTextNode(
        `Sheet: ${sheetName} (sorted by Gruppenummer, then transposed)`
      )
    );
    output.appendChild(document.createElement("br"));
    output.appendChild(document.createElement("br"));
    output.appendChild(toHtmlTable(transposed));
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});