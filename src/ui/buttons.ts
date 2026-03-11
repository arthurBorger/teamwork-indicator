import { applyStyles } from './dom.js';
import { createCloseIcon } from './icons.js';

type IconButtonOptions = {
  ariaLabel: string;
  onClick?: (() => void) | undefined;
};

export function createIconButton(icon: SVGSVGElement, opts: IconButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', opts.ariaLabel);
  btn.appendChild(icon);
  if (opts.onClick) btn.addEventListener('click', opts.onClick);
  return btn;
}

export function createCloseButton(background: string, options?: { onClick?: () => void; alignEnd?: boolean }): HTMLButtonElement {
  const icon = createCloseIcon(24);
  const btn = createIconButton(icon, { ariaLabel: 'Close', onClick: options?.onClick });
  applyStyles(btn, {
    alignSelf: options?.alignEnd ? 'flex-end' : '',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    background: background,
    color: '#fff',
    cursor: 'pointer',
  });
  return btn;
}
