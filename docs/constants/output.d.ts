import { type RadarDimensionId } from './radar.js';
import { type Language } from './language.js';
export declare function getButtonLabels(): {
    readonly uploadExcel: "Upload Excel File" | "Last opp Excel-fil";
    readonly generateResults: "Generate results" | "Generer resultater";
    readonly calculateScores: "Calculate Scores" | "Beregn poeng";
    readonly exportDiagram: "Download Diagram for Group" | "Last ned diagram for gruppe";
    readonly dayNumber: "Day number" | "Dag nummer";
    readonly title: "Teamwork Indicator" | "Samarbeidsindikatoren";
};
export declare function getDiagramInfo(): {
    readonly title: "Teamwork Indicator" | "Samarbeidsindikatoren";
    readonly subtitle: "Experts in Teamwork" | "Eksperter i team";
    readonly group: "Group" | "Gruppe";
    readonly description: "This diagram shows your group's scores on four dimensions.\n\nThe farther out from the center your values are placed on each of the four axes, the better. In your group, discuss what the scores may indicate about the current functioning of the group.\n\nIf you have completed the Teamwork Indicator before, you can also compare the current values with the previous ones and discuss what any changes may say about the development in your group.\n" | "Diagrammet viser din gruppes skårer på fire dimensjoner.\n    \n    Jo lenger ut fra sentrum verdiene er plassert langs hver av de fire aksene, jo bedre.I gruppen, diskuter hva skårene kan indikere om hvordan gruppen fungerer for tiden. \n    \n    Dersom dere har fylt ut Samarbeidsindikatoren tidligere, kan dere også sammenligne nåværende verdier med de tidligere, og diskutere hva eventuelle endringer kan si om utviklingen i deres gruppe";
};
export type RadarDimension = {
    id: RadarDimensionId;
    label: string;
    description: string;
};
export declare function getFormLink(): {
    readonly instruction: "Duplicate the form and share it with the students.";
    readonly languageLabel: "ENGLISH";
    readonly linkText: "Form (English)";
    readonly href: "https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUMVFZTDBXQ1g1SUVFU0VFUzVYQzVTUlo5QS4u&sharetoken=W3wI2DTUKPr50lllaP5x";
} | {
    readonly instruction: "Dupliser skjemaet og del lenken med studentene.";
    readonly languageLabel: "NORSK";
    readonly linkText: "Skjema (Norsk)";
    readonly href: "https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUN09NRzVVNzhBU1I1MjAwVURVR1I2QVZYSi4u&sharetoken=IvfpTLpSbvvBb7W7z8Hc";
};
export declare function getRadarDimensions(lang?: Language): RadarDimension[];
//# sourceMappingURL=output.d.ts.map