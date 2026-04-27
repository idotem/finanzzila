<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12 mb-16">
    <!-- Hero Section -->
    <div class="text-center space-y-6 mt-8">
      <h1 class="text-5xl font-extrabold tracking-tight text-primary">
        Welcome to <span class="text-cyan-500">Finanzzila</span>
      </h1>
      <p class="text-xl text-gray-500 max-w-3xl mx-auto dark:text-gray-400">
        A very simple and easy to use personal finance management application. It helps you track your income and expenses, set budgets, and monitor your financial health.
      </p>
    </div>

    <!-- Features Section -->
    <div>
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold tracking-tight">Core Features</h2>
        <div class="h-1 w-20 bg-cyan-500 mx-auto mt-4 rounded-full"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">dashboard</v-icon>
            </div>
            <h3 class="text-xl font-bold">Dashboard</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Get an instant overview of your current balance and recent transactions at a glance.
            </p>
          </div>
        </v-card>
        
        <!-- Feature 2 -->
        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">receipt_long</v-icon>
            </div>
            <h3 class="text-xl font-bold">Transactions</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Easily log and categorize your daily income and expenses with our smart mapping tool.
            </p>
          </div>
        </v-card>

        <!-- Feature 3 -->
        <v-card class="rounded-2xl" elevation="3">
          <div class="p-6 text-center space-y-4">
            <div class="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center">
              <v-icon color="cyan-500" size="32">pie_chart</v-icon>
            </div>
            <h3 class="text-xl font-bold">Reports</h3>
            <p class="text-gray-500 dark:text-gray-400">
              Visual charts and statistics to help you deeply understand your spending habits.
            </p>
          </div>
        </v-card>
      </div>
    </div>

    <!-- How to Use / Flow Section -->
    <div class="mt-16">
        <div class="mb-12 text-center">
          <h2 class="text-3xl font-bold tracking-tight">How it Works</h2>
          <div class="h-1 w-20 bg-cyan-500 mx-auto mt-4 rounded-full"></div>
          <p class="text-lg text-gray-500 mt-4 dark:text-gray-400">
            Get your finances organized in three simple steps
          </p>
        </div>

        <div class="space-y-8">
            <!-- Step 1 -->
             <v-card class="rounded-2xl overflow-hidden" elevation="2">
                <div class="flex flex-col md:flex-row">
                    <div class="bg-cyan-500 p-8 md:w-1/3 flex flex-col justify-center items-center text-white min-h-[200px] relative">
                        <span class="text-7xl font-black opacity-20 absolute top-4 left-4">01</span>
                        <v-icon size="64" class="mb-4 text-white z-10">upload_file</v-icon>
                        <h3 class="text-2xl font-bold text-center z-10">Upload Data</h3>
                    </div>
                    <div class="p-8 md:w-2/3 flex items-center">
                        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Start by exporting your transaction data from your bank. Finanzzila supports uploading standard <strong class="text-cyan-600 dark:text-cyan-400">.xlsx</strong> files directly into the platform to automatically populate your raw transaction list.
                        </p>
                    </div>
                </div>
             </v-card>

            <!-- Step 2 -->
             <v-card class="rounded-2xl overflow-hidden" elevation="2">
                <div class="flex flex-col md:flex-row-reverse">
                    <div class="bg-cyan-600 p-8 md:w-1/3 flex flex-col justify-center items-center text-white min-h-[200px] relative">
                        <span class="text-7xl font-black opacity-20 absolute top-4 right-4">02</span>
                        <v-icon size="64" class="mb-4 text-white z-10">category</v-icon>
                        <h3 class="text-2xl font-bold text-center z-10">Review Categories</h3>
                    </div>
                    <div class="p-8 md:w-2/3 flex items-center">
                        <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            Common categories already exist, mainly tailored for Macedonia. You can easily <strong class="text-cyan-600 dark:text-cyan-400">delete</strong> any you don't need, and <strong class="text-cyan-600 dark:text-cyan-400">add your own</strong> personalized categories that fit your spending habits.
                        </p>
                    </div>
                </div>
             </v-card>

            <!-- Step 3 -->
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
                                Go into Transactions and select <strong class="text-red-500 border border-red-500/30 px-2 py-1 rounded bg-red-500/10">NOT_MAPPED</strong>. Start assigning these to categories and adding keywords for them.
                            </p>
                            <div class="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                <p class="font-medium text-cyan-700 dark:text-cyan-400 flex items-start">
                                    <v-icon size="24" class="mr-2 flex-shrink-0">lightbulb</v-icon>
                                    <span><strong>Pro Tip:</strong> After you privately map ONE TRANSACTION and add a KEYWORD for it, all future and existing transactions with the SAME or SIMILAR names get mapped to the same category instantly. So this is extremely fast!</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
             </v-card>
        </div>
    </div>
  </div>
</template>

<script setup>
import { VCard, VIcon } from 'vuetify/components';
</script>
