import { transpose2D } from './matrix.js';
import { getGroupNumbers } from './utils.js';
import { calculateAverageScores, computeGroupScaleScore } from './scoring.js';
import { Columns } from './constants/columns.js';
import { radarDimensions, diagramInfo } from './constants/output.js';
import html2canvas from 'html2canvas';
import { readWorkbookFromFile, getFirstSheetName, readSheetAsMatrix, sortRowsByNumericColumn, deleteColumnByName, normalizeAllCells, } from './excel.js';
import { Chart } from 'chart.js/auto';
import './style.css';
const radarLabels = radarDimensions.map((d) => d.label); // string[]
const columnNamesToDelete = [
    Columns.ID,
    Columns.Start,
    Columns.End,
    Columns.Email,
    Columns.Name,
    Columns.LastChanged,
];
const fileInput = getEl('file');
const btn = getEl('transposeBtn');
const output = getEl('output');
// Row indices (in the transposed matrix) for each scale
const managmentRowNames = [2, 5, 8, 13, 17];
const socialCooperationRowNames = [6, 9, 12, 14, 18];
const honestAndDirectRowNames = [3, 7, 10, 15, 19];
const workCommitmentRowNames = [1, 4, 11, 16, 20];
let workbook = null;
function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element #${id}`);
    return el;
}
// ---------------- Radar chart helpers ----------------
function createGroupLabel(group) {
    const box = document.createElement('div');
    box.textContent = `Group ${group}`;
    box.style.position = 'absolute';
    box.style.top = '40px';
    box.style.right = '40px';
    box.style.fontSize = '32px';
    box.style.fontWeight = '600';
    box.style.color = '#333';
    box.style.fontFamily =
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    box.style.pointerEvents = 'none';
    // make layout stable for html2canvas
    box.style.boxSizing = 'border-box';
    box.style.whiteSpace = 'nowrap';
    box.style.lineHeight = '1';
    return box;
}
function buildGroupRadarScores(transposed, groupNumbers) {
    const managementMap = calculateAverageScores(transposed, groupNumbers, managmentRowNames, 
    /* reverse */ true);
    const honestMap = calculateAverageScores(transposed, groupNumbers, honestAndDirectRowNames, 
    /* reverse */ true);
    const commitmentMap = calculateAverageScores(transposed, groupNumbers, workCommitmentRowNames, 
    /* reverse */ true);
    const socialMap = calculateAverageScores(transposed, groupNumbers, socialCooperationRowNames, 
    /* reverse */ false);
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
function createDimensionBox(dim) {
    const box = document.createElement('div');
    box.className = 'dimension-box';
    box.style.position = 'absolute';
    box.style.width = '260px';
    box.style.fontSize = '14px';
    box.style.lineHeight = '1.4';
    box.style.color = '#333';
    box.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    box.style.pointerEvents = 'none';
    // title + text
    // use innerHTML so we can bold the heading
    box.innerHTML = `<strong>${dim.label}</strong><br>${dim.description}`;
    return box;
}
// ---------- Small DOM helper factories ----------
function createGroupWrapper(container) {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '24px auto';
    wrapper.style.width = '1300px';
    container.appendChild(wrapper);
    return wrapper;
}
/**
 * Frame + page:
 * - frame: white padding around the blue border (this is what we export)
 * - page: the actual "card" with blue border, logo, info box, canvas, etc.
 */
function createFrameAndPage() {
    // outer white padding (will be captured in PNG)
    const frame = document.createElement('div');
    frame.style.background = '#ffffff';
    frame.style.padding = '12px'; // 👈 white margin outside blue border
    frame.style.display = 'inline-block'; // shrink to content
    // inner page with blue border
    const page = document.createElement('div');
    page.className = 'card';
    page.style.width = '1300px';
    page.style.height = '800px';
    page.style.padding = '24px';
    page.style.boxSizing = 'border-box';
    page.style.margin = '0';
    page.style.border = '2px solid var(--theme-color)';
    page.style.position = 'relative';
    page.style.background = '#ffffff';
    frame.appendChild(page);
    return { frame, page };
}
function createCanvasWithWrapper() {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '1200px';
    wrapper.style.height = '700px';
    wrapper.style.margin = '0 auto';
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    canvas.style.display = 'block';
    wrapper.appendChild(canvas);
    return { wrapper, canvas };
}
function createLogo() {
    const logo = document.createElement('img');
    logo.src = 'src/images/logo_ntnu.png';
    logo.alt = 'NTNU Logo';
    logo.style.position = 'absolute';
    logo.style.left = '0px';
    logo.style.bottom = '0px';
    logo.style.height = '80px';
    logo.style.pointerEvents = 'none';
    return logo;
}
function createInfoBox() {
    const infoBox = document.createElement('div');
    // add a class so we can target it in onclone
    infoBox.className = 'info-box';
    infoBox.style.position = 'absolute';
    infoBox.style.top = '2px';
    infoBox.style.left = '2px';
    infoBox.style.width = '380px';
    infoBox.style.padding = '16px';
    infoBox.style.background = '#f2f2f2';
    infoBox.style.borderBottom = '1px solid #ccc';
    infoBox.style.borderRight = '1px solid #ccc';
    infoBox.style.boxSizing = 'border-box';
    infoBox.style.fontSize = '14px';
    infoBox.style.lineHeight = '1.4';
    infoBox.style.color = '#333';
    // IMPORTANT: for html2canvas text spacing
    infoBox.style.whiteSpace = 'pre-line';
    infoBox.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    infoBox.style.letterSpacing = '0px';
    infoBox.style.wordSpacing = '0px';
    infoBox.style.pointerEvents = 'none';
    // Use textContent instead of innerHTML
    infoBox.textContent = diagramInfo.description;
    return infoBox;
}
/**
 * Export button – exports the given element (frame) so the white padding is included.
 */
function createExportButton(group, exportTarget) {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = `Last ned bilde for gruppe ${group}`;
    exportBtn.style.marginBottom = '12px';
    exportBtn.style.padding = '8px 16px';
    exportBtn.style.cursor = 'pointer';
    exportBtn.style.background = '#014F9F';
    exportBtn.style.color = 'white';
    exportBtn.style.borderRadius = '6px';
    exportBtn.style.border = 'none';
    exportBtn.style.fontSize = '14px';
    exportBtn.style.display = 'block';
    exportBtn.style.marginLeft = 'auto';
    exportBtn.style.marginRight = 'auto';
    exportBtn.onclick = async () => {
        // wait for fonts and chart to finish rendering
        const doc = document;
        if (doc.fonts?.ready) {
            // fonts.ready is a Promise that resolves when webfonts finish loading
            await doc.fonts.ready;
        }
        await new Promise((r) => requestAnimationFrame(() => r()));
        await new Promise((r) => requestAnimationFrame(() => r()));
        const imgCanvas = await html2canvas(exportTarget, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `gruppe-${group}.png`;
        link.href = imgCanvas.toDataURL('image/png');
        link.click();
    };
    return exportBtn;
}
// ---------- Main render function ----------
function renderRadarCharts(groupNumbers, radarScores) {
    const dayInput = document.getElementById('dayInput');
    const dayNumber = dayInput?.value || '1';
    const container = document.getElementById('charts');
    if (!container)
        return;
    container.innerHTML = '';
    for (const group of groupNumbers) {
        const scores = radarScores[group];
        if (!scores)
            continue;
        const values = [
            scores.honestAndDirect ?? 0,
            scores.workCommitment ?? 0,
            scores.management ?? 0,
            scores.socialCooperation ?? 0,
        ];
        // Wrapper for button + frame+page
        const groupWrapper = createGroupWrapper(container);
        // Frame (white padding) + page (blue border, content)
        const { frame, page } = createFrameAndPage();
        groupWrapper.appendChild(frame);
        // Export button – exports the FRAME so padding is captured
        const exportBtn = createExportButton(group, frame);
        groupWrapper.insertBefore(exportBtn, frame);
        // Radar canvas inside the page
        const { wrapper: canvasWrapper, canvas } = createCanvasWithWrapper();
        page.appendChild(canvasWrapper);
        // Decorations on the page
        page.appendChild(createInfoBox());
        page.appendChild(createLogo());
        // --- Dimension description boxes around the radar ---
        const honestDim = radarDimensions.find((d) => d.id === 'honestAndDirect');
        const workDim = radarDimensions.find((d) => d.id === 'workCommitment');
        const managementDim = radarDimensions.find((d) => d.id === 'management');
        const socialDim = radarDimensions.find((d) => d.id === 'socialCooperation');
        const honestBox = createDimensionBox(honestDim);
        honestBox.style.top = '120px';
        honestBox.style.left = '730px';
        const workBox = createDimensionBox(workDim);
        workBox.style.top = '450px';
        workBox.style.right = '60px';
        const managementBox = createDimensionBox(managementDim);
        managementBox.style.bottom = '40px';
        managementBox.style.left = '700px';
        const socialBox = createDimensionBox(socialDim);
        socialBox.style.top = '460px';
        socialBox.style.left = '40px';
        page.appendChild(honestBox);
        page.appendChild(workBox);
        page.appendChild(managementBox);
        page.appendChild(socialBox);
        page.appendChild(createGroupLabel(group));
        // Chart.js radar
        const ctx = canvas.getContext('2d');
        if (!ctx)
            continue;
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [...radarLabels],
                datasets: [
                    {
                        label: `Day ${dayNumber}`,
                        data: values,
                        borderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 5,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 30, bottom: 30, left: 30, right: 30 },
                },
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 30 } },
                    title: {
                        display: true,
                        text: diagramInfo.title,
                        font: {
                            size: 32,
                            weight: 'bold',
                        },
                        padding: {
                            top: 10,
                            bottom: 4,
                        },
                    },
                    subtitle: {
                        display: true,
                        text: diagramInfo.subtitle,
                        font: {
                            size: 14,
                            weight: 'normal',
                        },
                        color: '#666',
                        padding: {
                            bottom: 20,
                        },
                    },
                },
                scales: {
                    r: {
                        min: 1,
                        max: 7,
                        ticks: {
                            stepSize: 1,
                            backdropColor: 'transparent',
                            font: { size: 14 },
                        },
                        grid: { circular: false },
                        angleLines: { display: true },
                        pointLabels: {
                            font: { size: 14, weight: 600 },
                        },
                        startAngle: 0,
                    },
                },
            },
        });
    }
}
// ----------------- Event handlers -----------------
fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    output.innerHTML = '';
    btn.disabled = true;
    workbook = null;
    if (!file)
        return;
    try {
        workbook = await readWorkbookFromFile(file);
        btn.disabled = false;
    }
    catch (err) {
        alert(err instanceof Error ? err.message : String(err));
    }
});
btn.addEventListener('click', () => {
    if (!workbook)
        return;
    try {
        output.innerHTML = '';
        const sheetName = getFirstSheetName(workbook);
        const data = readSheetAsMatrix(workbook, sheetName);
        let table = sortRowsByNumericColumn(data, Columns.GroupNumber);
        table = normalizeAllCells(table);
        const transposedBeforeDelete = transpose2D(table);
        const groupNumbers = getGroupNumbers(transposedBeforeDelete);
        const groups = groupNumbers.length;
        output.appendChild(document.createTextNode(`Found ${groups} groups: ${groupNumbers.join(', ')}`));
        output.appendChild(document.createElement('br'));
        output.appendChild(document.createElement('br'));
        for (const name of columnNamesToDelete) {
            table = deleteColumnByName(table, name);
        }
        const transposed = transpose2D(table);
        // Text summary per group
        for (const group of groupNumbers) {
            const managementScore = computeGroupScaleScore(transposed, group, managmentRowNames, true, 3);
            const honestAndDirectScore = computeGroupScaleScore(transposed, group, honestAndDirectRowNames, true, 3);
            const workCommitmentScore = computeGroupScaleScore(transposed, group, workCommitmentRowNames, true, 3);
            const socialCooperationScore = computeGroupScaleScore(transposed, group, socialCooperationRowNames, false, 3);
            output.appendChild(document.createTextNode(`Group ${group} — ` +
                `Management: ${managementScore}, ` +
                `Social Cooperation: ${socialCooperationScore}, ` +
                `Honest & Direct: ${honestAndDirectScore}, ` +
                `Work Commitment: ${workCommitmentScore}`));
            output.appendChild(document.createElement('br'));
        }
        output.appendChild(document.createElement('br'));
        const radarScores = buildGroupRadarScores(transposed, groupNumbers);
        renderRadarCharts(groupNumbers, radarScores);
    }
    catch (err) {
        alert(err instanceof Error ? err.message : String(err));
    }
});
//# sourceMappingURL=main.js.map