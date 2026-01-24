import { transpose2D, type Matrix } from './matrix.js';
import { getGroupNumbers } from './utils.js';
import { calculateAverageScores } from './scoring.js';
import { Columns } from './constants/columns.js';
import {
  getDiagramInfo,
  getButtonLabels,
  getRadarDimensions,
  getFormLink,
  getTitleText,
} from './constants/output.js';
import html2canvas from 'html2canvas';
const logoUrl = new URL('./images/logo_ntnu.png', import.meta.url).href;

import {
  readWorkbookFromFile,
  getFirstSheetName,
  readSheetAsMatrix,
  sortRowsByNumericColumn,
  type Workbook,
  deleteColumnByName,
  normalizeAllCells,
} from './excel.js';
import { Chart } from 'chart.js/auto';

import './style.css';
import { getLanguage, onLanguageChange } from './constants/language.js';

const columnNamesToDelete = [
  Columns.ID,
  Columns.Start,
  Columns.End,
  Columns.Email,
  Columns.Name,
  Columns.LastChanged,
];

const fileInput = getEl<HTMLInputElement>('file');
const btn = getEl<HTMLButtonElement>('transposeBtn');

// Row indices (in the transposed matrix) for each scale
const managmentRowNames = [2, 5, 8, 13, 17];
const socialCooperationRowNames = [6, 9, 12, 14, 18];
const honestAndDirectRowNames = [3, 7, 10, 15, 19];
const workCommitmentRowNames = [1, 4, 11, 16, 20];

let workbook: Workbook | null = null;

// store last data so we can re-render on language change
let lastGroupNumbers: number[] | null = null;
let lastRadarScores: GroupRadarScores | null = null;

// ---------- Simple preview modal (singleton) ----------
const previewModal = document.createElement('div');
previewModal.id = 'previewModal';
previewModal.style.position = 'fixed';
previewModal.style.inset = '0';
previewModal.style.background = 'rgba(0, 0, 0, 0.6)';
previewModal.style.display = 'none';
previewModal.style.alignItems = 'center';
previewModal.style.justifyContent = 'center';
previewModal.style.zIndex = '9999';

const previewInner = document.createElement('div');
previewInner.style.background = '#ffffff';
previewInner.style.padding = '16px';
previewInner.style.borderRadius = '8px';
previewInner.style.maxWidth = '90vw';
previewInner.style.maxHeight = '90vh';
previewInner.style.boxSizing = 'border-box';
previewInner.style.display = 'flex';
previewInner.style.flexDirection = 'column';
previewInner.style.gap = '8px';

const previewImg = document.createElement('img');
previewImg.id = 'previewImage';
previewImg.style.maxWidth = '100%';
previewImg.style.maxHeight = '80vh';
previewImg.style.objectFit = 'contain';
previewImg.alt = 'Diagram preview';

