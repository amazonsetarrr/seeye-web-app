# SeeEye - Data Reconciliation Web Application

A powerful, modern web application for comparing, reconciling, and validating data from multiple sources. SeeEye helps organizations identify discrepancies, match records intelligently, and maintain data integrity across different systems.

## Overview

SeeEye is a comprehensive data reconciliation platform that streamlines the process of comparing datasets from different sources. Whether you're reconciling financial records, synchronizing databases, or validating data migrations, SeeEye provides an intuitive workflow to identify matches, conflicts, and orphaned records.

## Key Features

### 1. Multi-Format File Support
- Upload and parse CSV and Excel (.xlsx, .xls) files
- Automatic header detection and data validation
- Support for large datasets with efficient processing
- Visual preview of uploaded data

### 2. Intelligent Field Mapping
- Drag-and-drop interface for mapping columns between source and target files
- Define key fields for record matching
- Map non-key fields for comparison
- Visual indicators for mapped relationships

### 3. Data Normalization
- Combine data from multiple sources into a unified format
- Custom column naming for normalized datasets
- Multiple merge strategies (separate or union)
- Preserve original data for audit trails

### 4. Advanced Matching Algorithms
- **Exact Match**: Precise record matching based on key fields
- **Fuzzy Match**: Intelligent matching with configurable similarity thresholds
- Handles variations in text (case, spacing, typos)
- Confidence scoring for match quality

### 5. Comprehensive Reconciliation
- Automatically identify:
  - **Matched Records**: Perfect matches between sources
  - **Conflicts**: Records that match on keys but differ in values
  - **Orphans**: Records present in only one source
- Detailed difference tracking for conflict resolution
- Side-by-side comparison of conflicting values

### 6. Reporting & Analytics
- Real-time reconciliation dashboard
- Summary statistics (total records, match rate, conflicts, orphans)
- Job history tracking with timestamps
- Visual status indicators

### 7. Export Capabilities
- Export reconciliation results to Excel
- Structured reports with all findings
- Preserve original and reconciled data
- Ready for further analysis or archival

## Technology Stack

- **Frontend Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4 with custom design system
- **Animations**: Framer Motion for smooth UI transitions
- **Icons**: Lucide React
- **Excel Processing**: SheetJS (xlsx) for file parsing and export
- **State Management**: React hooks and context
- **Code Quality**: ESLint with TypeScript support

## Application Workflow

The application follows a guided, step-by-step workflow:

### Step 1: Data Source Upload
Upload two datasets (CSV or Excel files) that you want to reconcile. The application validates and previews your data to ensure proper formatting.

### Step 2: Field Mapping
Define the relationship between columns in your source and target files:
- Select key fields that uniquely identify records
- Map corresponding fields for value comparison
- Choose matching strategy (Exact or Fuzzy)

### Step 3: Data Normalization (Optional)
Normalize data from both sources into a unified format:
- Create custom column names
- Choose merge strategy
- Generate a consolidated view of your data

### Step 4: Reconciliation
Run the reconciliation engine to automatically:
- Match records based on key fields
- Compare values across mapped fields
- Identify discrepancies and conflicts
- Flag orphaned records

### Step 5: Review & Report
Analyze results in an interactive workspace:
- Review matched records
- Investigate conflicts with side-by-side comparison
- Identify missing records (orphans)
- Export comprehensive reports

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI elements (buttons, tables)
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── ThemeContext.tsx # Theme management
├── features/           # Feature-based modules
│   ├── dashboard/      # Home dashboard with job history
│   ├── file-management/ # File upload and preview
│   ├── mapping/        # Field mapping interface
│   ├── matching/       # Reconciliation engine integration
│   ├── normalization/  # Data normalization workflow
│   ├── results/        # Results display and analysis
│   └── settings/       # Application settings
├── logic/              # Business logic layer
│   ├── normalization/  # Normalization engine
│   └── reconciliation/ # Reconciliation engine with strategies
│       └── strategies/ # Exact and Fuzzy matching implementations
└── utils/              # Utility functions
    ├── fileParser.ts   # Excel/CSV parsing
    ├── exportHandler.ts # Export to Excel
    ├── fuzzyMatch.ts   # Fuzzy string matching
    └── store.ts        # Local job storage
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd seeye-web-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Usage

1. **Upload Files**: Navigate to "Data Source" and upload your CSV or Excel files
2. **Map Fields**: Go to "Map Fields" to define relationships between columns
3. **Choose Strategy**: Select Exact Match for precise matching or Fuzzy Match for intelligent similarity matching
4. **Normalize (Optional)**: Visit "Normalization" to create a unified dataset
5. **Run Reconciliation**: Click "Run Reconciliation" to process your data
6. **Review Results**: Analyze matches, conflicts, and orphans in the Reconciliation Workspace
7. **Export**: Generate Excel reports with detailed findings

## Configuration

The application supports customization through:
- **Fuzzy Threshold**: Adjust similarity threshold for fuzzy matching (0-1)
- **Match Strategy**: Choose between exact and fuzzy matching algorithms
- **Theme**: Toggle between light and dark modes
- **Normalization Settings**: Configure column naming and merge strategies

## Key Components

### ReconciliationEngine
Core engine that orchestrates the matching process:
- Strategy pattern for pluggable matching algorithms
- Tracks matched records to avoid duplicates
- Calculates differences between conflicting values
- Generates comprehensive reconciliation summaries

### NormalizationEngine
Handles data transformation and unification:
- Builds normalized column definitions from mappings
- Supports multiple merge strategies
- Preserves original data for reference
- Exports normalized datasets

### Matching Strategies
- **ExactMatchStrategy**: Compares key fields with exact string matching
- **FuzzyMatchStrategy**: Uses Levenshtein distance for similarity scoring

## Performance Considerations

- Efficient O(n*m) reconciliation with early termination
- Lazy loading for large datasets
- Virtual scrolling for result tables
- Optimized re-renders with React memoization

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is private and proprietary.

## Development

### Code Quality
```bash
npm run lint
```

### Type Checking
```bash
npm run build  # TypeScript compilation is part of the build
```

## Contributing

This is a private project. Please contact the project maintainers for contribution guidelines.

---

Built with React, TypeScript, and modern web technologies.
