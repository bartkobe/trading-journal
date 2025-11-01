import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

describe('DateRangeFilter', () => {
  const mockOnDateRangeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render date inputs and buttons', () => {
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should render preset buttons', () => {
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 days')).toBeInTheDocument();
      expect(screen.getByText('Last Year')).toBeInTheDocument();
    });
  });

  describe('Date Input', () => {
    it('should allow user to enter start date', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');

      expect(startDateInput).toHaveValue('2024-01-01');
    });

    it('should allow user to enter end date', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2024-01-31');

      expect(endDateInput).toHaveValue('2024-01-31');
    });
  });

  describe('Apply Button', () => {
    it('should call onDateRangeChange when Apply is clicked with dates', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const applyButton = screen.getByRole('button', { name: /apply/i });

      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-01-31');
      await user.click(applyButton);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('should call onDateRangeChange with undefined when dates are empty', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('Clear Button', () => {
    it('should clear dates when Clear is clicked', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const clearButton = screen.getByRole('button', { name: /clear/i });

      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-01-31');

      await user.click(clearButton);

      expect(startDateInput).toHaveValue('');
      expect(endDateInput).toHaveValue('');
      expect(mockOnDateRangeChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('Preset Buttons', () => {
    it('should set dates for Last 7 days preset', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const last7DaysButton = screen.getByText('Last 7 days');
      await user.click(last7DaysButton);

      expect(mockOnDateRangeChange).toHaveBeenCalled();
      const callArgs = mockOnDateRangeChange.mock.calls[0];
      expect(callArgs[0]).toBeDefined();
      expect(callArgs[1]).toBeDefined();
    });

    it('should set dates for Last 30 days preset', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const last30DaysButton = screen.getByText('Last 30 days');
      await user.click(last30DaysButton);

      expect(mockOnDateRangeChange).toHaveBeenCalled();
    });

    it('should set dates for Last 90 days preset', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const last90DaysButton = screen.getByText('Last 90 days');
      await user.click(last90DaysButton);

      expect(mockOnDateRangeChange).toHaveBeenCalled();
    });

    it('should set dates for Last year preset', async () => {
      const user = userEvent.setup();
      render(<DateRangeFilter onDateRangeChange={mockOnDateRangeChange} />);

      const lastYearButton = screen.getByText('Last Year');
      await user.click(lastYearButton);

      expect(mockOnDateRangeChange).toHaveBeenCalled();
    });
  });
});

