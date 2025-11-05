'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  const tSections = useTranslations('analytics.chartSections');
  const [visibleSection, setVisibleSection] = useState<ChartSection>('all');

  // Chart section filters
  const sections = [
    { id: 'all', label: tSections('allCharts'), icon: '📊' },
    { id: 'equity', label: tSections('equityCurve'), icon: '📈' },
    { id: 'distribution', label: tSections('winLoss'), icon: '🎯' },
    { id: 'assetType', label: tSections('byAsset'), icon: '💼' },
    { id: 'strategy', label: tSections('byStrategy'), icon: '🎲' },
    { id: 'timeOfDay', label: tSections('byTime'), icon: '🕐' },
    { id: 'dayOfWeek', label: tSections('byDay'), icon: '📅' },
    { id: 'symbol', label: tSections('bySymbol'), icon: '🔤' },
    { id: 'setupType', label: tSections('bySetup'), icon: '🎯' },
    { id: 'emotionalState', label: tSections('byEmotion'), icon: '🧠' },
  ] as const;

  const shouldShowChart = (chartId: ChartSection) => {
    return visibleSection === 'all' || visibleSection === chartId;
  };

  return (
    <div className="space-y-6">
      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {tSections('show')}
        </span>
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setVisibleSection(section.id as ChartSection)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                visibleSection === section.id
                  ? 'bg-primary text-white'
                  : 'bg-muted dark:bg-gray-700 text-foreground hover:bg-gray-200 dark:hover:bg-gray-600'
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
          <p className="text-sm text-muted-foreground">
            {tSections('showingAllSections', { count: sections.length - 1 })}
          </p>
        </div>
      )}
    </div>
  );
}
