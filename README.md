# Finanzzila

Finanzzila is a simple and intuitive personal finance management application. Upload your bank statements, automatically categorize transactions, track spending habits, set budgets, and monitor your financial health — all from a single dashboard.

## Features

### Dashboard
- **Financial Overview**: See total earned, total spent, and net balance at a glance
- **Interactive Charts**: Bar and doughnut charts breaking down expenses by category — click any segment to drill into filtered transactions
- **Time Period Averages**: Toggle between All Time, Yearly, and Monthly views for all charts and statistics
- **Date Range Filtering**: Pick a custom date range to focus on any period
- **Multi-Currency Display**: View amounts in MKD, USD, or EUR
- **Saving Accounts**: Track per-account balances with color-coded indicators, click to filter transactions by account

### Smart Budget Planner
- **Auto-Generated Budgets**: Generate a budget from your 6-month spending averages with a single click
- **Per-Category Budgeting**: Edit budget amounts for each category to set realistic spending limits
- **Budget Tracking**: Compare actual spending against budgeted amounts per month
- **Budget Management**: View all saved budgets grouped by month, delete individual months or clear all

### Transactions
- **Full Transaction Table**: Sortable table with date, company name, amount, and category
- **Advanced Filtering**: Filter by date range, company name search, and category dropdown
- **Bulk Operations**: Multi-select transactions for bulk category updates or bulk delete
- **Add/Edit Transactions**: Manual entry with date, company name, amount, and category selection
- **Smart Auto-Mapping**: Map a transaction and add a keyword — all existing and future transactions with matching names are automatically categorized

### Multi-Bank Support
- **Multiple Banks**: Import statements from different banks, each with their own file format configuration
- **Flexible Parsing**: Supports both `.xls` and `.xlsx` file formats with configurable column mappings
- **Currently Supported Banks**:
  - Komercijalna Banka
  - NLB Banka
