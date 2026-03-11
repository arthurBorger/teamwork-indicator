import { describe, it, expect, vi, afterEach } from 'vitest';
import * as utils from './utils.js';
import { computeGroupScaleScore } from './scoring.js';
afterEach(() => {
    vi.restoreAllMocks();
});
describe('computeGroupScaleScore', () => {
    it('averages valid member scores and formats with given decimals', () => {
        // Matrix layout used by calcAvgForMember:
        // - each row[0] = row name (here: "1", "2", "3")
        // - rowIndices passed to computeGroupScaleScore are [1,2,3]
        //
        // Columns:
        //   0 = row label
        //   1 = member 1
        //   2 = member 2
        //   3 = member 3
        //
        // Values:
        //   member 1: always 4  → avg = 4
        //   member 2: always 5  → avg = 5
        //   member 3: always 7  → avg = 7
        //
        // Group average = (4 + 5 + 7) / 3 = 16 / 3 ≈ 5.333... → "5.33"
        const transposed = [
            ['1', 4, 5, 7],
            ['2', 4, 5, 7],
            ['3', 4, 5, 7],
        ];
        const groupNumber = 1;
        const rowIndices = [1, 2, 3]; // these are "row names" used by findRowByName
        // Pretend group 1 has members in columns 1, 2, 3
        vi.spyOn(utils, 'getGroupMembers').mockReturnValue([1, 2, 3]);
        const result = computeGroupScaleScore(transposed, groupNumber, rowIndices, 
        /* reverse */ false, 
        /* decimals */ 2);
        expect(result).toBe('5.33');
    });
    it('ignores members whose scores produce null averages', () => {
        // Here we want:
        // - 3 members in the group
        // - first two have no valid values → avg = null
        // - last one has valid values → avg = 6
        //
        // So the group average should just be 6.
        //
        // Matrix:
        // row "10" and "11" are our "questions" (rowIndices)
        const transposed = [
            ['10', null, null, 6],
            ['11', null, null, 6],
        ];
        const groupNumber = 2;
        const rowIndices = [10, 11];
        // Members = columns 1, 2, 3
        vi.spyOn(utils, 'getGroupMembers').mockReturnValue([1, 2, 3]);
        const result = computeGroupScaleScore(transposed, groupNumber, rowIndices, 
        /* reverse */ false, 
        /* decimals */ 1);
        // member 1: all null  → calcAvgForMember = null → ignored
        // member 2: all null  → calcAvgForMember = null → ignored
        // member 3: [6, 6]    → avg = 6                → used
        expect(result).toBe('2.0');
    });
    it('returns "N/A" when there are no group members', () => {
        const transposed = [['1', 4, 5]];
        const groupNumber = 99;
        const rowIndices = [1];
        // No columns for this group
        vi.spyOn(utils, 'getGroupMembers').mockReturnValue([]);
        const result = computeGroupScaleScore(transposed, groupNumber, rowIndices, 
        /* reverse */ false, 
        /* decimals */ 2);
        expect(result).toBe('N/A');
    });
    it('calculates correct score for one member with consistent answers', () => {
        const transposed = [];
        const studentAnswer = 7;
        // 20 questions: rows "1".."20", one member in column 1
        for (let question = 1; question <= 20; question++) {
            transposed.push([String(question), studentAnswer]);
        }
        const groupNumber = 1;
        // rowIndices must match the row "names" used in transposed (1..20)
        const rowIndices = Array.from({ length: 20 }, (_, i) => i + 1);
        // One member column (index 1) belongs to this group
        vi.spyOn(utils, 'getGroupMembers').mockReturnValue([1]);
        const result = computeGroupScaleScore(transposed, groupNumber, rowIndices, 
        /* reverse */ false, 
        /* decimals */ 2);
        // Average of all 7s is 7 → formatted with 2 decimals
        expect(result).toBe('7.00');
    });
});
//# sourceMappingURL=scoring.test.js.map