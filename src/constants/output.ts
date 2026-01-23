import { getLanguage, translations } from './language.js';
import { radarDimensionIds, type RadarDimensionId } from './radar.js';
import { radarDimensionTranslations, type Language } from './language.js';

export function getButtonLabels() {
  const lang = getLanguage();
  const t = translations[lang];

  return {
    uploadExcel: t.uploadExcel,
    generateResults: t.generateResults,
    calculateScores: t.calculateScores,
    exportDiagram: t.exportDiagram,
    dayNumber: t.dayNumber,
    title: t.title,
  } as const;
}

export function getDiagramInfo() {
  const lang = getLanguage();
  const t = translations[lang];

  return {
    title: t.title,
    subtitle: t.subtitle,
    group: t.group,
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
