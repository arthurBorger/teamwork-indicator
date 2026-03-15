import { extractLeadingNumber } from './excel.js';
import { Columns } from './constants/columns.js';
/**
 * Returns the first row whose first cell matches `rowName` (as string).
 * Throws a descriptive error if the row is not found.
 */
export function findRowByName(matrix, rowName) {
    const row = matrix.find((r) => String(r?.[0] ?? '') === rowName);
    if (!row)
        throw new Error(`Row "${rowName}" not found`);
    return row;
}
export function getGroupNumbers(transposed) {
    const groupRow = findRowByName(transposed, Columns.GroupNumber);
    const set = new Set();
    for (let c = 1; c < groupRow.length; c++) {
        const g = extractLeadingNumber(groupRow[c]);
        if (g != null)
            set.add(g);
    }
    return [...set].sort((a, b) => a - b);
}
// Returns the column indices of members in the given group.
export function getGroupMembers(transposed, groupNumber) {
    const groupRow = findRowByName(transposed, Columns.GroupNumber);
    if (!groupRow) {
        return [];
    }
    const members = [];
    // start at 1 to skip header at column 0
    for (let c = 1; c < groupRow.length; c++) {
        const g = extractLeadingNumber(groupRow[c]);
        if (g === groupNumber) {
            members.push(c);
        }
    }
    return members;
}
//# sourceMappingURL=utils.js.map