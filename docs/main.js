import { enableTabButton, isResultsEmpty, switchToResultsTab } from './ui/tabs.js';
import { onLanguageChange } from './constants/language.js';
import { updateStaticTexts } from './ui/texts.js';
import { renderRadarCharts } from './ui/render_radar.js';
import { setupUploadRows } from './ui/upload_rows.js';
const loaded = [];
// ----------------- Language change: re-render charts -----------------
updateStaticTexts();
onLanguageChange(() => {
    updateStaticTexts();
    if (loaded.length) {
        // Compute union of groups across datasets from their score maps
        const groupSet = new Set();
        for (const ds of loaded) {
            for (const key of Object.keys(ds.scores))
                groupSet.add(Number(key));
        }
        const groupNumbers = [...groupSet].sort((a, b) => a - b);
        renderRadarCharts(groupNumbers, loaded);
    }
});
// ----------------- Event handlers -----------------
// Multi-upload rows: assemble datasets and render overlayed charts
setupUploadRows((dataset) => {
    // upsert dataset by rowId (day number may change)
    const existing = loaded.findIndex((d) => d.dayNumber === dataset.dayNumber);
    const dsEntry = { dayNumber: dataset.dayNumber, scores: dataset.scores };
    if (existing >= 0)
        loaded[existing] = dsEntry;
    else
        loaded.push(dsEntry);
    // Compute union of groups across datasets from their score maps
    const groupSet = new Set();
    for (const ds of loaded) {
        for (const key of Object.keys(ds.scores))
            groupSet.add(Number(key));
    }
    const groupNumbers = [...groupSet].sort((a, b) => a - b);
    renderRadarCharts(groupNumbers, loaded);
    if (!isResultsEmpty())
        enableTabButton('results');
    switchToResultsTab();
});
//# sourceMappingURL=main.js.map