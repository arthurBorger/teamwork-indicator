// In main.ts or a separate module that runs on load
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('[data-tab-panel]');
    if (!tabButtons.length || !panels.length)
        return;
    function showTab(tabName) {
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
            if (tabName)
                showTab(tabName);
        });
    });
    // Default: show instructions
    showTab('instructions');
}
// call from main.ts after DOM ready, or immediately if module loaded at end of body
initTabs();
export {};
//# sourceMappingURL=tabs.js.map