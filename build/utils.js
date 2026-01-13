import { extractLeadingNumber } from "./excel.js"; // adjust path if needed
function findRowByName(matrix, rowName) {
    const row = matrix.find(r => String(r?.[0] ?? "") === rowName);
    if (!row)
        throw new Error(`Row "${rowName}" not found`);
    return row;
}
export function getGroupNumbers(transposed, groupRowName = "Gruppenummer") {
    const groupRow = findRowByName(transposed, groupRowName);
    const set = new Set();
    for (let c = 1; c < groupRow.length; c++) {
        const g = extractLeadingNumber(groupRow[c]);
        if (g != null)
            set.add(g);
    }
    return [...set].sort((a, b) => a - b);
}
//# sourceMappingURL=utils.js.map