# Teamwork Indicator

A web-based tool for analyzing and visualizing team collaboration metrics from survey data. Upload Excel files containing questionnaire responses and generate interactive radar charts showing team performance across four key dimensions.

See the website: [teamwork-indicator.com](https://arthurborger.github.io/teamwork-indicator/).

## Features

- **Excel Data Processing**: Upload and process questionnaire responses from Excel files
- **Multi-dimensional Analysis**: Evaluate teams across four collaboration dimensions:
  - Honest and Direct Communication
  - Work Commitment
  - Management
  - Social Cooperation
- **Radar Chart Visualization**: Generate interactive radar charts for each team
- **Group Comparison**: Analyze and compare multiple teams simultaneously
- **Multi-language Support**: Available in English and Norwegian
- **Export Functionality**: Download visualizations as images
- **Responsive Design**: Clean, modern interface built with TailwindCSS

## Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Chart.js** - Interactive radar charts
- **TailwindCSS** - Modern styling
- **XLSX** - Excel file processing
- **html2canvas** - Chart export functionality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:{port}`.

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. **Prepare Your Data**: Collect questionnaire responses in Excel format (see [Excel File Format](#excel-file-format) below)
2. **Upload**: Navigate to the Upload tab and select your Excel file
3. **Generate Results**: Click the "Generate Results" button to process the data
4. **View & Export**: Review the radar charts in the Results tab and export as needed

## Excel File Format

The Excel file should contain the following columns in order:

### Metadata Columns

| Column | Description |
|--------|-------------|
| **ID** | Response ID |
| **Starttidspunkt** | Start time of the survey |
| **Fullføringstidspunkt** | Completion time of the survey |
| **E-postadresse** | Email address of the respondent |
| **Navn** | Name of the respondent |
| **Tidspunkt for siste endring** | Last modified timestamp |
| **Gruppenummer** | Group number (required for analysis) |

### Questionnaire Columns

The file should contain 20 questions distributed across four dimensions:

#### Work Commitment (Questions 1, 4, 11, 16, 20)

| # | Question (Norwegian) |
|---|----------------------|
| **1** | … er det en tendens til at noen stadig går inn og ut av gruppen? |
| **4** | … bidrar enkelte gruppemedlemmer til å gjøre arbeidet vanskelig? |
| **11** | … viser enkelte tydelig motstand eller uvilje mot aktivitetene i gruppen? |
| **16** | … finnes det skjult eller åpen irritasjon i gruppen? |
| **20** | … har gruppen vansker med å få samlet alle? |

#### Management (Questions 2, 5, 8, 13, 17)

| # | Question (Norwegian) |
|---|----------------------|
| **2** | … har gruppen vansker med å disponere tiden? |
| **5** | … har gruppen liten fremdrift i sitt arbeid? |
| **8** | … har gruppen vansker med å bli ferdig i tide? |
| **13** | … er gruppen preget av lav effektivitet? |
| **17** | … preges arbeidet av manglende mål og retning? |

#### Honest and Direct (Questions 3, 7, 10, 15, 19)

| # | Question (Norwegian) |
|---|----------------------|
| **3** | … diskuterer man gjerne saker på det generelle plan og unngår å bli personlig og direkte? |
| **7** | … unngår deltakerne å være personlige og direkte med hverandre? |
| **10** | … er det en tendens til at tilbakemeldingene som gis er vage eller lite direkte? |
| **15** | … pakkes ting for mye inn i «vennlighet»? |
| **19** | … er gruppen preget av konfliktskyhet? |

#### Social Cooperation (Questions 6, 9, 12, 14, 18)

| # | Question (Norwegian) |
|---|----------------------|
| **6** | … forholder gruppen seg konstruktivt til ulike bidrag og innspill? |
| **9** | … vises det god vilje til å utvikle samarbeidet? |
| **12** | … er det god stemning i gruppen? |
| **14** | … oppleves tilbakemeldingene fra gruppen som nyttige? |
| **18** | … er gruppen åpen og inkluderende? |


## Development

### Scripts

- `npm run dev` - Start development server with TypeScript watch mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Vitest

### Project Structure

```
src/
├── constants/     # Configuration and translations
├── types/         # TypeScript type definitions
├── ui/            # UI components and controllers
├── excel.ts       # Excel file processing
├── main.ts        # Application entry point
├── matrix.ts      # Matrix operations
├── scoring.ts     # Score calculations
└── utils.ts       # Utility functions
```

## License

MIT
