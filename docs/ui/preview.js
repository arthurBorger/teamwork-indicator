import html2canvas from 'html2canvas';
import { applyStyles } from './dom.js';
import { createCloseButton } from './buttons.js';
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
    const closePreviewBtn = createCloseButton('#EF4444', {
        onClick: () => {
            if (previewModal)
                previewModal.style.display = 'none';
        },
        alignEnd: true,
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