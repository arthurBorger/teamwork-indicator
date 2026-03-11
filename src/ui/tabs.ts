// Function to disable a button in the tab interface
function disableTabButton(tabName: string) {
  const btn = document.querySelector<HTMLButtonElement>(`[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.add('tab-disabled');
    btn.disabled = true;
  }
}

export function enableTabButton(tabName: string) {
  const btn = document.querySelector<HTMLButtonElement>(`[data-tab="${tabName}"]`);
  if (btn) {
    btn.classList.remove('tab-disabled');
    btn.disabled = false;
  }
}

export function isResultsEmpty(): boolean {
  const charts = document.getElementById('charts');
  return !charts || charts.children.length === 0;
}

function initTabs() {
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  const panels = document.querySelectorAll<HTMLElement>('[data-tab-panel]');

  if (!tabButtons.length || !panels.length) return;
  if (isResultsEmpty()) {
    disableTabButton('results');
  }

  function showTab(tabName: string) {
    // Update buttons
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle('border-(--theme-color)', isActive);
      btn.classList.toggle('text-(--theme-color)', isActive);
      btn.classList.toggle('border-transparent', !isActive);
      btn.classList.toggle('text-slate-500', !isActive);
    });

    // Update panels
    panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === tabName;
      panel.classList.toggle('hidden', !isActive);
    });
  }

  // Attach listeners
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      if (tabName) showTab(tabName);
    });
  });

  // Default: show instructions
  showTab('instructions');
}

// call from main.ts after DOM ready, or immediately if module loaded at end of body
initTabs();

export function switchToResultsTab() {
  const resultsTab = document.querySelector('[data-tab="results"]') as HTMLElement | null;
  const uploadTab = document.querySelector('[data-tab="upload"]') as HTMLElement | null;
  const instructionsTab = document.querySelector('[data-tab="instructions"]') as HTMLElement | null;

  const resultsPanel = document.querySelector('[data-tab-panel="results"]') as HTMLElement | null;
  const uploadPanel = document.querySelector('[data-tab-panel="upload"]') as HTMLElement | null;
  const instructionsPanel = document.querySelector('[data-tab-panel="instructions"]') as HTMLElement | null;

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
