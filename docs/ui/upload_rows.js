import { getEl } from './dom.js';
import { createCloseButton } from './buttons.js';
import { readWorkbookFromFile, getFirstSheetName, readSheetAsMatrix, sortRowsByNumericColumn, deleteColumnByName, normalizeAllCells, } from '../excel.js';
import { transpose2D } from '../matrix.js';
import { getGroupNumbers } from '../utils.js';
import { Columns } from '../constants/columns.js';
import { buildGroupRadarScores } from '../radar/scores.js';
const columnNamesToDelete = [
    Columns.ID,
    Columns.Start,
    Columns.End,
    Columns.Email,
    Columns.Name,
    Columns.LastChanged,
];
export function setupUploadRows(onDatasetReady, onRowRemoved) {
    const rowsContainer = getEl('uploadRows');
    const addBtn = getEl('addUploadRow');
    const generateAllBtn = getEl('generateAllBtn');
    let nextRowId = 0;
    function attachRowHandlers(rowEl, rowId) {
        const fileInput = rowEl.querySelector('input[type="file"]');
        const dayInput = rowEl.querySelector('input[data-day-input]');
        const removeBtn = rowEl.querySelector('button.removeRowBtn');
        fileInput.addEventListener('change', () => {
            updateGenerateAllEnabled();
        });
        // Remove row handler (optional on initial HTML)
        if (removeBtn) {
            const replacement = createCloseButton('#EF4444', {
                onClick: () => {
                    const currentDay = dayInput.value || '';
                    rowEl.remove();
                    updateGenerateAllEnabled();
                    onRowRemoved?.({ rowId, dayNumber: currentDay });
                },
            });
            removeBtn.replaceWith(replacement);
        }
        else {
            const divider = document.createElement('div');
            divider.className = 'h-6 w-px bg-slate-300';
            const closeBtn = createCloseButton('#EF4444', {
                onClick: () => {
                    const currentDay = dayInput.value || '';
                    rowEl.remove();
                    updateGenerateAllEnabled();
                    onRowRemoved?.({ rowId, dayNumber: currentDay });
                },
            });
            rowEl.appendChild(divider);
            rowEl.appendChild(closeBtn);
        }
        return { row: rowEl, fileInput, dayInput };
    }
    function updateGenerateAllEnabled() {
        const anySelected = Array.from(rowsContainer.querySelectorAll('input[type="file"]')).some((inp) => Boolean(inp.files?.length));
        generateAllBtn.disabled = !anySelected;
    }
    async function processRow(row) {
        const fileInput = row.querySelector('input[type="file"]');
        const dayInput = row.querySelector('input[data-day-input]');
        if (!fileInput || !dayInput)
            return;
        const file = fileInput.files?.[0];
        if (!file)
            return;
        try {
            const workbook = await readWorkbookFromFile(file);
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
            const scores = buildGroupRadarScores(transposed, groupNumbers);
            onDatasetReady({ rowId: Number(row.dataset.rowId ?? -1), dayNumber: dayInput.value || '1', scores });
        }
        catch (err) {
            alert(err instanceof Error ? err.message : String(err));
        }
    }
    function createRow(initialDay) {
        const rowId = nextRowId++;
        const row = document.createElement('div');
        row.className = 'upload-row mb-6 flex flex-wrap items-center justify-center gap-4';
        row.dataset.rowId = String(rowId);
        const fileInputId = `file-${rowId}`;
        row.innerHTML = `
      <label class="uploadBtn inline-flex cursor-pointer items-center rounded-lg bg-(--theme-color) px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-40 hover:bg-slate-800" for="${fileInputId}">
        Upload Excel File
      </label>

      <div class="h-6 w-px bg-slate-300"></div>

      <input id="${fileInputId}" type="file" accept=".xlsx,.xls" class="hidden" />

      <div class="flex items-center gap-2">
        <span class="dayLabel text-sm font-medium text-(--theme-color)">Day</span>
        <input data-day-input type="number" min="1" value="${initialDay ?? ''}" class="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm focus:border-(--theme-color) focus:outline-none focus:ring-2 focus:ring-(--theme-color)" />
      </div>

      <div class="h-6 w-px bg-slate-300"></div>
      <button class="removeRowBtn" title="Remove row">X</button>
    `;
        rowsContainer.appendChild(row);
        const els = attachRowHandlers(row, rowId);
        return els;
    }
    // Initialize with existing row in HTML if present; otherwise create first row
    const existingRow = rowsContainer.querySelector('.upload-row');
    if (existingRow) {
        attachRowHandlers(existingRow, nextRowId++);
    }
    else {
        createRow();
    }
    addBtn.addEventListener('click', () => {
        // Infer next day number from current max
        const dayInputs = rowsContainer.querySelectorAll('input[data-day-input]');
        let maxDay = 0;
        dayInputs.forEach((inp) => {
            const v = Number(inp.value || '0');
            if (!Number.isNaN(v))
                maxDay = Math.max(maxDay, v);
        });
        const nextDay = (maxDay || 0) + 1;
        createRow(String(nextDay));
        updateGenerateAllEnabled();
    });
    generateAllBtn.addEventListener('click', async () => {
        const rows = rowsContainer.querySelectorAll('.upload-row');
        for (const row of Array.from(rows)) {
            await processRow(row);
        }
    });
    updateGenerateAllEnabled();
}
//# sourceMappingURL=upload_rows.js.map