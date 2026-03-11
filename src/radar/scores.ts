import type { Matrix } from '../matrix.js';
import { calculateAverageScores } from '../scoring.js';
import { questionRows } from '../constants/questions.js';

export type GroupRadarScores = Record<
  number,
  {
    honestAndDirect: number | null;
    workCommitment: number | null;
    management: number | null;
    socialCooperation: number | null;
  }
>;

export function buildGroupRadarScores(
  transposed: Matrix,
  groupNumbers: number[],
): GroupRadarScores {
  const managementMap = calculateAverageScores(
    transposed,
    groupNumbers,
    questionRows.management,
    true,
  );
  const honestMap = calculateAverageScores(
    transposed,
    groupNumbers,
    questionRows.honestAndDirect,
    true,
  );
  const commitmentMap = calculateAverageScores(
    transposed,
    groupNumbers,
    questionRows.workCommitment,
    true,
  );
  const socialMap = calculateAverageScores(
    transposed,
    groupNumbers,
    questionRows.socialCooperation,
    false,
  );

  const result: GroupRadarScores = {};

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

