import { enableTabButton, isResultsEmpty, switchToResultsTab } from './ui/tabs.js';
import { onLanguageChange } from './constants/language.js';
import { updateStaticTexts } from './ui/texts.js';
import type { GroupRadarScores } from './radar/scores.js';
import { renderRadarCharts } from './ui/render_radar.js';
import { setupUploadRows, type LoadedDataset } from './ui/upload_rows.js';

// ----------------- Types & constants -----------------

type RenderDataset = { dayNumber: string; scores: GroupRadarScores };
const loaded: RenderDataset[] = [];

// ----------------- Language change: re-render charts -----------------

updateStaticTexts();
onLanguageChange(() => {
  updateStaticTexts();
  if (loaded.length) {
    // Compute union of groups across datasets from their score maps
    const groupSet = new Set<number>();
    for (const ds of loaded) {
      for (const key of Object.keys(ds.scores)) groupSet.add(Number(key));
    }
    const groupNumbers = [...groupSet].sort((a, b) => a - b);
    renderRadarCharts(groupNumbers, loaded);
  }
});

// ----------------- Event handlers -----------------

// Multi-upload rows: assemble datasets and render overlayed charts
setupUploadRows(
  (dataset: LoadedDataset) => {
    // upsert dataset by rowId (day number may change)
    const existing = loaded.findIndex((d) => d.dayNumber === dataset.dayNumber);
    const dsEntry = { dayNumber: dataset.dayNumber, scores: dataset.scores };
    if (existing >= 0) loaded[existing] = dsEntry;
    else loaded.push(dsEntry);

    // Compute union of groups across datasets from their score maps
    const groupSet = new Set<number>();
    for (const ds of loaded) {
      for (const key of Object.keys(ds.scores)) groupSet.add(Number(key));
    }
    const groupNumbers = [...groupSet].sort((a, b) => a - b);

    renderRadarCharts(groupNumbers, loaded);

    if (!isResultsEmpty()) enableTabButton('results');
    switchToResultsTab();
  },
  ({ dayNumber }) => {
    const idx = loaded.findIndex((d) => d.dayNumber === dayNumber);
    if (idx >= 0) loaded.splice(idx, 1);

    const groupSet = new Set<number>();
    for (const ds of loaded) {
      for (const key of Object.keys(ds.scores)) groupSet.add(Number(key));
    }
    const groupNumbers = [...groupSet].sort((a, b) => a - b);
    renderRadarCharts(groupNumbers, loaded);
  },
);
