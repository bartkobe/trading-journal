'use client';

import { useState } from 'react';
import EquityCurve from './EquityCurve';
import WinLossDistribution from './WinLossDistribution';
import PnlByAssetType from './PnlByAssetType';
import PnlByStrategy from './PnlByStrategy';
import PnlByTimeOfDay from './PnlByTimeOfDay';
import PnlByDayOfWeek from './PnlByDayOfWeek';
import PnlBySymbol from './PnlBySymbol';
import PnlBySetupType from './PnlBySetupType';
import PnlByEmotionalState from './PnlByEmotionalState';

// ============================================================================
// Types
// ============================================================================

interface PerformanceChartsProps {
  startDate?: string;
  endDate?: string;
}

type ChartSection =
  | 'equity'
  | 'distribution'
  | 'assetType'
  | 'strategy'
  | 'timeOfDay'
  | 'dayOfWeek'
  | 'symbol'
  | 'setupType'
  | 'emotionalState'
  | 'all';

// ============================================================================
// PerformanceCharts Component
// ============================================================================

export default function PerformanceCharts({ startDate, endDate }: PerformanceChartsProps) {
  const [visibleSection, setVisibleSection] = useState<ChartSection>('all');

  // Chart section filters
  const sections = [
    { id: 'all', label: 'All Charts', icon: '📊' },
    { id: 'equity', label: 'Equity Curve', icon: '📈' },
    { id: 'distribution', label: 'Win/Loss', icon: '🎯' },
    { id: 'assetType', label: 'By Asset', icon: '💼' },
    { id: 'strategy', label: 'By Strategy', icon: '🎲' },
    { id: 'timeOfDay', label: 'By Time', icon: '🕐' },
    { id: 'dayOfWeek', label: 'By Day', icon: '📅' },
    { id: 'symbol', label: 'By Symbol', icon: '🔤' },
    { id: 'setupType', label: 'By Setup', icon: '🎯' },
    { id: 'emotionalState', label: 'By Emotion', icon: '🧠' },
  ] as const;

  const shouldShowChart = (chartId: ChartSection) => {
    return visibleSection === 'all' || visibleSection === chartId;
  };

  return (
    <div className="space-y-6">
      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Show:
        </span>
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setVisibleSection(section.id as ChartSection)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                visibleSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* Equity Curve - Full Width */}
        {shouldShowChart('equity') && (
          <div className="w-full">
            <EquityCurve startDate={startDate} endDate={endDate} height={400} showArea={true} />
          </div>
        )}

        {/* Win/Loss Distribution - Full Width */}
        {shouldShowChart('distribution') && (
          <div className="w-full">
            <WinLossDistribution
              startDate={startDate}
              endDate={endDate}
              height={300}
              showPnlHistogram={true}
            />
          </div>
        )}

        {/* Performance by Asset Type */}
        {shouldShowChart('assetType') && (
          <div className="w-full">
            <PnlByAssetType startDate={startDate} endDate={endDate} height={300} />
          </div>
        )}

        {/* Performance by Strategy */}
        {shouldShowChart('strategy') && (
          <div className="w-full">
            <PnlByStrategy startDate={startDate} endDate={endDate} height={300} />
          </div>
        )}

        {/* Performance by Time of Day */}
        {shouldShowChart('timeOfDay') && (
          <div className="w-full">
            <PnlByTimeOfDay startDate={startDate} endDate={endDate} height={300} />
          </div>
        )}

        {/* Performance by Day of Week */}
        {shouldShowChart('dayOfWeek') && (
          <div className="w-full">
            <PnlByDayOfWeek startDate={startDate} endDate={endDate} height={400} />
          </div>
        )}

        {/* Performance by Symbol */}
        {shouldShowChart('symbol') && (
          <div className="w-full">
            <PnlBySymbol startDate={startDate} endDate={endDate} />
          </div>
        )}

        {/* Performance by Setup Type */}
        {shouldShowChart('setupType') && (
          <div className="w-full">
            <PnlBySetupType startDate={startDate} endDate={endDate} />
          </div>
        )}

        {/* Performance by Emotional State */}
        {shouldShowChart('emotionalState') && (
          <div className="w-full">
            <PnlByEmotionalState startDate={startDate} endDate={endDate} />
          </div>
        )}
      </div>

      {/* Chart Count Indicator */}
      {visibleSection === 'all' && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing all {sections.length - 1} chart sections
          </p>
        </div>
      )}
    </div>
  );
}
