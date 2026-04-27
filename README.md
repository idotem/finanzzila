# Finanzzila

Finanzzila is a very simple and easy to use personal finance management application. It helps users track their income and expenses, set budgets, and monitor their financial health.

## Features

- **Dashboard**: Overview of current balance and transactions
- **Transactions**: Log and categorize income and expenses.
- **Reports**: Visual charts and statistics to understand spending habits.(Grouping by categories)

## How to Use

Follow these easy steps to get started:

1. **Upload your bank data:** Upload an `.xlsx` file containing an export of your bank transactions.
2. **Review Common Categories:** Finanzzila comes pre-loaded with common categories (primarily for Macedonia). Feel free to delete any you don't need or add your own custom categories.
3. **Map Uncategorized Transactions:** 
   - Navigate to the **Transactions** view and filter by `NOT_MAPPED`.
   - Start assigning categories to these transactions.
   - For each transaction, add an identifying **keyword**.
   - **Pro Tip:** Once you map a single transaction and add a keyword, all other transactions with the same or similar names are automatically mapped to that category, making the process incredibly fast!

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
