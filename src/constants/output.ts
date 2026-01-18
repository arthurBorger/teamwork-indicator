export const buttonLabels = {
  uploadExcel: 'Upload Excel File',
  transposeData: 'Transpose Data',
  calculateScores: 'Calculate Scores',
  exportDiagram: 'Download Diagram for Group',
} as const;

export const diagramInfo = {
  title: 'Teamwork Indicator',
  subtitle: 'Experts in Teamwork',
  description:`This diagram shows your group's scores on four dimensions.

The farther out from the center your values are placed on each of the four axes, the better. In your group, discuss what the scores may indicate about the current functioning of the group.

If you have completed the Teamwork Indicator before, you can also compare the current values with the previous ones and discuss what any changes may say about the development in your group.
` 
} as const;

export const radarDimensions = [
  {
    id: 'honestAndDirect',
    label: 'Honest and direct',
    description: `This dimension indicates the attitudes of the group members toward open, direct
and honest sharing of feedback and reflections about the functioning of individuals,
subgroups and the whole group.`,
  },
  {
    id: 'workCommitment',
    label: 'Work Commitment',
    description: `This dimension indicates the degree of priority members give to the tasks of the group,
willingness to collaborate constructively and be committed in the contributions towards
completion of the group tasks.`,
  },
  {
    id: 'management',
    label: 'Management',
    description: `This dimension indicates how well the group is organized with regard to the management of
time, progress and being goal-directed as well as productive.`,
  },
  {
    id: 'socialCooperation',
    label: 'Social Cooperation',
    description: `This dimension indicates the degree of positive social climate, support, the willingness
to listen and to include the members of the group.`,
  },
] as const;

export type RadarDimensionId = (typeof radarDimensions)[number]['id'];
