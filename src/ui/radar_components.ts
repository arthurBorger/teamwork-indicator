import { getButtonLabels, getDiagramInfo } from '../constants/output.js';
import { applyStyles } from './dom.js';
import { ensureReadyForCanvas, openPreview } from './preview.js';

const logoUrl = new URL('../images/logo_ntnu.png', import.meta.url).href;

export function createGroupLabel(group: number): HTMLDivElement {
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

export function createDimensionBox(dim: { label: string; description: string }): HTMLDivElement {
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

export function createGroupWrapper(container: HTMLElement): HTMLDivElement {
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

export function createFrameAndPage(): { frame: HTMLDivElement; page: HTMLDivElement } {
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

export function createCanvasWithWrapper(): { wrapper: HTMLDivElement; canvas: HTMLCanvasElement } {
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

export function createLogo(): HTMLImageElement {
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

export function createInfoBox(): HTMLDivElement {
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

export function createPreviewButton(exportTarget: HTMLDivElement): HTMLButtonElement {
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

export function createExportButton(group: number, exportTarget: HTMLDivElement): HTMLButtonElement {
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
    await ensureReadyForCanvas();

    const { default: html2canvas } = await import('html2canvas');
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

