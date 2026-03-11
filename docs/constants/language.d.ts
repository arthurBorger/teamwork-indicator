import type { RadarDimensionId } from './radar.js';
export type Language = 'ENG' | 'NOR';
type RadarDimensionText = {
    label: string;
    description: string;
};
type RadarDimensionTranslations = Record<RadarDimensionId, RadarDimensionText>;
export declare function getLanguage(): Language;
export declare function setLanguage(lang: Language): void;
export declare function onLanguageChange(callback: (lang: Language) => void): () => boolean;
export declare const translations: {
    readonly ENG: {
        readonly formLink: {
            readonly instruction: "Duplicate the form and share it with the students. Be careful to use the correct link.";
            readonly languageLabel: "English Village";
            readonly linkText: "Form (English)";
            readonly href: "https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUMVFZTDBXQ1g1SUVFU0VFUzVYQzVTUlo5QS4u&sharetoken=W3wI2DTUKPr50lllaP5x";
        };
        readonly tabs: {
            readonly instructions: "Instructions";
            readonly upload: "Upload";
            readonly results: "Results";
        };
        readonly preview: "Preview";
        readonly uploadExcel: "Upload Excel File";
        readonly generateResults: "Generate results";
        readonly calculateScores: "Calculate Scores";
        readonly exportDiagram: "Download Diagram for Group";
        readonly title: "Teamwork Indicator";
        readonly subtitle: "Experts in Teamwork";
        readonly group: "Group";
        readonly day: "Day";
        readonly description: "This diagram shows your group's scores on four dimensions.\n\nThe farther out from the center your values are placed on each of the four axes, the better. In your group, discuss what the scores may indicate about the current functioning of the group.\n\nIf you have completed the Teamwork Indicator before, you can also compare the current values with the previous ones and discuss what any changes may say about the development in your group.\n";
    };
    readonly NOR: {
        readonly formLink: {
            readonly instruction: "Dupliser skjemaet og del lenken med studentene. Vær nøye med å bruke riktig lenke.";
            readonly languageLabel: "Norsk Landsby";
            readonly linkText: "Skjema (Norsk)";
            readonly href: "https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUN09NRzVVNzhBU1I1MjAwVURVR1I2QVZYSi4u&sharetoken=IvfpTLpSbvvBb7W7z8Hc";
        };
        readonly tabs: {
            readonly instructions: "Instruksjoner";
            readonly upload: "Last opp";
            readonly results: "Resultater";
        };
        readonly preview: "Forhåndsvisning";
        readonly uploadExcel: "Last opp Excel-fil";
        readonly generateResults: "Generer resultater";
        readonly calculateScores: "Beregn poeng";
        readonly exportDiagram: "Last ned diagram for gruppe";
        readonly title: "Samarbeidsindikatoren";
        readonly subtitle: "Eksperter i team";
        readonly group: "Gruppe";
        readonly day: "Dag";
        readonly description: "Diagrammet viser din gruppes skårer på fire dimensjoner.\n    \n    Jo lenger ut fra sentrum verdiene er plassert langs hver av de fire aksene, jo bedre.I gruppen, diskuter hva skårene kan indikere om hvordan gruppen fungerer for tiden. \n    \n    Dersom dere har fylt ut Samarbeidsindikatoren tidligere, kan dere også sammenligne nåværende verdier med de tidligere, og diskutere hva eventuelle endringer kan si om utviklingen i deres gruppe";
    };
};
export declare const radarDimensionTranslations: Record<Language, RadarDimensionTranslations>;
export {};
//# sourceMappingURL=language.d.ts.map