const listeners = new Set();
let currentLanguage = 'ENG';
export function getLanguage() {
    return currentLanguage;
}
export function setLanguage(lang) {
    currentLanguage = lang;
    listeners.forEach((cb) => cb(lang));
}
// Subscribe to changes
export function onLanguageChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback); // optional unsubscribe
}
// -------------
// Translations
// -------------
export const translations = {
    ENG: {
        formLink: {
            instruction: 'Duplicate the form and share it with the students.',
            languageLabel: 'ENGLISH',
            linkText: 'Form (English)',
            href: 'https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUMVFZTDBXQ1g1SUVFU0VFUzVYQzVTUlo5QS4u&sharetoken=W3wI2DTUKPr50lllaP5x',
        },
        tabs: {
            instructions: 'Instructions',
            upload: 'Upload',
            results: 'Results',
        },
        preview: 'Preview',
        uploadExcel: 'Upload Excel File',
        generateResults: 'Generate results',
        calculateScores: 'Calculate Scores',
        exportDiagram: 'Download Diagram for Group',
        title: 'Teamwork Indicator',
        subtitle: 'Experts in Teamwork',
        group: "Group",
        day: "Day",
        description: `This diagram shows your group's scores on four dimensions.

The farther out from the center your values are placed on each of the four axes, the better. In your group, discuss what the scores may indicate about the current functioning of the group.

If you have completed the Teamwork Indicator before, you can also compare the current values with the previous ones and discuss what any changes may say about the development in your group.
`,
    },
    NOR: {
        formLink: {
            instruction: 'Dupliser skjemaet og del lenken med studentene.',
            languageLabel: 'NORSK', // For <strong>NORSK:</strong>
            linkText: 'Skjema (Norsk)',
            href: 'https://forms.office.com/Pages/ShareFormPage.aspx?id=cgahCS-CZ0SluluzdZZ8BUX_PKcMsGBMrXFJ0g588VNUN09NRzVVNzhBU1I1MjAwVURVR1I2QVZYSi4u&sharetoken=IvfpTLpSbvvBb7W7z8Hc',
        },
        tabs: {
            instructions: 'Instruksjoner',
            upload: 'Last opp',
            results: 'Resultater',
        },
        preview: 'Forhåndsvisning',
        uploadExcel: 'Last opp Excel-fil',
        generateResults: 'Generer resultater',
        calculateScores: 'Beregn poeng',
        exportDiagram: 'Last ned diagram for gruppe',
        title: 'Samarbeidsindikatoren',
        subtitle: 'Eksperter i team',
        group: "Gruppe",
        day: "Dag",
        description: `Diagrammet viser din gruppes skårer på fire dimensjoner.
    
    Jo lenger ut fra sentrum verdiene er plassert langs hver av de fire aksene, jo bedre.I gruppen, diskuter hva skårene kan indikere om hvordan gruppen fungerer for tiden. 
    
    Dersom dere har fylt ut Samarbeidsindikatoren tidligere, kan dere også sammenligne nåværende verdier med de tidligere, og diskutere hva eventuelle endringer kan si om utviklingen i deres gruppe`,
    },
};
export const radarDimensionTranslations = {
    ENG: {
        honestAndDirect: {
            label: 'Honest and direct',
            description: `This dimension indicates the attitudes of the group members toward open, direct
and honest sharing of feedback and reflections about the functioning of individuals,
subgroups and the whole group.`,
        },
        workCommitment: {
            label: 'Work Commitment',
            description: `This dimension indicates the degree of priority members give to the tasks of the group,
willingness to collaborate constructively and be committed in the contributions towards
completion of the group tasks.`,
        },
        management: {
            label: 'Management',
            description: `This dimension indicates how well the group is organized with regard to the management of
time, progress and being goal-directed as well as productive.`,
        },
        socialCooperation: {
            label: 'Social Cooperation',
            description: `This dimension indicates the degree of positive social climate, support, the willingness
to listen and to include the members of the group.`,
        },
    },
    NOR: {
        honestAndDirect: {
            label: 'Ærlig og direkte',
            description: `Denne dimensjonen indikerer holdningene gruppens medlemmer har til åpen, direkte og ærlig deling 
      av tilbakemeldinger og refleksjoner om hvordan individer, subgrupper og gruppen som helhet fungerer.`,
        },
        workCommitment: {
            label: 'Arbeidsinnsats',
            description: `Denne dimensjonen indikerer i hvilken grad medlemmer prioriterer gruppens oppgaver; deres
villighet til å samarbeide konstruktivt og forpliktet i bidragene mot ferdigstillelse av gruppeoppgavene.`,
        },
        management: {
            label: 'Ledelse',
            description: `Denne dimensjonen indikerer hvor godt gruppen er organisert med hensyn til
disponering av tid, fremdrift og å være målrettet i tillegg til produktiv.`,
        },
        socialCooperation: {
            label: 'Sosialt samarbeid',
            description: `Denne dimensjonen indikerer graden av positivt sosialt klima, støtte, 
      villigheten til å lytte og til å inkludere medlemmer av gruppen.`,
        },
    },
};
//# sourceMappingURL=language.js.map