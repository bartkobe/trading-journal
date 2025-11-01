import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeFilters } from '@/components/trades/TradeFilters';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TradeFilters', () => {
  const mockOnChange = jest.fn();
  const mockOnApply = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnExportCsv = jest.fn();

  const defaultProps = {
    filters: {
      startDate: '',
      endDate: '',
      assetType: '',
      outcome: '',
      search: '',
      symbol: '',
      strategyName: '',
      tags: [],
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
    },
    onChange: mockOnChange,
    onApply: mockOnApply,
    onReset: mockOnReset,
    onExportCsv: mockOnExportCsv,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ tags: [] }),
    });
  });

  it('should render all filter controls', () => {
    render(<TradeFilters {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Date From')).toBeInTheDocument();
    expect(screen.getByLabelText('Date To')).toBeInTheDocument();
    expect(screen.getByLabelText('Asset Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Outcome')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Outcomes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. AAPL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Breakout')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by symbol, strategy, or notes...')).toBeInTheDocument();
    expect(screen.getByText('Sort by')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('should call onChange when date inputs change', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const dateFromInput = screen.getByLabelText('Date From');
    await user.type(dateFromInput, '2024-01-01');

    expect(mockOnChange).toHaveBeenCalledWith('startDate', '2024-01-01');
  });

  it('should call onChange when asset type select changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const assetTypeSelect = screen.getByLabelText('Asset Type');
    await user.selectOptions(assetTypeSelect, 'STOCK');

    expect(mockOnChange).toHaveBeenCalledWith('assetType', 'STOCK');
  });

  it('should call onChange when outcome select changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const outcomeSelect = screen.getByLabelText('Outcome');
    await user.selectOptions(outcomeSelect, 'win');

    expect(mockOnChange).toHaveBeenCalledWith('outcome', 'win');
  });

  it('should call onChange when symbol input changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const symbolInput = screen.getByPlaceholderText('e.g. AAPL');
    await user.type(symbolInput, 'AAPL');

    expect(mockOnChange).toHaveBeenCalledWith('symbol', 'AAPL');
  });

  it('should call onChange when strategy input changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const strategyInput = screen.getByPlaceholderText('e.g. Breakout');
    await user.type(strategyInput, 'Breakout');

    expect(mockOnChange).toHaveBeenCalledWith('strategyName', 'Breakout');
  });

  it('should call onChange when search input changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search by symbol, strategy, or notes...');
    await user.type(searchInput, 'momentum');

    expect(mockOnChange).toHaveBeenCalledWith('search', 'momentum');
  });

  it('should call onChange when sort by select changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const sortBySelect = screen.getByDisplayValue('Date');
    await user.selectOptions(sortBySelect, 'pnl');

    expect(mockOnChange).toHaveBeenCalledWith('sortBy', 'pnl');
  });

  it('should call onChange when sort order select changes', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const sortOrderSelect = screen.getByDisplayValue('Desc');
    await user.selectOptions(sortOrderSelect, 'asc');

    expect(mockOnChange).toHaveBeenCalledWith('sortOrder', 'asc');
  });

  it('should call onApply when Apply Filters button is clicked', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const applyButton = screen.getByText('Apply Filters');
    await user.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when Reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should call onExportCsv when Export CSV button is clicked', async () => {
    const user = userEvent.setup();
    render(<TradeFilters {...defaultProps} />);

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    expect(mockOnExportCsv).toHaveBeenCalledTimes(1);
  });

  it('should not render Export CSV button when onExportCsv is not provided', () => {
    const propsWithoutExport = { ...defaultProps };
    delete propsWithoutExport.onExportCsv;

    render(<TradeFilters {...propsWithoutExport} />);

    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('should show active filters when filters are applied', () => {
    const filtersWithValues = {
      ...defaultProps.filters,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      assetType: 'STOCK',
      outcome: 'win',
      search: 'momentum',
      symbol: 'AAPL',
      strategyName: 'Breakout',
      tags: ['tag1', 'tag2'],
    };

    render(<TradeFilters {...defaultProps} filters={filtersWithValues} />);

    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('From: 1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('To: 1/31/2024')).toBeInTheDocument();
    expect(screen.getByText('Type: STOCK')).toBeInTheDocument();
    expect(screen.getByText('Outcome: win')).toBeInTheDocument();
    expect(screen.getByText('Search: momentum')).toBeInTheDocument();
    expect(screen.getByText('Symbol: AAPL')).toBeInTheDocument();
    expect(screen.getByText('Strategy: Breakout')).toBeInTheDocument();
    expect(screen.getByText('Tags: tag1, tag2')).toBeInTheDocument();
  });

  it('should not show active filters when no filters are applied', () => {
    render(<TradeFilters {...defaultProps} />);

    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
  });

  it('should handle tag input integration', async () => {
    const user = userEvent.setup();
    const mockOnTagChange = jest.fn();
    const propsWithTags = {
      ...defaultProps,
      filters: {
        ...defaultProps.filters,
        tags: ['existing-tag'],
      },
      onChange: (field: string, value: any) => {
        if (field === 'tags') {
          mockOnTagChange(value);
        } else {
          mockOnChange(field, value);
        }
      },
    };

    render(<TradeFilters {...propsWithTags} />);

    // The TagInput component should be rendered
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type to search or add tags')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<TradeFilters {...defaultProps} />);

    const dateFromInput = screen.getByLabelText('Date From');
    const dateToInput = screen.getByLabelText('Date To');
    const assetTypeSelect = screen.getByLabelText('Asset Type');
    const outcomeSelect = screen.getByLabelText('Outcome');

    expect(dateFromInput).toHaveAttribute('type', 'date');
    expect(dateToInput).toHaveAttribute('type', 'date');
    expect(assetTypeSelect).toHaveAttribute('id', 'asset-type');
    expect(outcomeSelect).toHaveAttribute('id', 'outcome');
  });

  it('should have proper form structure', () => {
    render(<TradeFilters {...defaultProps} />);

    // Check that inputs have proper types and placeholders
    const symbolInput = screen.getByPlaceholderText('e.g. AAPL');
    const strategyInput = screen.getByPlaceholderText('e.g. Breakout');
    const searchInput = screen.getByPlaceholderText('Search by symbol, strategy, or notes...');

    expect(symbolInput).toHaveAttribute('type', 'text');
    expect(strategyInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('should handle complex filter combinations', () => {
    const complexFilters = {
      ...defaultProps.filters,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      assetType: 'CRYPTO',
      outcome: 'loss',
      search: 'bitcoin',
      symbol: 'BTC',
      strategyName: 'Scalping',
      tags: ['crypto', 'short-term'],
      sortBy: 'pnlPercent' as const,
      sortOrder: 'asc' as const,
    };

    render(<TradeFilters {...defaultProps} filters={complexFilters} />);

    // Verify all complex filters are displayed
    expect(screen.getByText('Type: CRYPTO')).toBeInTheDocument();
    expect(screen.getByText('Outcome: loss')).toBeInTheDocument();
    expect(screen.getByText('Search: bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Symbol: BTC')).toBeInTheDocument();
    expect(screen.getByText('Strategy: Scalping')).toBeInTheDocument();
    expect(screen.getByText('Tags: crypto, short-term')).toBeInTheDocument();
  });

  it('should render with proper responsive layout', () => {
    render(<TradeFilters {...defaultProps} />);

    // Verify the component renders with responsive classes
    const container = screen.getByText('Filters').closest('div');
    expect(container).toBeInTheDocument();

    // Verify buttons are present in responsive container
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });
});

