const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(name) {
    return document.createElementNS(SVG_NS, name);
}
export function createCloseIcon(size = 24, stroke = 'currentColor', strokeWidth = 2) {
    const svg = svgEl('svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', stroke);
    svg.setAttribute('stroke-width', String(strokeWidth));
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const line1 = svgEl('line');
    line1.setAttribute('x1', '18');
    line1.setAttribute('y1', '6');
    line1.setAttribute('x2', '6');
    line1.setAttribute('y2', '18');
    const line2 = svgEl('line');
    line2.setAttribute('x1', '6');
    line2.setAttribute('y1', '6');
    line2.setAttribute('x2', '18');
    line2.setAttribute('y2', '18');
    svg.appendChild(line1);
    svg.appendChild(line2);
    return svg;
}
//# sourceMappingURL=icons.js.map