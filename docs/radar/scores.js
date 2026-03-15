import { calculateAverageScores } from '../scoring.js';
import { questionRows } from '../constants/questions.js';
export function buildGroupRadarScores(transposed, groupNumbers) {
    const managementMap = calculateAverageScores(transposed, groupNumbers, questionRows.management, true);
    const honestMap = calculateAverageScores(transposed, groupNumbers, questionRows.honestAndDirect, true);
    const commitmentMap = calculateAverageScores(transposed, groupNumbers, questionRows.workCommitment, true);
    const socialMap = calculateAverageScores(transposed, groupNumbers, questionRows.socialCooperation, false);
    const result = {};
    for (const g of groupNumbers) {
        result[g] = {
            honestAndDirect: honestMap.get(g) ?? null,
            workCommitment: commitmentMap.get(g) ?? null,
            management: managementMap.get(g) ?? null,
            socialCooperation: socialMap.get(g) ?? null,
        };
    }
    return result;
}
//# sourceMappingURL=scores.js.map