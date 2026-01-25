import { questionRows } from './constants/questions.js';
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
  getTabText,
} from './constants/output.js';
import html2canvas from 'html2canvas';
import { enableTabButton, isResultsEmpty } from './ui/tabs.js';
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

// ----------------- Types & constants -----------------

type GroupRadarScores = Record<
  number,
  {
    honestAndDirect: number | null;
    workCommitment: number | null;
    management: number | null;
    socialCooperation: number | null;
  }
>;
const logoUrl = new URL('./images/logo_ntnu.png', import.meta.url).href;
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

let workbook: Workbook | null = null;
let lastGroupNumbers: number[] | null = null;
let lastRadarScores: GroupRadarScores | null = null;

// ----------------- DOM helpers -----------------

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function applyStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}

// ----------------- Language / static text -----------------

function updateStaticTexts() {
  const { uploadExcel, generateResults } = getButtonLabels();
  const titleText = getTitleText();
  const { day } = getDiagramInfo();

  const generateResultsBtn = document.getElementById('transposeBtn');
  const chooseFileLabel = document.getElementById('uploadBtn');
  const dayLabelEl = document.getElementById('dayLabel');
  const titleEl = document.getElementById('title');

  const { instructions, upload, results } = getTabText();
  const instructionsTab = document.getElementById('instructions-tab-id');
  const uploadTab = document.getElementById('upload-tab-id');
  const resultsTab = document.getElementById('results-tab-id');

  if (chooseFileLabel && generateResultsBtn && titleEl && dayLabelEl) {
    titleEl.textContent = titleText;
    chooseFileLabel.textContent = uploadExcel;
    generateResultsBtn.textContent = generateResults;
    dayLabelEl.textContent = day;
  }

  if (instructionsTab && uploadTab && resultsTab) {
    instructionsTab.textContent = instructions;
    uploadTab.textContent = upload;
    resultsTab.textContent = results;
  }

  // --- form link part ---
  const formLinkConfig = getFormLink();
  const formLinkContainer = document.getElementById('formLinkContainer');

  if (formLinkContainer) {
    formLinkContainer.innerHTML = '';

    const instruction = document.createTextNode(formLinkConfig.instruction);
    formLinkContainer.appendChild(instruction);

    formLinkContainer.appendChild(document.createElement('br'));
    formLinkContainer.appendChild(document.createElement('br'));

    const strong = document.createElement('strong');
    strong.textContent = `${formLinkConfig.languageLabel}:`;
    formLinkContainer.appendChild(strong);

    formLinkContainer.appendChild(document.createTextNode(' '));

    const link = document.createElement('a');
    link.href = formLinkConfig.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-blue-600 underline';
    link.textContent = formLinkConfig.linkText;

    formLinkContainer.appendChild(link);
  }
}

// ----------------- Preview modal (singleton) -----------------

