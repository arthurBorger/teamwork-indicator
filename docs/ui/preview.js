import html2canvas from 'html2canvas';
import { applyStyles } from './dom.js';
// Utility: ensure fonts and layout are ready before rasterizing
export async function ensureReadyForCanvas() {
    const doc = document;
    if (doc.fonts?.ready) {
        await doc.fonts.ready;
    }
    await new Promise((r) => requestAnimationFrame(() => r()));
    await new Promise((r) => requestAnimationFrame(() => r()));
}
let previewModal = null;
let previewImg = null;
function mountPreviewModal() {
    if (previewModal)
        return;
    previewModal = document.createElement('div');
    previewModal.id = 'previewModal';
    applyStyles(previewModal, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
    });
    const previewInner = document.createElement('div');
    applyStyles(previewInner, {
        background: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    });
    previewImg = document.createElement('img');
    previewImg.id = 'previewImage';
    previewImg.alt = 'Diagram preview';
    applyStyles(previewImg, {
        maxWidth: '100%',
        maxHeight: '80vh',
        objectFit: 'contain',
    });
    const closePreviewBtn = document.createElement('button');
    closePreviewBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  `;
    applyStyles(closePreviewBtn, {
        alignSelf: 'flex-end',
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        background: '#014F9F',
        color: '#fff',
        cursor: 'pointer',
    });
    closePreviewBtn.addEventListener('click', () => {
        if (previewModal)
            previewModal.style.display = 'none';
    });
    const modalRef = previewModal;
    modalRef.addEventListener('click', (e) => {
        if (e.target === modalRef) {
            modalRef.style.display = 'none';
        }
    });
    previewInner.appendChild(closePreviewBtn);
    previewInner.appendChild(previewImg);
    previewModal.appendChild(previewInner);
    document.body.appendChild(previewModal);
}
export async function openPreview(target) {
    mountPreviewModal();
    await ensureReadyForCanvas();
    const imgCanvas = await html2canvas(target, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
    });
    const modalMaybe = previewModal;
    const imgMaybe = previewImg;
    if (imgMaybe && modalMaybe) {
        imgMaybe.src = imgCanvas.toDataURL('image/png');
        modalMaybe.style.display = 'flex';
        return;
    }
    // Fallback: mount again if something removed it from DOM, then retry once.
    previewModal = null;
    previewImg = null;
    mountPreviewModal();
    if (previewImg && previewModal) {
        const modal = previewModal;
        const img = previewImg;
        img.src = imgCanvas.toDataURL('image/png');
        modal.style.display = 'flex';
    }
}
//# sourceMappingURL=preview.js.map