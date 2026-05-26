/* ================================================
   بطاقة تهنئة العيد — النصيان لتقنية المعلومات
   ================================================ */

'use strict';

// ── Card native size
const CARD_W = 1116;
const CARD_H = 2000;

/*
  Name center: midpoint between ornament 1 end (~61.5%) and ornament 2 start (~68%)
  Mid = 64.75%  →  y = 2000 * 0.6475 = 1295
*/
const NAME_CENTER_Y_PCT = 0.7160;

// ── Pre-load card image from embedded base64 (avoids CORS taint on canvas)
const cardImg = new Image();
cardImg.src = CARD_BASE64;

// ── DOM
const nameField   = document.getElementById('nameField');
const showBtn     = document.getElementById('showBtn');
const fieldError  = document.getElementById('fieldError');
const inputPanel  = document.getElementById('inputPanel');
const resultPanel = document.getElementById('resultPanel');
const nameDisplay = document.getElementById('nameDisplay');
const exportCanvas= document.getElementById('exportCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn    = document.getElementById('resetBtn');

// ────────────────────────────────
//  SHOW CARD
// ────────────────────────────────
function showCard() {
  const name = nameField.value.trim();

  if (!name) {
    fieldError.classList.add('show');
    nameField.classList.remove('shake');
    void nameField.offsetWidth;
    nameField.classList.add('shake');
    nameField.focus();
    return;
  }

  fieldError.classList.remove('show');
  nameDisplay.textContent = name;

  // Switch panels
  inputPanel.style.display  = 'none';
  resultPanel.classList.add('visible');
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Render export canvas in background
  renderCanvas(name);
}

// ────────────────────────────────
//  CANVAS RENDER
// ────────────────────────────────
function renderCanvas(name) {
  const ctx = exportCanvas.getContext('2d');
  exportCanvas.width  = CARD_W;
  exportCanvas.height = CARD_H;

  const doDraw = () => {
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Draw template
    ctx.drawImage(cardImg, 0, 0, CARD_W, CARD_H);

    // ── Name text
    const centerY  = Math.round(CARD_H * NAME_CENTER_Y_PCT);
    const maxW     = CARD_W - 160;
    const fontSize = 80;

    ctx.save();
    ctx.font         = `700 ${fontSize}px 'Amiri', serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#1b2a4a';

    // Soft white glow under the text for readability
    ctx.shadowColor  = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur   = 18;

    ctx.fillText(name, CARD_W / 2, centerY, maxW);
    ctx.restore();
  };

  if (cardImg.complete && cardImg.naturalWidth > 0) {
    doDraw();
  } else {
    cardImg.addEventListener('load', doDraw, { once: true });
  }
}

// ────────────────────────────────
//  DOWNLOAD
// ────────────────────────────────
function downloadCard() {
  const name = nameDisplay.textContent || 'بطاقة-تهنئة';
  downloadBtn.disabled    = true;
  downloadBtn.textContent = 'جاري التحضير…';

  const doExport = () => {
    exportCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = 'card-template.jpeg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Restore button
      downloadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        تحميل البطاقة`;
      downloadBtn.disabled = false;
    }, 'image/jpeg', 0.95);
  };

  setTimeout(() => {
    if (exportCanvas.width === 0) {
      renderCanvas(nameDisplay.textContent);
      setTimeout(doExport, 250);
    } else {
      doExport();
    }
  }, 60);
}

// ────────────────────────────────
//  RESET
// ────────────────────────────────
function resetCard() {
  resultPanel.classList.remove('visible');
  inputPanel.style.display = '';
  nameField.value = '';
  nameDisplay.textContent = '';
  fieldError.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => nameField.focus(), 350);
}

// ────────────────────────────────
//  EVENT LISTENERS
// ────────────────────────────────
showBtn.addEventListener('click', showCard);
downloadBtn.addEventListener('click', downloadCard);
resetBtn.addEventListener('click', resetCard);

nameField.addEventListener('keydown', e => {
  if (e.key === 'Enter') showCard();
});

nameField.addEventListener('input', () => {
  fieldError.classList.remove('show');
});

nameField.addEventListener('animationend', () => {
  nameField.classList.remove('shake');
});