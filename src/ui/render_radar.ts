import { Chart } from 'chart.js/auto';
import { getLanguage } from '../constants/language.js';
import { getDiagramInfo, getRadarDimensions } from '../constants/output.js';
import type { GroupRadarScores } from '../radar/scores.js';
import {
  createCanvasWithWrapper,
  createDimensionBox,
  createFrameAndPage,
  createGroupLabel,
  createGroupWrapper,
  createInfoBox,
  createLogo,
  createExportButton,
  createPreviewButton,
} from './radar_components.js';
import { applyStyles } from './dom.js';
import '../style.css';

type DatasetInput = { dayNumber: string; scores: GroupRadarScores };

export function renderRadarCharts(
  groupNumbers: number[],
  datasets: DatasetInput[],
): void {
  const container = document.getElementById('charts');
  if (!container) return;

  container.innerHTML = '';

  const lang = getLanguage();
  const radarDimensions = getRadarDimensions(lang);
  const radarLabels = radarDimensions.map((d) => d.label);
  const { title, subtitle, day } = getDiagramInfo();

  for (const group of groupNumbers) {
    const palette = ['#2563eb', '#16a34a', '#ef4444', '#a855f7', '#f59e0b', '#10b981'];
    type ChartDs = {
      label: string;
      data: number[];
      borderWidth: number;
      pointRadius: number;
      pointHoverRadius: number;
      fill: boolean;
      borderColor: string;
    };
    const chartDatasets: ChartDs[] = datasets
      .map<ChartDs | null>((ds, idx) => {
        const scores = ds.scores[group];
        if (!scores) return null;
        const values = [
          scores.honestAndDirect ?? 0,
          scores.workCommitment ?? 0,
          scores.management ?? 0,
          scores.socialCooperation ?? 0,
        ];
        return {
          label: `${day} ${ds.dayNumber}`,
          data: values,
          borderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 5,
          fill: false,
          borderColor: palette[idx % palette.length]!,
        };
      })
      .filter((x): x is ChartDs => Boolean(x));

    const groupWrapper = createGroupWrapper(container);
    const { frame, page } = createFrameAndPage();
    groupWrapper.appendChild(frame);

    // Header row: label + preview (left), download (right)
    const rowText = document.createElement('div');
    rowText.textContent = `${getDiagramInfo().group} ${group}`;
    applyStyles(rowText, { fontSize: '20px', fontWeight: '600' });

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
    applyStyles(leftSide, { display: 'flex', alignItems: 'center', gap: '16px' });

    leftSide.appendChild(rowText);
    leftSide.appendChild(previewBtn);
    headerRow.appendChild(leftSide);
    headerRow.appendChild(exportBtn);

    groupWrapper.insertBefore(headerRow, frame);

    // Radar canvas & decorations
    const { wrapper: canvasWrapper, canvas } = createCanvasWithWrapper();
    page.appendChild(canvasWrapper);
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
        datasets: chartDatasets,
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        layout: { padding: { top: 30, bottom: 30, left: 30, right: 30 } },
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 30 } },
          title: { display: true, text: title, font: { size: 32, weight: 'bold' }, padding: { top: 10, bottom: 4 } },
          subtitle: { display: true, text: subtitle, font: { size: 14, weight: 'normal' }, color: '#666', padding: { bottom: 20 } },
        },
        scales: {
          r: {
            min: 1,
            max: 7,
            ticks: { stepSize: 1, backdropColor: 'transparent', font: { size: 14 } },
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