- **Easy to Extend**: Add your own bank with a simple JSON configuration file (see [Adding Your Bank](#adding-your-bank) below)

### Configuration
- **Category Management**: Full CRUD for transaction categories with custom colors
- **Category Types**: Income, Expense, and Saving Account
- **Wants vs. Needs**: Flag expense categories to track discretionary vs. essential spending
- **Keyword Management**: Add, edit, and delete keywords per category to power the auto-mapping engine

## Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd finanzzila
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```
   This single command automatically installs dependencies for both the backend (`finanzzila-nestjs/`) and frontend (`vue-finanzilla/`) via the `postinstall` script.

3. **Start the application:**
   ```bash
   npm run start
   ```
   This starts both the **backend** (NestJS on port `3000`) and the **frontend** (Vite dev server on port `5173`) concurrently.

4. **Open your browser** and navigate to **http://localhost:5173**

### First Time Setup

1. **Upload your bank data** — Go to the Dashboard and click Import. Select your bank from the dropdown and upload your `.xlsx` or `.xls` bank statement file.
2. **Review categories** — Navigate to **Config** to see the pre-loaded categories (primarily for Macedonia). Delete any you don't need and add your own.
3. **Map transactions** — Go to **Transactions**, filter by `NOT_MAPPED`, and start assigning categories. Add a keyword for each mapping to enable automatic categorization of all similar transactions.

## How to Use

### Uploading Transactions
1. Export a transaction statement from your bank as an `.xlsx` or `.xls` file
2. Open the Dashboard and click the **Import** button
3. Select your bank from the dropdown
4. Upload the file — your transactions will be parsed and loaded automatically

### Smart Auto-Mapping
The auto-mapping engine is the key to fast categorization:
1. Go to **Transactions** and filter by `NOT_MAPPED`
2. Assign a category to a transaction
3. Check the **"Add category keyword"** box and enter a keyword that identifies this merchant/transaction type
4. **Done!** All other transactions with the same or similar name are instantly mapped to the same category

### Budget Planning
1. On the Dashboard, use the **Smart Budget Planner** panel
2. Click **Generate Budget** to auto-create budgets based on your 6-month spending averages
3. Adjust the amounts per category as needed
4. Select a target month and **Save** your budget
5. Track your actual spending vs. budget in the **Saved Budgets** list

## Adding Your Bank

Finanzzila makes it easy to add support for any bank. You need to make changes in **two files**:

### Step 1: Create a Bank Configuration File

Create a new JSON file in `finanzzila-nestjs/src/bank/bank_config/` named after your bank (lowercase, hyphenated, e.g., `halkbank.json` or `bank-of-america.json`).

The file must follow this structure:

```json
{
    "bankName": "YOUR BANK NAME",
    "fileFormats": {
        "xls": {
            "startRow": 1,
            "columns": {
                "date": 0,
                "name": 1,
                "amount": 3
            },
            "hasSeparateIncomeExpense": false
        },
        "xlsx": {
            "startRow": 2,
            "columns": {
                "date": 1,
                "name": 2,
                "amount": 4
            },
            "hasSeparateIncomeExpense": false
        }
    },
    "amountParsing": {
        "europeanNumberFormat": false
    }
}
```

#### Configuration Fields Explained

| Field | Description |
|-------|-------------|
| `bankName` | Display name shown in the bank selection dropdown |
| `fileFormats.xls` / `fileFormats.xlsx` | Separate configs for each file format (column indices often differ) |
| `startRow` | The row where actual transaction data begins (skip headers/footers). Note: `.xls` is 0-indexed, `.xlsx` is 1-indexed |
| `columns.date` | Column index (0-based) for the transaction date |
| `columns.name` | Column index for the merchant/transaction description |
| `columns.amount` | Column index for a single signed amount column (positive = income, negative = expense) |
| `columns.expense` / `columns.income` | Alternative: separate column indices for expense and income (use when `hasSeparateIncomeExpense` is `true`) |
| `hasSeparateIncomeExpense` | Set to `true` if your bank uses separate columns for debits and credits, `false` if amounts are in a single signed column |
| `europeanNumberFormat` | Set to `true` if amounts use European formatting (`1.234,56`) with period as thousands separator and comma as decimal |

#### Tips for Finding Column Indices
1. Open your bank's exported `.xlsx` file in a spreadsheet editor
2. Count columns from left to right starting at **0** for the `date`, `name`, and `amount`/`expense`/`income` columns
3. Identify the first row that contains actual transaction data (not headers) for `startRow`
4. Check if amounts use European formatting (commas for decimals)

### Step 2: Register the Bank in the Enum

Open `finanzzila-nestjs/src/bank/bank.enum.ts` and add your bank:

```typescript
export enum Bank {
    KOMERCIJALNA_BANKA = 'KOMERCIJALNA BANKA',
    NLB_BANKA = 'NLB BANKA',
    YOUR_BANK = 'YOUR BANK NAME'   // must match bankName in the JSON config
}
```

> **Important:** The enum value (e.g., `'YOUR BANK NAME'`) must exactly match the `bankName` field in your JSON config file.

### Step 3: Rebuild and Restart

```bash
npm run start
```

Your new bank will now appear in the Import dropdown on the Dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, TypeScript, Vuetify 3, Tailwind CSS |
| **Backend** | NestJS, TypeScript, TypeORM |
| **Database** | SQLite (zero-config, file-based) |
| **Charts** | Chart.js with vue-chartjs and chartjs-plugin-datalabels |
| **File Parsing** | exceljs (.xlsx), xlsx/SheetJS (.xls) |
| **Build Tools** | Vite (frontend), NestJS CLI (backend) |

## Project Structure

```
finanzzila/
├── finanzzila-nestjs/            # Backend (NestJS)
│   ├── src/
│   │   ├── bank/                 # Bank configuration module
│   │   │   ├── bank_config/      # JSON config files per bank
│   │   │   ├── bank.enum.ts      # Supported banks enum
│   │   │   └── bank-config.service.ts
│   │   ├── budget/               # Budget planning module
│   │   ├── config/               # Backend configuration & filters
│   │   ├── keyword/              # Keyword auto-mapping module
│   │   ├── transaction/          # Transaction & category CRUD
│   │   ├── user/                 # User module
│   │   └── main.ts               # Backend entry point (port 3000)
│   └── package.json
├── vue-finanzilla/               # Frontend (Vue 3)
│   ├── src/
│   │   ├── components/           # Vue components
│   │   │   ├── about/            # About page
│   │   │   ├── charts/           # Chart components
│   │   │   ├── common/           # Shared components
│   │   │   ├── configuration/    # Config tab
│   │   │   ├── dashboard/        # Dashboard, budget planner
│   │   │   ├── model/            # TypeScript models/DTOs
│   │   │   └── transaction-table/
│   │   ├── config/               # Axios & app configuration
│   │   ├── navigation/           # Navigation bar
│   │   ├── router/               # Vue Router
│   │   ├── service/              # API service layer
│   │   ├── utils/                # Utilities (currency, etc.)
│   │   ├── views/                # Page views
│   │   ├── App.vue               # Root component
│   │   └── main.ts               # Frontend entry point
│   └── package.json
├── package.json                  # Root scripts (install + start)
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