const closePreviewBtn = document.createElement('button');
closePreviewBtn.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
`;
closePreviewBtn.style.alignSelf = 'flex-end';
closePreviewBtn.style.padding = '6px 12px';
closePreviewBtn.style.border = 'none';
closePreviewBtn.style.borderRadius = '4px';
closePreviewBtn.style.background = '#014F9F';
closePreviewBtn.style.color = '#fff';
closePreviewBtn.style.cursor = 'pointer';

closePreviewBtn.addEventListener('click', () => {
  previewModal.style.display = 'none';
});

// Close when clicking the dark background
previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.style.display = 'none';
  }
});

previewInner.appendChild(closePreviewBtn);
previewInner.appendChild(previewImg);
previewModal.appendChild(previewInner);
document.body.appendChild(previewModal);

function createPreviewButton(group: number, exportTarget: HTMLDivElement): HTMLButtonElement {
  const previewBtn = document.createElement('button');
  previewBtn.textContent = `Preview ${group}`;

  previewBtn.style.marginBottom = '12px';
  previewBtn.style.padding = '8px 16px';
  previewBtn.style.cursor = 'pointer';
  previewBtn.style.background = '#ffffff';
  previewBtn.style.color = '#014F9F';
  previewBtn.style.borderRadius = '6px';
  previewBtn.style.border = '1px solid #014F9F';
  previewBtn.style.fontSize = '14px';

  previewBtn.onclick = async () => {
    const doc = document as Document & { fonts?: FontFaceSet };

    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const imgCanvas = await html2canvas(exportTarget, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const dataUrl = imgCanvas.toDataURL('image/png');
    previewImg.src = dataUrl;
    previewModal.style.display = 'flex';
  };

  return previewBtn;
}

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}
function updateStaticTexts() {
  const { uploadExcel, generateResults } = getButtonLabels();
  const title = getTitleText();
  const { day } = getDiagramInfo();
  const generateResultsBtn = document.getElementById('transposeBtn');
  const chooseFileLabel = document.getElementById('uploadBtn');
  const dayLabelEl = document.getElementById('dayLabel');
  const titleEl = document.getElementById('title');

  if (chooseFileLabel && generateResultsBtn && titleEl && dayLabelEl) {
    titleEl.textContent = title;
    chooseFileLabel.textContent = uploadExcel;
    generateResultsBtn.textContent = generateResults;
    dayLabelEl.textContent = day;
  }
  // --- form link part ---
  const formLinkConfig = getFormLink();
  const formLinkContainer = document.getElementById('formLinkContainer');

  if (formLinkContainer) {
    formLinkContainer.innerHTML = ''; // clear old content

    // Instruction line
    const instruction = document.createTextNode(formLinkConfig.instruction);
    formLinkContainer.appendChild(instruction);

    // Line break
    formLinkContainer.appendChild(document.createElement('br'));
    formLinkContainer.appendChild(document.createElement('br'));

    // <strong>LANG:</strong>
    const strong = document.createElement('strong');
    strong.textContent = `${formLinkConfig.languageLabel}:`;
    formLinkContainer.appendChild(strong);

    // space between "LANG:" and the link
    formLinkContainer.appendChild(document.createTextNode(' '));

    // <a href="...">Link text</a>
    const link = document.createElement('a');
    link.href = formLinkConfig.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-blue-600 underline';
    link.textContent = formLinkConfig.linkText;

    formLinkContainer.appendChild(link);
  }
}
// ---------------- Radar chart helpers ----------------
function createGroupLabel(group: number): HTMLDivElement {
  const box = document.createElement('div');
  // If you want this translated later, move "Group" into translations
  box.textContent = `${getDiagramInfo().group} ${group}`;

  box.style.position = 'absolute';
  box.style.top = '40px';
  box.style.right = '40px';
  box.style.fontSize = '32px';
  box.style.fontWeight = '600';
  box.style.color = '#333';
  box.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';

  box.style.pointerEvents = 'none';

  // make layout stable for html2canvas
  box.style.boxSizing = 'border-box';
  box.style.whiteSpace = 'nowrap';
  box.style.lineHeight = '1';

  return box;
}

type GroupRadarScores = Record<
  number,
  {
    honestAndDirect: number | null;
    workCommitment: number | null;
    management: number | null;
    socialCooperation: number | null;
  }
>;

function buildGroupRadarScores(transposed: Matrix, groupNumbers: number[]): GroupRadarScores {
  const managementMap = calculateAverageScores(
    transposed,
    groupNumbers,
    managmentRowNames,
    /* reverse */ true,
  );
  const honestMap = calculateAverageScores(
    transposed,
    groupNumbers,
    honestAndDirectRowNames,
    /* reverse */ true,
  );
  const commitmentMap = calculateAverageScores(
    transposed,
    groupNumbers,
    workCommitmentRowNames,
    /* reverse */ true,
  );
  const socialMap = calculateAverageScores(
    transposed,
    groupNumbers,
    socialCooperationRowNames,
    /* reverse */ false,
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

function createDimensionBox(dim: { label: string; description: string }): HTMLDivElement {
  const box = document.createElement('div');
  box.className = 'dimension-box';

  box.style.position = 'absolute';
  box.style.width = '260px';
  box.style.fontSize = '14px';
  box.style.lineHeight = '1.4';
  box.style.color = '#333';
  box.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';

  box.style.pointerEvents = 'none';

  box.innerHTML = `<strong>${dim.label}</strong><br>${dim.description}`;

  return box;
}

// ---------- Small DOM helper factories ----------

function createGroupWrapper(container: HTMLElement): HTMLDivElement {
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
function createFrameAndPage(): { frame: HTMLDivElement; page: HTMLDivElement } {
  // outer white padding (will be captured in PNG)
  const frame = document.createElement('div');
// Make it render, but off-screen
  frame.style.position = 'absolute';
  frame.style.left = '-99999px';
  frame.style.top = '0';
  frame.style.background = '#ffffff';
  frame.style.padding = '12px';
  frame.style.display = 'inline-block'; // still needed so layout is correct


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

function createCanvasWithWrapper(): { wrapper: HTMLDivElement; canvas: HTMLCanvasElement } {
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

function createLogo(): HTMLImageElement {
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.alt = 'NTNU Logo';
  logo.style.position = 'absolute';
  logo.style.left = '0px';
  logo.style.bottom = '0px';
  logo.style.height = '80px';
  logo.style.pointerEvents = 'none';
  return logo;
}

function createInfoBox(): HTMLDivElement {
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
  const { description } = getDiagramInfo();
  infoBox.textContent = description;
  return infoBox;
}

/**
 * Export button – exports the given element (frame) so the white padding is included.
 */
function createExportButton(group: number, exportTarget: HTMLDivElement): HTMLButtonElement {
  const exportBtn = document.createElement('button');
  const { exportDiagram } = getButtonLabels();
  exportBtn.textContent = `${exportDiagram} ${group}`;

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
    const doc = document as Document & { fonts?: FontFaceSet };

    if (doc.fonts?.ready) {
      // fonts.ready is a Promise that resolves when webfonts finish loading
      await doc.fonts.ready;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

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

function renderRadarCharts(groupNumbers: number[], radarScores: GroupRadarScores): void {
  const dayInput = document.getElementById('dayInput') as HTMLInputElement;
  const dayNumber = dayInput?.value || '1';
  const container = document.getElementById('charts');
  if (!container) return;

  container.innerHTML = '';

  // cache language-related data once per render
  const lang = getLanguage();
  const radarDimensions = getRadarDimensions(lang);
  const radarLabels = radarDimensions.map((d) => d.label);
  const { title, subtitle, day } = getDiagramInfo();

  for (const group of groupNumbers) {
    const scores = radarScores[group];
    if (!scores) continue;

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

    // Buttons row: Preview + Export
    const exportBtn = createExportButton(group, frame);
    const previewBtn = createPreviewButton(group, frame);

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '8px';
    buttonRow.style.justifyContent = 'flex-end';
    buttonRow.style.marginBottom = '12px';

    buttonRow.appendChild(previewBtn);
    buttonRow.appendChild(exportBtn);

    groupWrapper.insertBefore(buttonRow, frame);

    // Radar canvas inside the page
    const { wrapper: canvasWrapper, canvas } = createCanvasWithWrapper();
    page.appendChild(canvasWrapper);

    // Decorations on the page
    page.appendChild(createInfoBox());
    page.appendChild(createLogo());

    // --- Dimension description boxes around the radar ---
    const honestDim = radarDimensions.find((d) => d.id === 'honestAndDirect')!;
    const workDim = radarDimensions.find((d) => d.id === 'workCommitment')!;
    const managementDim = radarDimensions.find((d) => d.id === 'management')!;
    const socialDim = radarDimensions.find((d) => d.id === 'socialCooperation')!;

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
    if (!ctx) continue;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: `${day} ${dayNumber}`, // move "Day" to translations if you want
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
            text: title,
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
            text: subtitle,
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

// ----------------- Language change: re-render charts -----------------
updateStaticTexts();
onLanguageChange(() => {
  updateStaticTexts();
  if (lastGroupNumbers && lastRadarScores) {
    renderRadarCharts(lastGroupNumbers, lastRadarScores);
  }
});

// ----------------- Event handlers -----------------

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  btn.disabled = true;
  workbook = null;

  if (!file) return;

  try {
    workbook = await readWorkbookFromFile(file);
    btn.disabled = false;
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});

btn.addEventListener('click', () => {
  if (!workbook) return;

  try {
    const sheetName = getFirstSheetName(workbook);
    const data = readSheetAsMatrix(workbook, sheetName);

    let table = sortRowsByNumericColumn(data, Columns.GroupNumber);
    table = normalizeAllCells(table);

    const transposedBeforeDelete = transpose2D(table);
    const groupNumbers = getGroupNumbers(transposedBeforeDelete);

    for (const name of columnNamesToDelete) {
      table = deleteColumnByName(table, name);
    }
    const transposed = transpose2D(table);

    const radarScores = buildGroupRadarScores(transposed, groupNumbers);

    // store last data for re-render on language change
    lastGroupNumbers = groupNumbers;
    lastRadarScores = radarScores;

    renderRadarCharts(groupNumbers, radarScores);
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});
