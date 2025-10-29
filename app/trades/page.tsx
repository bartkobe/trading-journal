import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TradeList } from '@/components/trades/TradeList';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  try {
    await requireAuth();
  } catch (error) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Trade Journal</h1>
          <p className="mt-2 text-muted-foreground">View and manage all your trades</p>
        </div>

        {/* Filters Section - Placeholder */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Date From
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Date To
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Asset Type
              </label>
              <select className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors">
                <option value="">All Types</option>
                <option value="STOCK">Stock</option>
                <option value="FOREX">Forex</option>
                <option value="CRYPTO">Crypto</option>
                <option value="OPTION">Option</option>
                <option value="FUTURE">Future</option>
                <option value="COMMODITY">Commodity</option>
              </select>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Outcome
              </label>
              <select className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors">
                <option value="">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="breakeven">Break Even</option>
              </select>
            </div>
          </div>

          {/* Search and Reset */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by symbol, strategy, or notes..."
                className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground transition-colors"
              />
            </div>
            <button className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-secondary-foreground rounded-lg transition-colors">
              Reset
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold text-success">0%</p>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p className="text-2xl font-bold text-foreground">$0.00</p>
          </div>
          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <p className="text-sm text-muted-foreground">Avg P&L</p>
            <p className="text-2xl font-bold text-foreground">$0.00</p>
          </div>
        </div>

        {/* Trade List */}
        <TradeList />
      </div>
    </div>
  );
}
