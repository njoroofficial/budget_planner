# My Personal Budget Planner

A personal finance management application built with Next.js that helps track income, expenses, and budget allocation with automatic Kenyan statutory deductions (SHA, PAYEE, Housing Levy).

## Features

- 💰 **Income Calculator** - Calculate net pay with Kenyan statutory deductions
- 📊 **Budget Allocation** - Plan your spending across different categories
- 📝 **Expense Tracking** - Record and monitor actual expenses
- 📈 **Financial Summary** - View savings, spending percentage, and budget health
- 💾 **Database Storage** - All data is stored in Supabase for persistence and historical tracking
- 🇰🇪 **Kenyan Tax Compliance** - Based on 2024 statutory rates

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager
- A free Supabase account (https://supabase.com)


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

3. Set up Supabase:

   a. Create a new project at <https://supabase.com>
   
   b. Go to SQL Editor and run the schema from `database/schema.sql`
   
   c. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```
   
   d. Update `.env.local` with your Supabase credentials:
   - Get `NEXT_PUBLIC_SUPABASE_URL` from Project Settings > API
   - Get `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings > API
   - Keep `NEXT_PUBLIC_USER_ID` as is (or generate your own UUID)

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open <http://localhost:3000> in your browser

## Database Setup

### Setting Up Supabase

1. **Create a Supabase Project**
   - Go to <https://supabase.com> and sign up/login
   - Click "New Project"
   - Choose a name and password for your database
   - Select a region close to you
   - Wait for the project to be provisioned

2. **Run Database Migration**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"
   - Copy the entire contents of `database/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Verify that tables were created by checking the "Table Editor"

3. **Configure Environment Variables**
   - In Supabase, go to Project Settings > API
   - Copy your Project URL and paste as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy your `anon` `public` key and paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Save the `.env.local` file

### Migrating from localStorage (Optional)

If you were using a previous version with localStorage:

1. Open your app in the browser
2. Open the browser console (F12)
3. Run: `migrateLocalStorageToSupabase()`
4. Wait for the migration to complete
5. Refresh the page to verify your data
6. Once verified, you can clear localStorage:

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
