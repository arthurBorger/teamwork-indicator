import { getLanguage, translations } from './language.js';
import { radarDimensionIds } from './radar.js';
import { radarDimensionTranslations } from './language.js';
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
        dayText: t.day,
    };
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