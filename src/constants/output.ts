import { getLanguage, translations } from './language.js';
import { radarDimensionIds, type RadarDimensionId } from './radar.js';
import { radarDimensionTranslations, type Language } from './language.js';

export function getTitleText() {
  const lang = getLanguage();
  return translations[lang].title;
}
export function getButtonLabels() {
  const lang = getLanguage();
  const t = translations[lang];

  return {
    uploadExcel: t.uploadExcel,
    generateResults: t.generateResults,
    calculateScores: t.calculateScores,
    exportDiagram: t.exportDiagram,
    preview: t.preview,
    dayText: t.day,
  } as const;
}

export function getTabText() {
  const lang = getLanguage();
  return translations[lang].tabs;
}

export function getDiagramInfo() {
  const lang = getLanguage();
  const t = translations[lang];

  return {
    title: getTitleText(),
    subtitle: t.subtitle,
    group: t.group,
    day: t.day,
    description: t.description,
  } as const;
}

export type RadarDimension = {
  id: RadarDimensionId;
  label: string;
  description: string;
};

export function getFormLink() {
  const lang = getLanguage();
  return translations[lang].formLink;
}

export function getRadarDimensions(lang?: Language): RadarDimension[] {
  const effectiveLang = lang ?? getLanguage();
  const t = radarDimensionTranslations[effectiveLang];

  return radarDimensionIds.map((id) => ({
    id,
    label: t[id].label,
    description: t[id].description,
  }));
}
