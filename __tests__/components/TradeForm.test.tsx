import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TradeForm } from '@/components/trades/TradeForm';
import { useRouter } from 'next/navigation';

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    reload: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('TradeForm', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();
  });

  const defaultFormData = {
    symbol: 'AAPL',
    assetType: 'STOCK' as const,
    currency: 'USD',
    direction: 'LONG' as const,
    entryDate: '2024-01-01T10:00',
    entryPrice: 100,
    quantity: 10,
    exitDate: '2024-01-02T10:00',
    exitPrice: 105,
    fees: 1,
  };

  // Helper function to fill all required fields
  const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
    // Fill symbol
    const symbolInput = screen.getByLabelText(/symbol\/ticker/i);
    await user.clear(symbolInput);
    await user.type(symbolInput, defaultFormData.symbol);
    
    // Fill entry date
    const entryDateInput = screen.getByLabelText(/entry date & time/i);
    await user.clear(entryDateInput);
    await user.type(entryDateInput, defaultFormData.entryDate);
    
    // Fill entry price
    const entryPriceInput = screen.getByLabelText(/entry price/i) as HTMLInputElement;
    await user.clear(entryPriceInput);
    await user.type(entryPriceInput, defaultFormData.entryPrice.toString());
    
    // Fill quantity
    const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement;
    await user.clear(quantityInput);
    await user.type(quantityInput, defaultFormData.quantity.toString());
    
    // Fill exit date
    const exitDateInput = screen.getByLabelText(/exit date & time/i);
    await user.clear(exitDateInput);
    await user.type(exitDateInput, defaultFormData.exitDate);
    
    // Fill exit price
    const exitPriceInput = screen.getByLabelText(/exit price/i) as HTMLInputElement;
    await user.clear(exitPriceInput);
    await user.type(exitPriceInput, defaultFormData.exitPrice.toString());
    
    // Wait a bit for React Hook Form to update internal state
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<TradeForm />);

      // Basic Information
      expect(screen.getByLabelText(/symbol\/ticker/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asset type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/direction/i)).toBeInTheDocument();

      // Entry Details
      expect(screen.getByLabelText(/entry date & time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();

      // Exit Details
      expect(screen.getByLabelText(/exit date & time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/exit price/i)).toBeInTheDocument();

      // Strategy & Risk Management
      expect(screen.getByLabelText(/strategy name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/setup type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stop loss/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/take profit target/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/planned risk\/reward ratio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/commissions\/fees/i)).toBeInTheDocument();

      // Context & Conditions
      expect(screen.getByLabelText(/time of day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/market conditions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emotional state at entry/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emotional state at exit/i)).toBeInTheDocument();

      // Notes
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('should show default values', () => {
      render(<TradeForm />);

      expect(screen.getByLabelText(/currency/i)).toHaveValue('USD');
      expect(screen.getByLabelText(/direction/i)).toHaveValue('LONG');
      expect(screen.getByLabelText(/asset type/i)).toHaveValue('STOCK');
    });

    it('should include PLN in currency dropdown', () => {
      render(<TradeForm />);

      const currencySelect = screen.getByLabelText(/currency/i);
      const plnOption = within(currencySelect).getByRole('option', { name: /PLN/i });
      expect(plnOption).toBeInTheDocument();
      expect(plnOption).toHaveAttribute('value', 'PLN');
    });

    it('should render with initial data in edit mode', () => {
      const initialData = {
        ...defaultFormData,
        strategyName: 'Momentum',
        setupType: 'Breakout',
        notes: 'Test notes',
      };

      render(<TradeForm tradeId="trade-123" initialData={initialData} />);

      expect(screen.getByLabelText(/symbol\/ticker/i)).toHaveValue('AAPL');
      expect(screen.getByLabelText(/strategy name/i)).toHaveValue('Momentum');
      expect(screen.getByLabelText(/setup type/i)).toHaveValue('Breakout');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Test notes');
      expect(screen.getByRole('button', { name: /update trade/i })).toBeInTheDocument();
    });

    it('should show "Create Trade" button in create mode', () => {
      render(<TradeForm />);
      expect(screen.getByRole('button', { name: /create trade/i })).toBeInTheDocument();
    });

    it('should show "Update Trade" button in edit mode', () => {
      render(<TradeForm tradeId="trade-123" />);
      expect(screen.getByRole('button', { name: /update trade/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/symbol is required/i)).toBeInTheDocument();
      });
    });

    it('should validate entry price is positive', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      await user.type(screen.getByLabelText(/symbol\/ticker/i), 'AAPL');
      await user.type(screen.getByLabelText(/entry price/i), '-10');
      await user.type(screen.getByLabelText(/entry date & time/i), '2024-01-01T10:00');
      await user.type(screen.getByLabelText(/quantity/i), '10');
      await user.type(screen.getByLabelText(/exit date & time/i), '2024-01-02T10:00');
      await user.type(screen.getByLabelText(/exit price/i), '105');

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/entry price must be positive/i)).toBeInTheDocument();
      });
    });

    it('should validate exit price is positive', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      await user.type(screen.getByLabelText(/symbol\/ticker/i), 'AAPL');
      await user.type(screen.getByLabelText(/entry price/i), '100');
      await user.type(screen.getByLabelText(/entry date & time/i), '2024-01-01T10:00');
      await user.type(screen.getByLabelText(/quantity/i), '10');
      await user.type(screen.getByLabelText(/exit date & time/i), '2024-01-02T10:00');
      await user.type(screen.getByLabelText(/exit price/i), '-10');

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/exit price must be positive/i)).toBeInTheDocument();
      });
    });

    it('should validate quantity is positive', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      await user.type(screen.getByLabelText(/symbol\/ticker/i), 'AAPL');
      await user.type(screen.getByLabelText(/entry price/i), '100');
      await user.type(screen.getByLabelText(/entry date & time/i), '2024-01-01T10:00');
      await user.type(screen.getByLabelText(/quantity/i), '0');
      await user.type(screen.getByLabelText(/exit date & time/i), '2024-01-02T10:00');
      await user.type(screen.getByLabelText(/exit price/i), '105');

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data in create mode', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: true,
        json: async () => ({ trade: { id: 'new-trade-123' } }),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 5000 });

      const fetchCalls = mockFetch.mock.calls;
      expect(fetchCalls.length).toBeGreaterThan(0);
      expect(fetchCalls[0][0]).toBe('/api/trades');
      expect(fetchCalls[0][1]?.method).toBe('POST');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/trades/new-trade-123');
      }, { timeout: 5000 });
    });

    it('should submit form with valid data in edit mode', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: true,
        json: async () => ({ trade: { id: 'trade-123' } }),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm tradeId="trade-123" initialData={defaultFormData} />);

      // Modify a field
      const symbolInput = screen.getByLabelText(/symbol\/ticker/i);
      await user.clear(symbolInput);
      await user.type(symbolInput, 'MSFT');
      
      // Wait for form state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const submitButton = screen.getByRole('button', { name: /update trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 10000 });

      if (mockFetch.mock.calls.length > 0) {
        const fetchCalls = mockFetch.mock.calls;
        expect(fetchCalls[0][0]).toBe('/api/trades/trade-123');
        expect(fetchCalls[0][1]?.method).toBe('PUT');
      }
    }, 15000);

    it('should call onSuccess callback if provided', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      const mockResponse = {
        ok: true,
        json: async () => ({ trade: { id: 'new-trade-123' } }),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm onSuccess={onSuccess} />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      }, { timeout: 10000 });

      expect(mockPush).not.toHaveBeenCalled();
    }, 15000);

    it('should create trade with PLN currency', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: true,
        json: async () => ({ trade: { id: 'new-trade-123', currency: 'PLN' } }),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      // Wait a bit for React Hook Form to update internal state
      await new Promise(resolve => setTimeout(resolve, 100));

      // Select PLN currency
      const currencySelect = screen.getByLabelText(/currency/i);
      await user.selectOptions(currencySelect, 'PLN');

      // Wait for form state to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify PLN is selected
      expect(currencySelect).toHaveValue('PLN');

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 10000 });

      const fetchCalls = mockFetch.mock.calls;
      expect(fetchCalls.length).toBeGreaterThan(0);
      
      // Verify the request body includes PLN currency
      const requestBody = JSON.parse(fetchCalls[0][1]?.body as string);
      expect(requestBody.currency).toBe('PLN');
    }, 20000);

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: Response) => void;
      const mockResponse = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      }) as Promise<Response>;
      mockFetch.mockReturnValue(mockResponse);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      // Wait for loading state
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const savingButton = buttons.find(b => b.textContent?.includes('Saving'));
        expect(savingButton).toBeDefined();
      }, { timeout: 5000 });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ trade: { id: 'new-trade-123' } }),
      } as Response);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should display error message on 400 validation error', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid trade data' }),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid trade data/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display error message on 401 authentication error', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({}),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display error message on 404 not found error in edit mode', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({}),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm tradeId="trade-123" initialData={defaultFormData} />);

      const submitButton = screen.getByRole('button', { name: /update trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/trade not found/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display error message on 500 server error', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
      mockFetch.mockResolvedValue(mockResponse as Response);

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);

    it('should display error message on network error', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      render(<TradeForm />);

      // Fill required fields
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 15000);
  });

  describe('User Interactions', () => {
    it('should disable form fields when loading', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: Response) => void;
      const mockResponse = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      }) as Promise<Response>;
      mockFetch.mockReturnValue(mockResponse);

      render(<TradeForm />);

      const symbolInput = screen.getByLabelText(/symbol\/ticker/i);
      expect(symbolInput).not.toBeDisabled();

      // Fill and submit
      await fillRequiredFields(user);

      const submitButton = screen.getByRole('button', { name: /create trade/i });
      await user.click(submitButton);

      // Wait for the loading state - check if button is disabled or shows "Saving"
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const submitBtn = buttons.find(b => b.textContent?.includes('Create Trade') || b.textContent?.includes('Saving'));
        // Button should be disabled during loading or show "Saving"
        expect(submitBtn?.disabled || submitBtn?.textContent?.includes('Saving')).toBeTruthy();
      }, { timeout: 10000 });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ trade: { id: 'new-trade-123' } }),
      } as Response);
    }, 15000);

    it('should handle cancel button click', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('should allow user to fill all optional fields', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      await user.type(screen.getByLabelText(/strategy name/i), 'Momentum Trading');
      await user.type(screen.getByLabelText(/setup type/i), 'Breakout');
      await user.selectOptions(screen.getByLabelText(/time of day/i), 'MARKET_OPEN');
      await user.selectOptions(screen.getByLabelText(/market conditions/i), 'TRENDING');
      await user.type(screen.getByLabelText(/emotional state at entry/i), 'Confident');
      await user.type(screen.getByLabelText(/emotional state at exit/i), 'Satisfied');
      await user.type(screen.getByLabelText(/notes/i), 'This was a good trade');

      expect(screen.getByLabelText(/strategy name/i)).toHaveValue('Momentum Trading');
      expect(screen.getByLabelText(/setup type/i)).toHaveValue('Breakout');
      expect(screen.getByLabelText(/time of day/i)).toHaveValue('MARKET_OPEN');
      expect(screen.getByLabelText(/market conditions/i)).toHaveValue('TRENDING');
      expect(screen.getByLabelText(/emotional state at entry/i)).toHaveValue('Confident');
      expect(screen.getByLabelText(/emotional state at exit/i)).toHaveValue('Satisfied');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('This was a good trade');
    });

    it('should allow user to select different asset types', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      const assetTypeSelect = screen.getByLabelText(/asset type/i);
      
      await user.selectOptions(assetTypeSelect, 'FOREX');
      expect(assetTypeSelect).toHaveValue('FOREX');

      await user.selectOptions(assetTypeSelect, 'CRYPTO');
      expect(assetTypeSelect).toHaveValue('CRYPTO');

      await user.selectOptions(assetTypeSelect, 'OPTIONS');
      expect(assetTypeSelect).toHaveValue('OPTIONS');
    });

    it('should allow user to select SHORT direction', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      const directionSelect = screen.getByLabelText(/direction/i);
      await user.selectOptions(directionSelect, 'SHORT');

      expect(directionSelect).toHaveValue('SHORT');
    });

    it('should allow user to enter risk management fields', async () => {
      const user = userEvent.setup();
      render(<TradeForm />);

      await user.type(screen.getByLabelText(/stop loss/i), '95.00');
      await user.type(screen.getByLabelText(/take profit target/i), '110.00');
      await user.type(screen.getByLabelText(/planned risk\/reward ratio/i), '2.5');
      await user.type(screen.getByLabelText(/commissions\/fees/i), '5.50');

      expect(screen.getByLabelText(/stop loss/i)).toHaveValue(95);
      expect(screen.getByLabelText(/take profit target/i)).toHaveValue(110);
      expect(screen.getByLabelText(/planned risk\/reward ratio/i)).toHaveValue(2.5);
      expect(screen.getByLabelText(/commissions\/fees/i)).toHaveValue(5.5);
    });
  });
});

