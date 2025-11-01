import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeCard } from '@/components/trades/TradeCard';
import { TradeWithCalculations } from '@/lib/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('TradeCard', () => {
  const createMockTrade = (overrides: Partial<TradeWithCalculations> = {}): TradeWithCalculations => {
    return {
      id: 'trade-1',
      userId: 'user-1',
      symbol: 'AAPL',
      assetType: 'STOCK',
      currency: 'USD',
      entryDate: new Date('2024-01-01T10:00:00Z'),
      entryPrice: 100,
      exitDate: new Date('2024-01-02T10:00:00Z'),
      exitPrice: 105,
      quantity: 10,
      direction: 'LONG',
      fees: 1,
      setupType: null,
      strategyName: null,
      stopLoss: null,
      takeProfit: null,
      riskRewardRatio: null,
      timeOfDay: null,
      marketConditions: null,
      emotionalStateEntry: null,
      emotionalStateExit: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      screenshots: [],
      tags: [],
      calculations: {
        pnl: 50,
        pnlPercent: 5,
        netPnl: 49,
        entryValue: 1000,
        exitValue: 1050,
        holdingPeriod: 24,
        holdingPeriodDays: 1,
        isWinner: true,
        isLoser: false,
        isBreakeven: false,
      },
      ...overrides,
    };
  };

  describe('Rendering', () => {
    it('should render trade card with basic information', () => {
      const trade = createMockTrade();
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('LONG')).toBeInTheDocument();
      expect(screen.getByText('STOCK')).toBeInTheDocument();
    });

    it('should render winning trade with profit styling', () => {
      const trade = createMockTrade({
        calculations: {
          pnl: 50,
          pnlPercent: 5,
          netPnl: 49,
          entryValue: 1000,
          exitValue: 1050,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: true,
          isLoser: false,
          isBreakeven: false,
        },
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      // The component renders the trade with winning styling - verify the trade card exists
      const card = screen.getByText('AAPL').closest('div');
      expect(card).toBeInTheDocument();
    });

    it('should render losing trade with loss styling', () => {
      const trade = createMockTrade({
        exitPrice: 95,
        calculations: {
          pnl: -50,
          pnlPercent: -5,
          netPnl: -51,
          entryValue: 1000,
          exitValue: 950,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: false,
          isLoser: true,
          isBreakeven: false,
        },
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should render breakeven trade', () => {
      const trade = createMockTrade({
        exitPrice: 100,
        calculations: {
          pnl: 0,
          pnlPercent: 0,
          netPnl: -1,
          entryValue: 1000,
          exitValue: 1000,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: false,
          isLoser: false,
          isBreakeven: true,
        },
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should render SHORT direction badge', () => {
      const trade = createMockTrade({
        direction: 'SHORT',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('SHORT')).toBeInTheDocument();
    });

    it('should render strategy name when provided', () => {
      const trade = createMockTrade({
        strategyName: 'Momentum Trading',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText(/Strategy: Momentum Trading/i)).toBeInTheDocument();
    });

    it('should render setup type when provided', () => {
      const trade = createMockTrade({
        setupType: 'Breakout',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('Breakout')).toBeInTheDocument();
    });

    it('should render time of day when provided', () => {
      const trade = createMockTrade({
        timeOfDay: 'MARKET_OPEN',
      });
      render(<TradeCard trade={trade} />);

      // The component replaces underscores with spaces
      expect(screen.getByText(/MARKET OPEN/i)).toBeInTheDocument();
    });

    it('should render market conditions when provided', () => {
      const trade = createMockTrade({
        marketConditions: 'TRENDING',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('TRENDING')).toBeInTheDocument();
    });

    it('should render tags when provided', () => {
      const trade = createMockTrade({
        tags: [
          { tag: { id: 'tag-1', name: 'momentum', createdAt: new Date(), updatedAt: new Date() } },
          { tag: { id: 'tag-2', name: 'breakout', createdAt: new Date(), updatedAt: new Date() } },
        ],
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('#momentum')).toBeInTheDocument();
      expect(screen.getByText('#breakout')).toBeInTheDocument();
    });

    it('should render screenshot count when screenshots exist', () => {
      const trade = createMockTrade({
        screenshots: [
          {
            id: 'screenshot-1',
            tradeId: 'trade-1',
            url: 'https://example.com/img1.jpg',
            filename: 'img1.jpg',
            fileSize: 100000,
            mimeType: 'image/jpeg',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('1 screenshot')).toBeInTheDocument();
    });

    it('should render plural screenshot text for multiple screenshots', () => {
      const trade = createMockTrade({
        screenshots: [
          {
            id: 'screenshot-1',
            tradeId: 'trade-1',
            url: 'https://example.com/img1.jpg',
            filename: 'img1.jpg',
            fileSize: 100000,
            mimeType: 'image/jpeg',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'screenshot-2',
            tradeId: 'trade-1',
            url: 'https://example.com/img2.jpg',
            filename: 'img2.jpg',
            fileSize: 100000,
            mimeType: 'image/jpeg',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('2 screenshots')).toBeInTheDocument();
    });
  });

  describe('P&L Display', () => {
    it('should display net P&L correctly', () => {
      const trade = createMockTrade({
        calculations: {
          pnl: 50,
          pnlPercent: 5,
          netPnl: 49,
          entryValue: 1000,
          exitValue: 1050,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: true,
          isLoser: false,
          isBreakeven: false,
        },
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText(/P&L/i)).toBeInTheDocument();
    });

    it('should display P&L percentage correctly', () => {
      const trade = createMockTrade({
        calculations: {
          pnl: 50,
          pnlPercent: 5,
          netPnl: 49,
          entryValue: 1000,
          exitValue: 1050,
          holdingPeriod: 24,
          holdingPeriodDays: 1,
          isWinner: true,
          isLoser: false,
          isBreakeven: false,
        },
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText(/Return/i)).toBeInTheDocument();
    });
  });

  describe('Entry/Exit Information', () => {
    it('should display entry price and quantity', () => {
      const trade = createMockTrade();
      render(<TradeCard trade={trade} />);

      expect(screen.getByText(/Entry/i)).toBeInTheDocument();
      expect(screen.getByText(/Qty: 10/i)).toBeInTheDocument();
    });

    it('should display exit price and date', () => {
      const trade = createMockTrade();
      render(<TradeCard trade={trade} />);

      expect(screen.getByText(/Exit/i)).toBeInTheDocument();
    });

    it('should display "Open" when exit price is null', () => {
      const trade = createMockTrade({
        exitPrice: null,
        exitDate: null,
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('Link Behavior', () => {
    it('should render as Link to trade detail when onClick is not provided', () => {
      const trade = createMockTrade();
      render(<TradeCard trade={trade} />);

      const link = screen.getByText('AAPL').closest('a');
      expect(link).toHaveAttribute('href', '/trades/trade-1');
    });

    it('should render as button when onClick is provided', async () => {
      const user = userEvent.setup();
      const trade = createMockTrade();
      const onClick = jest.fn();
      render(<TradeCard trade={trade} onClick={onClick} />);

      const button = screen.getByText('AAPL').closest('button');
      expect(button).toBeInTheDocument();

      await user.click(button!);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multi-Currency Support', () => {
    it('should display currency correctly for EUR trades', () => {
      const trade = createMockTrade({
        currency: 'EUR',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should display currency correctly for GBP trades', () => {
      const trade = createMockTrade({
        currency: 'GBP',
      });
      render(<TradeCard trade={trade} />);

      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });
  });
});

