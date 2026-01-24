import { setLanguage, type Language } from './../constants/language.js';

const langMenuButton = document.getElementById('langMenuButton');
const langMenu = document.getElementById('langMenu');
const langMenuLabel = document.getElementById('langMenuLabel');

if (!langMenuButton || !langMenu || !langMenuLabel) {
  throw new Error('Language menu elements not found');
}

// Toggle dropdown open/close
langMenuButton.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent click from bubbling to document
  langMenu.classList.toggle('hidden');
});

// Handle clicking on an option
langMenu.addEventListener('click', (e) => {
  if (!e.target) return;
  const btn = (e.target as Element).closest('button[data-lang]') as HTMLElement;
  if (!btn) return;

  const lang = btn.dataset.lang; // this is a string like "ENG" or "NOR"
  const flag = btn.dataset.flag;

  if (!lang) return;

  // tell your language system
  setLanguage(lang as Language); // assuming your setLanguage can handle "ENG" | "NOR"

  // update button label
  langMenuLabel.textContent = lang;
  langMenuButton.innerHTML = `
      <span id="langMenuLabel">${lang}</span> ${flag}
    `;

  langMenu.classList.add('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  langMenu.classList.add('hidden');
});
