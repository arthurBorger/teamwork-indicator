export function getEl(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Missing element #${id}`);
    return el;
}
export function applyStyles(el, styles) {
    Object.assign(el.style, styles);
}
//# sourceMappingURL=dom.js.map