function initPreviewModal() {
  const previewModal = document.createElement('div');
  previewModal.id = 'previewModal';

  applyStyles(previewModal, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
  });

  const previewInner = document.createElement('div');
  applyStyles(previewInner, {
    background: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  });

  const previewImg = document.createElement('img');
  previewImg.id = 'previewImage';
  previewImg.alt = 'Diagram preview';
  applyStyles(previewImg, {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  });

  const closePreviewBtn = document.createElement('button');
  closePreviewBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  `;
  applyStyles(closePreviewBtn, {
    alignSelf: 'flex-end',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    background: '#014F9F',
    color: '#fff',
    cursor: 'pointer',
  });

  closePreviewBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
  });

  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.style.display = 'none';
    }
  });

  previewInner.appendChild(closePreviewBtn);
  previewInner.appendChild(previewImg);
  previewModal.appendChild(previewInner);
  document.body.appendChild(previewModal);

  async function openPreview(target: HTMLDivElement) {
    const doc = document as Document & { fonts?: FontFaceSet };

    if (doc.fonts?.ready) {
      await doc.fonts.ready;
    }
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const imgCanvas = await html2canvas(target, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    previewImg.src = imgCanvas.toDataURL('image/png');
    previewModal.style.display = 'flex';
  }

  return { openPreview };
}

const { openPreview } = initPreviewModal();

// ----------------- Radar helpers -----------------

function createGroupLabel(group: number): HTMLDivElement {
  const { group: groupLabel } = getDiagramInfo();
  const box = document.createElement('div');
  box.textContent = `${groupLabel} ${group}`;

  applyStyles(box, {
    position: 'absolute',
    top: '40px',
    right: '40px',
    fontSize: '32px',
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    lineHeight: '1',
  });

  return box;
}

function buildGroupRadarScores(transposed: Matrix, groupNumbers: number[]): GroupRadarScores {
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

function createDimensionBox(dim: { label: string; description: string }): HTMLDivElement {
  const box = document.createElement('div');
  box.className = 'dimension-box';

  applyStyles(box, {
    position: 'absolute',
    width: '260px',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#333',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    pointerEvents: 'none',
  });

  box.innerHTML = `<strong>${dim.label}</strong><br>${dim.description}`;
  return box;
}

// ----------------- UI factories (wrappers, frame, buttons) -----------------

function createGroupWrapper(container: HTMLElement): HTMLDivElement {
  const wrapper = document.createElement('div');

  applyStyles(wrapper, {
    margin: '24px auto',
    width: '1300px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
  });

  container.appendChild(wrapper);
  return wrapper;
}

function createFrameAndPage(): { frame: HTMLDivElement; page: HTMLDivElement } {
  const frame = document.createElement('div');
  applyStyles(frame, {
    position: 'absolute',
    left: '-99999px',
    top: '0',
    background: '#ffffff',
    padding: '12px',
    display: 'inline-block',
  });

  const page = document.createElement('div');
  page.className = 'card';

  applyStyles(page, {
    width: '1300px',
    height: '800px',
    padding: '24px',
    boxSizing: 'border-box',
    margin: '0',
    border: '2px solid var(--theme-color)',
    position: 'relative',
    background: '#ffffff',
  });

  frame.appendChild(page);
  return { frame, page };
}

function createCanvasWithWrapper(): { wrapper: HTMLDivElement; canvas: HTMLCanvasElement } {
  const wrapper = document.createElement('div');

  applyStyles(wrapper, {
    position: 'relative',
    width: '1200px',
    height: '700px',
    margin: '0 auto',
  });

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  applyStyles(canvas, { display: 'block' });

  wrapper.appendChild(canvas);
  return { wrapper, canvas };
}

function createLogo(): HTMLImageElement {
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.alt = 'NTNU Logo';

  applyStyles(logo, {
    position: 'absolute',
    left: '0px',
    bottom: '0px',
    height: '80px',
    pointerEvents: 'none',
  });

  return logo;
}

function createInfoBox(): HTMLDivElement {
  const infoBox = document.createElement('div');
  infoBox.className = 'info-box';

  applyStyles(infoBox, {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '380px',
    padding: '16px',
    background: '#f2f2f2',
    borderBottom: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    boxSizing: 'border-box',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#333',
    whiteSpace: 'pre-line',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    letterSpacing: '0px',
    wordSpacing: '0px',
    pointerEvents: 'none',
  });

  const { description } = getDiagramInfo();
  infoBox.textContent = description;

  return infoBox;
}

function createPreviewButton(exportTarget: HTMLDivElement): HTMLButtonElement {
  const { preview } = getButtonLabels();
  const previewBtn = document.createElement('button');
  previewBtn.textContent = preview;

  applyStyles(previewBtn, {
    marginBottom: '0',
    padding: '8px 16px',
    cursor: 'pointer',
    background: '#ffffff',
    color: '#014F9F',
    borderRadius: '6px',
    border: '1px solid #014F9F',
    fontSize: '14px',
  });

  previewBtn.onclick = () => openPreview(exportTarget);
  return previewBtn;
}

function createExportButton(group: number, exportTarget: HTMLDivElement): HTMLButtonElement {
  const { exportDiagram } = getButtonLabels();
  const exportBtn = document.createElement('button');

  exportBtn.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    ">
      <span>${exportDiagram} ${group}</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </div>
  `;

  applyStyles(exportBtn, {
    marginBottom: '0',
    padding: '8px 16px',
    cursor: 'pointer',
    background: '#014F9F',
    color: 'white',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
  });

  exportBtn.onclick = async () => {
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

    const link = document.createElement('a');
    link.download = `gruppe-${group}.png`;
    link.href = imgCanvas.toDataURL('image/png');
    link.click();
  };

  return exportBtn;
}

