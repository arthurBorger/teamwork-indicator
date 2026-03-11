import { type GroupRadarScores } from '../radar/scores.js';
export type LoadedDataset = {
    rowId: number;
    dayNumber: string;
    scores: GroupRadarScores;
};
export declare function setupUploadRows(onDatasetReady: (dataset: LoadedDataset) => void, onRowRemoved?: (info: {
    rowId: number;
    dayNumber: string;
}) => void): void;
//# sourceMappingURL=upload_rows.d.ts.map