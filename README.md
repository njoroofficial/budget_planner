# My Personal Budget Planner

A personal finance management application built with Next.js that helps track income, expenses, and budget allocation with automatic Kenyan statutory deductions (SHA, PAYEE, Housing Levy).

## Features

- 💰 **Income Calculator** - Calculate net pay with Kenyan statutory deductions
- 📊 **Budget Allocation** - Plan your spending across different categories
- 📝 **Expense Tracking** - Record and monitor actual expenses
- 📈 **Financial Summary** - View savings, spending percentage, and budget health
- 💾 **Local Storage** - All data is saved locally in your browser (no authentication required)
- 🇰🇪 **Kenyan Tax Compliance** - Based on 2024 statutory rates

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository or download the source code

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Enter Income** - Input your gross monthly salary to calculate net pay after statutory deductions
2. **Plan Budget** - Allocate your net pay across budget categories (rent, transport, savings, food, etc.)
3. **Track Expenses** - Record your actual expenses in each category
4. **Monitor Health** - Review your financial summary to track savings and spending

## Data Storage

All your budget data is stored locally in your browser's local storage. No authentication or external database is required. Your data remains private and is only accessible from the browser where you created it.

**Note:** Clearing your browser data will delete your budget information. Consider exporting your data regularly if needed.

## Technology Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Storage:** Browser Local Storage
- **State Management:** React Context API

## Build for Production

```bash
npm run build
npm start
```

## License

Personal use project.
