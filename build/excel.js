export async function readWorkbookFromFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    return XLSX.read(arrayBuffer, { type: "array" });
}
export function getFirstSheetName(workbook) {
    return workbook.SheetNames[0];
}
export function readSheetAsMatrix(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ""
    });
}
export function sortRowsByNumericColumn(data, columnName) {
    if (data.length < 2)
        throw new Error("Sheet has no data");
    const header = data[0] ?? [];
    const rows = data.slice(1);
    const colIndex = header.indexOf(columnName);
    if (colIndex === -1)
        throw new Error(`Column "${columnName}" not found`);
    rows.sort((a, b) => Number(a[colIndex]) - Number(b[colIndex]));
    return [header, ...rows];
}
//# sourceMappingURL=excel.js.map