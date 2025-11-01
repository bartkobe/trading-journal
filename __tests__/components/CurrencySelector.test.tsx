import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencySelector, CURRENCIES } from '@/components/ui/CurrencySelector';

describe('CurrencySelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/USD/i)).toBeInTheDocument();
    });

    it('should render all currency options', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      CURRENCIES.forEach((currency) => {
        expect(screen.getByRole('option', { name: new RegExp(currency.code, 'i') })).toBeInTheDocument();
      });
    });

    it('should show currency symbols by default', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const usdOption = screen.getByRole('option', { name: /USD.*\(\$\)/i });
      expect(usdOption).toBeInTheDocument();
    });

    it('should hide currency symbols when showSymbol is false', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} showSymbol={false} />);

      const usdOption = screen.getByRole('option', { name: /USD - US Dollar$/i });
      expect(usdOption).toBeInTheDocument();
      expect(usdOption.textContent).not.toContain('(');
    });

    it('should render with custom label', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} label="Trade Currency" />);

      expect(screen.getByLabelText(/trade currency/i)).toBeInTheDocument();
    });

    it('should show required indicator when required is true', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} required={true} />);

      const label = screen.getByLabelText(/currency/i);
      expect(label).toBeInTheDocument();
      // Check for asterisk in the label
      const labelElement = label.closest('div')?.querySelector('label');
      expect(labelElement?.textContent).toContain('*');
    });

    it('should render with error message', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} error="Currency is required" />);

      expect(screen.getByText('Currency is required')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} disabled={true} />);

      const select = screen.getByLabelText(/currency/i);
      expect(select).toBeDisabled();
    });
  });

  describe('User Interaction', () => {
    it('should call onChange when currency is selected', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const select = screen.getByLabelText(/currency/i);
      await user.selectOptions(select, 'EUR');

      expect(mockOnChange).toHaveBeenCalledWith('EUR');
    });

    it('should update selected value when prop changes', () => {
      const { rerender } = render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue(/USD/i)).toBeInTheDocument();

      rerender(<CurrencySelector value="GBP" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue(/GBP/i)).toBeInTheDocument();
    });

    it('should handle selection of all supported currencies', async () => {
      const user = userEvent.setup();
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const select = screen.getByLabelText(/currency/i);

      for (const currency of CURRENCIES) {
        await user.selectOptions(select, currency.code);
        expect(mockOnChange).toHaveBeenCalledWith(currency.code);
        mockOnChange.mockClear();
      }
    });
  });

  describe('Currency Options', () => {
    it('should have all currencies in correct order', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const options = screen.getAllByRole('option');
      const currencyCodes = options
        .map((opt) => opt.getAttribute('value'))
        .filter((val): val is string => val !== null);

      expect(currencyCodes).toEqual(CURRENCIES.map((c) => c.code));
    });

    it('should display currency name and code for each option', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      CURRENCIES.forEach((currency) => {
        const option = screen.getByRole('option', { name: new RegExp(currency.code, 'i') });
        expect(option.textContent).toContain(currency.code);
        expect(option.textContent).toContain(currency.name);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const select = screen.getByLabelText(/currency/i);
      expect(select).toHaveAttribute('id', 'currency');
    });

    it('should have name attribute', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} name="tradeCurrency" />);

      const select = screen.getByLabelText(/currency/i);
      expect(select).toHaveAttribute('name', 'tradeCurrency');
    });

    it('should default name to "currency" when not provided', () => {
      render(<CurrencySelector value="USD" onChange={mockOnChange} />);

      const select = screen.getByLabelText(/currency/i);
      expect(select).toHaveAttribute('name', 'currency');
    });
  });
});

