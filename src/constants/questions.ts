export const questionRows = {
  management: [2, 5, 8, 13, 17],
  socialCooperation: [6, 9, 12, 14, 18],
  honestAndDirect: [3, 7, 10, 15, 19],
  workCommitment: [1, 4, 11, 16, 20],
} as const;

export type QuestionKey = keyof typeof questionRows;