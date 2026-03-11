import { getButtonLabels, getDiagramInfo, getFormLink, getTabText, getTitleText } from '../constants/output.js';
export function updateStaticTexts() {
    const { uploadExcel, generateResults } = getButtonLabels();
    const titleText = getTitleText();
    const { day } = getDiagramInfo();
    const titleEl = document.getElementById('title');
    if (titleEl)
        titleEl.textContent = titleText;
    document.querySelectorAll('.uploadBtn').forEach((el) => {
        el.textContent = uploadExcel;
    });
    document.querySelectorAll('.transposeBtn').forEach((el) => {
        el.textContent = generateResults;
    });
    document.querySelectorAll('.dayLabel').forEach((el) => {
        el.textContent = day;
    });
    const { instructions, upload, results } = getTabText();
    const instructionsTab = document.getElementById('instructions-tab-id');
    const uploadTab = document.getElementById('upload-tab-id');
    const resultsTab = document.getElementById('results-tab-id');
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
//# sourceMappingURL=texts.js.map