// ----------------- Tabs switching for main app -----------------

function switchToResultsTab() {
  const resultsTab = document.querySelector('[data-tab="results"]') as HTMLElement | null;
  const uploadTab = document.querySelector('[data-tab="upload"]') as HTMLElement | null;
  const instructionsTab = document.querySelector('[data-tab="instructions"]') as HTMLElement | null;

  const resultsPanel = document.querySelector('[data-tab-panel="results"]') as HTMLElement | null;
  const uploadPanel = document.querySelector('[data-tab-panel="upload"]') as HTMLElement | null;
  const instructionsPanel = document.querySelector(
    '[data-tab-panel="instructions"]',
  ) as HTMLElement | null;

  if (!resultsTab || !resultsPanel) return;

  [instructionsTab, uploadTab, resultsTab].forEach((tab) => {
    if (tab) {
      tab.classList.remove('text-(--theme-color)', 'border-(--theme-color)');
      tab.classList.add('text-slate-500', 'border-transparent');
    }
  });

  resultsTab.classList.remove('text-slate-500', 'border-transparent');
  resultsTab.classList.add('text-(--theme-color)', 'border-(--theme-color)');

  [instructionsPanel, uploadPanel, resultsPanel].forEach((panel) => {
    if (panel) panel.classList.add('hidden');
  });

  resultsPanel.classList.remove('hidden');
}

// ----------------- Main render function -----------------

function renderRadarCharts(groupNumbers: number[], radarScores: GroupRadarScores): void {
  const dayInput = document.getElementById('dayInput') as HTMLInputElement | null;
  const dayNumber = dayInput?.value || '1';
  const container = document.getElementById('charts');
  if (!container) return;

  container.innerHTML = '';

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

    const groupWrapper = createGroupWrapper(container);
    const { frame, page } = createFrameAndPage();
    groupWrapper.appendChild(frame);

    // ----- Header row: label + preview (left), download (right) -----
    const rowText = document.createElement('div');
    rowText.textContent = `${getDiagramInfo().group} ${group}`;
    applyStyles(rowText, {
      fontSize: '20px',
      fontWeight: '600',
    });

    const exportBtn = createExportButton(group, frame);
    const previewBtn = createPreviewButton(frame);

    const headerRow = document.createElement('div');
    applyStyles(headerRow, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
    });

    const leftSide = document.createElement('div');
    applyStyles(leftSide, {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    });

    leftSide.appendChild(rowText);
    leftSide.appendChild(previewBtn);
    headerRow.appendChild(leftSide);
    headerRow.appendChild(exportBtn);

    groupWrapper.insertBefore(headerRow, frame);

    // Radar canvas
    const { wrapper: canvasWrapper, canvas } = createCanvasWithWrapper();
    page.appendChild(canvasWrapper);

    // Decorations
    page.appendChild(createInfoBox());
    page.appendChild(createLogo());

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

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: `${day} ${dayNumber}`,
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
            font: { size: 32, weight: 'bold' },
            padding: { top: 10, bottom: 4 },
          },
          subtitle: {
            display: true,
            text: subtitle,
            font: { size: 14, weight: 'normal' },
            color: '#666',
            padding: { bottom: 20 },
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
            pointLabels: { font: { size: 14, weight: 600 } },
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

    lastGroupNumbers = groupNumbers;
    lastRadarScores = radarScores;

    renderRadarCharts(groupNumbers, radarScores);

    if (!isResultsEmpty()) {
      enableTabButton('results');
    }
    switchToResultsTab();
  } catch (err) {
    alert(err instanceof Error ? err.message : String(err));
  }
});