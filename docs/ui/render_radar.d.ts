import type { GroupRadarScores } from '../radar/scores.js';
import '../style.css';
type DatasetInput = {
    dayNumber: string;
    scores: GroupRadarScores;
};
export declare function renderRadarCharts(groupNumbers: number[], datasets: DatasetInput[]): void;
export {};
//# sourceMappingURL=render_radar.d.ts.map