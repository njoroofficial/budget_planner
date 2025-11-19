import { BudgetProvider } from '@/components/BudgetProvider';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundary';
import BudgetPlannerContent from '@/components/BudgetPlannerContent';

/**
 * Main Budget Planner page (Server Component)
 * Sets up the application structure with providers and error boundaries
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <ErrorBoundaryWrapper>
        <BudgetProvider>
          <BudgetPlannerContent />
        </BudgetProvider>
      </ErrorBoundaryWrapper>
    </div>
  );
}
