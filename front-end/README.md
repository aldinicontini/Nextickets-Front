# Nextickets Frontend

A modern Angular 21 application for managing and generating ticket reports with QR code support.

## Prerequisites

- **Node.js** 18+ and **npm** 11.6.2+
- **Angular CLI** 21.2.6+ (installed globally or via npx)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

Navigate to `http://localhost:4200/` in your browser. The application will auto-reload when you modify source files.

### 3. Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on localhost:4200 |
| `npm run build` | Build optimized production bundle |
| `npm run watch` | Build in watch mode for development |
| `npm test` | Run unit tests with Vitest |
| `ng generate component <name>` | Generate new component |

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── report-form/          # Form for creating reports
│   │   ├── reports-table/        # Display reports in table
│   │   └── qr-generator/         # QR code generation
│   ├── services/
│   │   └── report.service.ts     # Report API & business logic
│   ├── models/
│   │   └── report.models.ts      # Data models
│   ├── app.routes.ts             # Route configuration
│   └── app.config.ts             # App configuration
├── main.ts                        # Application entry point
└── styles.css                     # Global styles
```

## Key Features

- 📝 **Report Management** - Create and manage ticket reports
- 🔗 **QR Code Generation** - Generate QR codes for reports
- 📊 **Report Export** - Export reports to Excel format
- 🎨 **PrimeNG UI** - Modern component library with icons
- 🔄 **Real-time Updates** - Auto-reload on file changes

## Tech Stack

- **Framework**: Angular 21.2
- **UI Components**: PrimeNG 21.1
- **Language**: TypeScript 5.9
- **Testing**: Vitest 4.0
- **Code Formatting**: Prettier 3.8
- **Utilities**: RxJS 7.8, file-saver, QRCode, XLSX

## Development

### Generate a New Component
```bash
ng generate component pages/my-page
ng generate service services/my-service
```

### Run Tests
```bash
npm test
```

### Code Formatting
The project uses Prettier. Format your code with:
```bash
npx prettier --write src/
```

## Production Build

The production build includes:
- Minification and optimization
- Source map generation disabled
- Output hashing for cache busting
- Budget checks (max 500KB initial, 5MB total)

## Support

For Angular-specific help, visit the [Angular Documentation](https://angular.dev)

For PrimeNG components, check [PrimeNG Documentation](https://primeng.org)
