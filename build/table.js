export function toHtmlTable(matrix) {
    const table = document.createElement('table');
    // Todo use tailwind css classes instead
    table.border = '1';
    table.cellPadding = '6';
    for (const row of matrix) {
        const tr = document.createElement('tr');
        for (const cell of row) {
            const td = document.createElement('td');
            td.textContent = cell == null ? '' : String(cell);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}
//# sourceMappingURL=table.js.map