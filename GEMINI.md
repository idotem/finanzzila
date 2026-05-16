# Finanzzila

Finanzzila is a personal finance management application built with NestJS and VueJS. It helps users track their income and expenses, set budgets, and monitor their financial health. This is a very simple to use and not at all complex budget planner. It will provide basic functionalities and nothing else. No need to add any extra features. 

## Features

- **Dashboard**: Overview of current balance and transactions
- **Transactions**: Log and categorize income and expenses.
- **Reports**: Visual charts and statistics to understand spending habits.(Grouping by categories)

## Tech Stack

- **Framework**: VueJS 3 (Composition API) with Tailwind CSS
- **Language**: TypeScript
- **Backend**: NestJS (with sqlite)
- **Charts**: ChartJS


## Starting the servers and testing:
- If you need to open browser to test functionality. Run `npm run start` in the finanzzila top folder. This starts both BE and FE and FE is accessible at http://localhost:5173


## Things to come

- **Ability to import transactions from multiple different bank statements**: Before uploading and importing transactions from a new bank statement, the user should be offered a choice to choose a BANK from the list of supported banks. Currently only one bank is supported, so we want to keep that functionality as KOMERCIJALNA BANKA and add another bank NLB Banka. This should be done by opening a dialog and offering the user a choice to choose a bank. After that the same import logic is used as before. And in the BE we should differentiate the transaction parsing based on the bank. 