import { getLanguage, translations } from './language.js';
import { radarDimensionIds } from './radar.js';
import { radarDimensionTranslations } from './language.js';
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
    };
}
export function getDiagramInfo() {
    const lang = getLanguage();
    const t = translations[lang];
    return {
        title: t.title,
        subtitle: t.subtitle,
        group: t.group,
        description: t.description,
    };
}
export function getFormLink() {
    const lang = getLanguage();
    return translations[lang].formLink;
}
export function getRadarDimensions(lang) {
    const effectiveLang = lang ?? getLanguage();
    const t = radarDimensionTranslations[effectiveLang];
    return radarDimensionIds.map((id) => ({
        id,
        label: t[id].label,
        description: t[id].description,
    }));
}
//# sourceMappingURL=output.js.map