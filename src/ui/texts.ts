import { getButtonLabels, getDiagramInfo, getFormLink, getTabText, getTitleText } from '../constants/output.js';

export function updateStaticTexts() {
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
    (generateResultsBtn as HTMLButtonElement).textContent = generateResults;
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

