# My Personal Budget Planner

A personal finance management application built with Next.js that helps track income, expenses, and budget allocation with automatic Kenyan statutory deductions (SHA, PAYEE, Housing Levy).

## Features

- 💰 **Income Calculator** - Calculate net pay with Kenyan statutory deductions
- 📊 **Budget Allocation** - Plan your spending across different categories
- 📝 **Expense Tracking** - Record and monitor actual expenses
- 📈 **Financial Summary** - View savings, spending percentage, and budget health
- 💾 **Local Storage** - All data is stored in your browser for instant access
- 🇰🇪 **Kenyan Tax Compliance** - Based on 2024 statutory rates
- 🚀 **No Setup Required** - Works offline, no database configuration needed

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager
- A modern web browser with localStorage enabled


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

4. Open <http://localhost:3000> in your browser

5. Start budgeting! 🎉
   - Enter your income
   - Create budget categories
   - Track your expenses
   - Monitor your financial health

## Data Storage

### Local Browser Storage

All your data is stored locally in your browser using localStorage:
- **Automatic Saving** - Changes are saved instantly
- **Offline Access** - Works without internet connection
- **Privacy** - Data never leaves your device
- **Fast Performance** - No network delays

### Storage Keys
- `budget_planner_income` - Your income and deductions
- `budget_planner_categories` - Budget categories and expenses

### Data Backup

**Backing up your data:**
```javascript
// In browser console (F12)
const income = localStorage.getItem('budget_planner_income');
const categories = localStorage.getItem('budget_planner_categories');
console.log(JSON.stringify({ income, categories }, null, 2));
// Copy the output and save to a file
```

**Restoring from backup:**
```javascript
// In browser console (F12)
const backup = { income: {...}, categories: [...] }; // Your backup data
localStorage.setItem('budget_planner_income', JSON.stringify(backup.income));
localStorage.setItem('budget_planner_categories', JSON.stringify(backup.categories));
// Refresh the page
```

### Clearing Data

```javascript
// In browser console (F12)
localStorage.removeItem('budget_planner_income');
localStorage.removeItem('budget_planner_categories');
// Or clear everything:
localStorage.clear();
```

   ```javascript
   localStorage.removeItem("budget_planner_income")
   localStorage.removeItem("budget_planner_categories")
   ```

## How to Use

1. **Enter Income** - Input your gross monthly salary to calculate net pay after statutory deductions
2. **Plan Budget** - Allocate your net pay across budget categories (rent, transport, savings, food, etc.)
3. **Track Expenses** - Record your actual expenses in each category
4. **Monitor Health** - Review your financial summary to track savings and spending


## Data Storage

All your budget data is securely stored in Supabase (PostgreSQL database):

- **Income History** - Track income changes over time
- **Budget Categories** - Organize spending with custom categories
- **Expense Records** - Detailed expense tracking with dates and descriptions
- **Automatic Calculations** - Category totals updated automatically

**Benefits:**

- ✅ Access your data from any device
- ✅ Historical tracking of financial statements
- ✅ Automatic backups and data persistence
- ✅ No data loss from clearing browser cache


## Technology Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **State Management:** React Context API

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### "User ID not configured" Error

Make sure you have created a `.env.local` file with `NEXT_PUBLIC_USER_ID` set.

### Can't connect to Supabase

- Verify your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check that the schema.sql has been run successfully
- Ensure your Supabase project is active (not paused)

### Data not saving

- Open browser console and check for errors
- Verify environment variables are set correctly
- Check Supabase project is active and accessible

## Project Structure

```
budget-planner/
├── actions/           # Server actions
├── app/              # Next.js app directory
├── components/       # React components
├── constants/        # App constants
├── database/         # Database schema and migrations
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and repositories
└── public/          # Static assets
```

## License

Personal use project.
