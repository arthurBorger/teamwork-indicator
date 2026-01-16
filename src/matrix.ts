export type Matrix = unknown[][];

// Transposes a 2D matrix (array of arrays).
export function transpose2D(matrix: Matrix): Matrix {
  const rows = matrix.length;
  // Handle jagged arrays by finding the longest row.
  const cols = Math.max(0, ...matrix.map((r) => r.length));
  // Initialize the output matrix with empty strings.
  const out: Matrix = Array.from({ length: cols }, () => Array(rows).fill(''));
  // Fill "r" is rows and "c" is cols.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Use nullish coalescing to handle missing values in jagged arrays.
      out[c]![r] = matrix[r]?.[c] ?? '';
    }
  }
  return out;
}
