const bar = document.getElementById('bottomBar');
if (!bar)
    console.error('bottomBar not found');
function updateBottomBarVisibility() {
    const doc = document.documentElement;
    const atBottom = Math.ceil(doc.scrollTop + window.innerHeight) >= doc.scrollHeight;
    bar?.classList.toggle('opacity-0', !atBottom);
    bar?.classList.toggle('pointer-events-none', !atBottom);
}
window.addEventListener('scroll', updateBottomBarVisibility, { passive: true });
window.addEventListener('resize', updateBottomBarVisibility);
updateBottomBarVisibility(); // run once on load
export {};
//# sourceMappingURL=bottom_bar.js.map