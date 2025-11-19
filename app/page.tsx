export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-gray-600 mt-2">Manage your finances with ease</p>
        </header>
        
        <main className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Budget Planner</h2>
            <p className="text-gray-600">
              This application will help you track your income, statutory deductions, and expenses.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
