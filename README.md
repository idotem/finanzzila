# Finanzzila

Finanzzila is a personal finance management application built with NestJS and VueJS. It helps users track their income and expenses, set budgets, and monitor their financial health.

## Features

- **Dashboard**: Overview of current balance and transactions
- **Transactions**: Log and categorize income and expenses.
- **Reports**: Visual charts and statistics to understand spending habits.(Grouping by categories)

## Tech Stack

- **Framework**: VueJS
- **Language**: TypeScript
- **Backend**: NestJS
- **Charts**: ChartJS

## Getting Started

### Prerequisites

- node
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finanzzila
   ```

2. Install dependencies in both backend and frontend folders:
   ```bash
   cd finanzzila-nestjs
   npm install
   cd ../vue-finanzilla
   npm install
   ```

3. Run the app. This starts both the backend and frontend:
   ```bash
   npm run start
   ```

4. Access the app at http://localhost:5173

## Project Structure

```
finanzzila/
├── finanzzila-nestjs/      # Backend application (NestJS)
│   ├── src/
│   │   ├── config/         # Backend configuration
│   │   ├── keyword/        # Keyword module
│   │   ├── transaction/    # Transaction module
│   │   ├── user/           # User module
│   │   └── main.ts         # Backend entry point
│   ├── test/               # Test files
│   └── package.json        # Backend dependencies
├── vue-finanzilla/         # Frontend application (Vue.js)
│   ├── src/
│   │   ├── assets/         # Static assets and styles
│   │   ├── components/     # Reusable Vue components
│   │   ├── config/         # Frontend app configuration
│   │   ├── navigation/     # Navigation structure
│   │   ├── router/         # Vue Router configuration
│   │   ├── service/        # API services and bindings
│   │   ├── utils/          # Utility functions
│   │   ├── views/          # Application pages/views
│   │   ├── App.vue         # Root component
│   │   └── main.ts         # Frontend entry point
│   ├── public/             # Public static assets
│   └── package.json        # Frontend dependencies
├── package.json            # Project workspace scripts
└── README.md               # Main project documentation
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
