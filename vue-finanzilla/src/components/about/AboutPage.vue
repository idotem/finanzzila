<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12 mb-16">
    <div class="text-center space-y-6 mt-8">
      <h1 class="text-5xl font-extrabold tracking-tight text-primary">
        Welcome to <span class="text-cyan-500">Finanzzila</span>
      </h1>
      <p class="text-xl text-gray-500 max-w-3xl mx-auto dark:text-gray-400">
        A simple and powerful personal finance manager. Import bank statements, auto-categorize transactions, plan budgets, and track your financial health — all in one place.
      </p>
    </div>

    <div>
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold tracking-tight">Features</h2>
        <div class="h-1 w-20 bg-cyan-500 mx-auto mt-4 rounded-full"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">dashboard</v-icon>
            </div>
            <h3 class="text-xl font-bold">Dashboard</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Interactive charts, financial summaries, saving account balances, and time-period analytics at a glance.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">receipt_long</v-icon>
            </div>
            <h3 class="text-xl font-bold">Transactions</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Full transaction table with filtering, bulk operations, and manual entry with smart auto-mapping.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">pie_chart</v-icon>
            </div>
            <h3 class="text-xl font-bold">Reports & Charts</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Bar and doughnut charts breaking down expenses by category. Click any segment to drill into transactions.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">savings</v-icon>
            </div>
            <h3 class="text-xl font-bold">Budget Planner</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Auto-generate budgets from your 6-month averages, customize per-category limits, and track actual vs. planned spending.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">account_balance</v-icon>
            </div>
            <h3 class="text-xl font-bold">Multi-Bank Support</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Import statements from multiple banks, each with their own file format. Currently supports Komercijalna and NLB Banka.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">auto_awesome</v-icon>
            </div>
            <h3 class="text-xl font-bold">Smart Auto-Mapping</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Map one transaction and add a keyword — all matching transactions are instantly categorized. Extremely fast!
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">account_balance_wallet</v-icon>
            </div>
            <h3 class="text-xl font-bold">Saving Accounts</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Track per-account balances with color-coded indicators. Click any account to filter its transactions instantly.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">currency_exchange</v-icon>
            </div>
            <h3 class="text-xl font-bold">Multi-Currency</h3>
            <p class="text-gray-500 dark:text-gray-400">
              View all amounts in MKD, USD, or EUR. Data is stored in MKD and converted on the fly for display.
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">category</v-icon>
            </div>
            <h3 class="text-xl font-bold">Custom Categories</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Create Income, Expense, and Saving Account categories with custom colors, keywords, and wants/needs flags.
            </p>
          </div>
        </v-card>
      </div>
    </div>

    <div class="mt-16">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold tracking-tight">How it Works</h2>
        <div class="h-1 w-20 bg-cyan-500 mx-auto mt-4 rounded-full"></div>
        <p class="text-lg text-gray-500 mt-4 dark:text-gray-400">
          Get your finances organized in three simple steps
        </p>
      </div>

      <div class="space-y-8">
        <v-card class="rounded-2xl overflow-hidden" elevation="2">
          <div class="flex flex-col md:flex-row">
            <div class="bg-cyan-500 p-8 md:w-1/3 flex flex-col justify-center items-center text-white min-h-[200px] relative">
              <span class="text-7xl font-black opacity-20 absolute top-4 left-4">01</span>
              <v-icon size="64" class="mb-4 text-white z-10">upload_file</v-icon>
              <h3 class="text-2xl font-bold text-center z-10">Upload Data</h3>
            </div>
            <div class="p-8 md:w-2/3 flex items-center">
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Export a transaction statement from your bank as an <strong class="text-cyan-600 dark:text-cyan-400">.xlsx</strong> or <strong class="text-cyan-600 dark:text-cyan-400">.xls</strong> file. Open the Dashboard, click Import, select your bank from the dropdown, and upload the file. Finanzzila parses it automatically using your bank's configuration.
              </p>
            </div>
          </div>
        </v-card>

        <v-card class="rounded-2xl overflow-hidden" elevation="2">
          <div class="flex flex-col md:flex-row-reverse">
            <div class="bg-cyan-600 p-8 md:w-1/3 flex flex-col justify-center items-center text-white min-h-[200px] relative">
              <span class="text-7xl font-black opacity-20 absolute top-4 right-4">02</span>
              <v-icon size="64" class="mb-4 text-white z-10">category</v-icon>
              <h3 class="text-2xl font-bold text-center z-10">Review Categories</h3>
            </div>
            <div class="p-8 md:w-2/3 flex items-center">
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Pre-loaded categories are included, primarily tailored for Macedonia. Head to <strong class="text-cyan-600 dark:text-cyan-400">Config</strong> to <strong class="text-cyan-600 dark:text-cyan-400">delete</strong> any you don't need and <strong class="text-cyan-600 dark:text-cyan-400">add your own</strong> with custom colors, types (Income, Expense, Saving Account), and wants/needs flags.
              </p>
            </div>
          </div>
        </v-card>

        <v-card class="rounded-2xl overflow-hidden" elevation="2">
          <div class="flex flex-col md:flex-row">
            <div class="bg-cyan-700 p-8 md:w-1/3 flex flex-col justify-center items-center text-white min-h-[200px] relative">
              <span class="text-7xl font-black opacity-20 absolute top-4 left-4">03</span>
              <v-icon size="64" class="mb-4 text-white z-10">auto_awesome</v-icon>
              <h3 class="text-2xl font-bold text-center z-10">Smart Mapping</h3>
            </div>
            <div class="p-8 md:w-2/3 flex items-center">
              <div class="space-y-4">
                <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Go to <strong>Transactions</strong>, filter by <strong class="text-red-500 border border-red-500/30 px-2 py-1 rounded bg-red-500/10">NOT_MAPPED</strong>, and start assigning categories. Add a keyword for each mapping.
                </p>
                <div class="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                  <p class="font-medium text-cyan-700 dark:text-cyan-400 flex items-start">
                    <v-icon size="24" class="mr-2 flex-shrink-0">lightbulb</v-icon>
                    <span><strong>Pro Tip:</strong> After you map ONE transaction and add a keyword, all existing and future transactions with the same or similar name get automatically mapped. This makes categorization incredibly fast!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div class="mt-16">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold tracking-tight">Multi-Bank Support</h2>
        <div class="h-1 w-20 bg-cyan-500 mx-auto mt-4 rounded-full"></div>
        <p class="text-lg text-gray-500 mt-4 dark:text-gray-400">
          Import transactions from any bank with a simple JSON configuration
        </p>
      </div>

      <div class="space-y-8">
        <v-card class="rounded-2xl p-8" elevation="2">
          <h3 class="text-2xl font-bold mb-4 flex items-center">
            <v-icon class="mr-3" color="cyan-500">account_balance</v-icon>
            Currently Supported Banks
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-3">
                <div class="bg-cyan-500/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <v-icon color="cyan-500" size="20">account_balance</v-icon>
                </div>
                <h4 class="text-lg font-semibold">Komercijalna Banka</h4>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                Supports both .xls and .xlsx formats. Uses a single signed amount column for income/expense.
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center mb-3">
                <div class="bg-cyan-500/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                  <v-icon color="cyan-500" size="20">account_balance</v-icon>
                </div>
                <h4 class="text-lg font-semibold">NLB Banka</h4>
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                Supports both .xls and .xlsx formats. Uses separate columns for income and expense with European number formatting.
              </p>
            </div>
          </div>
        </v-card>

        <v-card class="rounded-2xl p-8" elevation="2">
          <h3 class="text-2xl font-bold mb-6 flex items-center">
            <v-icon class="mr-3" color="cyan-500">settings</v-icon>
            Adding Your Own Bank
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Finanzzila is designed to be easily extended for any bank. Adding support requires just <strong class="text-cyan-600 dark:text-cyan-400">two simple steps</strong>:
          </p>

          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">1</div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold mb-2">Create a JSON Config File</h4>
                <p class="text-gray-500 dark:text-gray-400 mb-3">
                  Add a new file in <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-cyan-600 dark:text-cyan-400">finanzzila-nestjs/src/bank/bank_config/</code> following this structure:
                </p>
                <div class="bg-gray-900 rounded-xl p-5 overflow-x-auto text-sm font-mono">
                  <pre class="text-gray-300"><span class="text-gray-500">{</span>
  <span class="text-cyan-400">"bankName"</span>: <span class="text-green-400">"YOUR BANK NAME"</span>,
  <span class="text-cyan-400">"fileFormats"</span>: <span class="text-gray-500">{</span>
    <span class="text-cyan-400">"xlsx"</span>: <span class="text-gray-500">{</span>
      <span class="text-cyan-400">"startRow"</span>: <span class="text-yellow-400">2</span>,
      <span class="text-cyan-400">"columns"</span>: <span class="text-gray-500">{</span>
        <span class="text-cyan-400">"date"</span>: <span class="text-yellow-400">1</span>,
        <span class="text-cyan-400">"name"</span>: <span class="text-yellow-400">2</span>,
        <span class="text-cyan-400">"amount"</span>: <span class="text-yellow-400">4</span>
      <span class="text-gray-500">}</span>,
      <span class="text-cyan-400">"hasSeparateIncomeExpense"</span>: <span class="text-yellow-400">false</span>
    <span class="text-gray-500">}</span>
  <span class="text-gray-500">}</span>,
  <span class="text-cyan-400">"amountParsing"</span>: <span class="text-gray-500">{</span>
    <span class="text-cyan-400">"europeanNumberFormat"</span>: <span class="text-yellow-400">false</span>
  <span class="text-gray-500">}</span>
<span class="text-gray-500">}</span></pre>
                </div>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div class="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">2</div>
              <div class="flex-1">
                <h4 class="text-lg font-semibold mb-2">Register the Bank in the Enum</h4>
                <p class="text-gray-500 dark:text-gray-400 mb-3">
                  Add your bank to <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm text-cyan-600 dark:text-cyan-400">finanzzila-nestjs/src/bank/bank.enum.ts</code>:
                </p>
                <div class="bg-gray-900 rounded-xl p-5 overflow-x-auto text-sm font-mono">
                  <pre class="text-gray-300"><span class="text-purple-400">export enum</span> <span class="text-cyan-400">Bank</span> <span class="text-gray-500">{</span>
  KOMERCIJALNA_BANKA = <span class="text-green-400">'KOMERCIJALNA BANKA'</span>,
  NLB_BANKA = <span class="text-green-400">'NLB BANKA'</span>,
  YOUR_BANK = <span class="text-green-400">'YOUR BANK NAME'</span>
<span class="text-gray-500">}</span></pre>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 bg-cyan-500/10 p-5 rounded-xl border border-cyan-500/20">
            <p class="font-medium text-cyan-700 dark:text-cyan-400 flex items-start">
              <v-icon size="24" class="mr-2 flex-shrink-0">lightbulb</v-icon>
              <span><strong>Tip:</strong> Open your bank's exported spreadsheet in an editor, count the column indices from 0 (left to right), and identify the first row with actual transaction data. That's all you need!</span>
            </p>
          </div>
        </v-card>

        <v-card class="rounded-2xl p-8" elevation="2">
          <h3 class="text-2xl font-bold mb-4 flex items-center">
            <v-icon class="mr-3" color="cyan-500">help_outline</v-icon>
            Configuration Fields
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-semibold">Field</th>
                  <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody class="text-gray-600 dark:text-gray-300">
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">bankName</td>
                  <td class="py-3 px-4">Display name shown in the bank selection dropdown</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">startRow</td>
                  <td class="py-3 px-4">Row where transaction data begins (skip headers). Note: .xls is 0-indexed, .xlsx is 1-indexed</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">columns.date</td>
                  <td class="py-3 px-4">Column index (0-based) for the transaction date</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">columns.name</td>
                  <td class="py-3 px-4">Column index for the merchant/transaction description</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">columns.amount</td>
                  <td class="py-3 px-4">Column index for a single signed amount (positive = income, negative = expense)</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">columns.expense / income</td>
                  <td class="py-3 px-4">Alternative: separate column indices for debits and credits</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">hasSeparateIncomeExpense</td>
                  <td class="py-3 px-4">Set to <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">true</code> if your bank uses separate columns for income and expense</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 font-mono text-sm text-cyan-600 dark:text-cyan-400">europeanNumberFormat</td>
                  <td class="py-3 px-4">Set to <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">true</code> if amounts use European formatting (e.g., <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">1.234,56</code>)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VCard, VIcon } from 'vuetify/components';
</script>
