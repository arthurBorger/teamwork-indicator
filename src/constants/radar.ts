export const radarDimensionIds = [
  'honestAndDirect',
  'workCommitment',
  'management',
  'socialCooperation',
] as const;

export type RadarDimensionId = (typeof radarDimensionIds)[number];