import { transpose2D } from "./matrix.js";
import { toHtmlTable } from "./table.js";
import { readWorkbookFromFile, getFirstSheetName, readSheetAsMatrix, sortRowsByNumericColumn, deleteColumnByName } from "./excel.js";
const columnNamesToDelete = ["ID", "Starttidspunkt", "Fullføringstidspunkt", "E-postadresse", "Navn", "Tidspunkt for siste endring"];
function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element #${id}`);
    return el;
}
const fileInput = getEl("file");
const btn = getEl("transposeBtn");
const output = getEl("output");
let workbook = null;
fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    output.innerHTML = "";
    btn.disabled = true;
    workbook = null;
    if (!file)
        return;
    try {
        workbook = await readWorkbookFromFile(file);
        btn.disabled = false;
    }
    catch (err) {
        alert(err instanceof Error ? err.message : String(err));
    }
});
btn.addEventListener("click", () => {
    if (!workbook)
        return;
    try {
        const sheetName = getFirstSheetName(workbook);
        const data = readSheetAsMatrix(workbook, sheetName);
        let table = sortRowsByNumericColumn(data, "Gruppenummer");
        const columnsToDelete = [...columnNamesToDelete, "ID"];
        for (const name of columnsToDelete) {
            table = deleteColumnByName(table, name);
        }
        const transposed = transpose2D(table);
        output.innerHTML = "";
        output.appendChild(document.createTextNode(`Sheet: ${sheetName} (sorted by Gruppenummer, then transposed)`));
        output.appendChild(document.createElement("br"));
        output.appendChild(document.createElement("br"));
        output.appendChild(toHtmlTable(transposed));
    }
    catch (err) {
        alert(err instanceof Error ? err.message : String(err));
    }
});
//# sourceMappingURL=main.js.map