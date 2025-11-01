import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle, ThemeToggleDropdown, ThemeToggleSwitch } from '@/components/ui/ThemeToggle';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  jest.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue(null);
});

// Mock matchMedia for system theme detection
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('ThemeToggle', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  beforeEach(() => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
  });

  describe('ThemeToggle - Button Component', () => {
    it('should render theme toggle button', async () => {
      renderWithProvider(<ThemeToggle />);
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should display correct icon for light theme', async () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithProvider(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        // Check for sun icon (light theme)
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should cycle through themes: light -> dark -> system', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithProvider(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');

      // Click to go from light -> dark
      await user.click(button);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'dark');

      // Click to go from dark -> system
      await user.click(button);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'system');

      // Click to go from system -> light
      await user.click(button);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'light');
    });

    it('should have proper ARIA label', async () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      renderWithProvider(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toContain('Dark mode');
      });
    });

    it('should have title attribute for tooltip', async () => {
      mockLocalStorage.getItem.mockReturnValue('system');
      renderWithProvider(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('title', 'System theme');
      });
    });

    it('should be keyboard accessible', async () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithProvider(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('ThemeToggleDropdown', () => {
    it('should render dropdown selector', async () => {
      renderWithProvider(<ThemeToggleDropdown />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should have all theme options', async () => {
      renderWithProvider(<ThemeToggleDropdown />);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /dark/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /system/i })).toBeInTheDocument();
      });
    });

    it('should allow selecting theme from dropdown', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithProvider(<ThemeToggleDropdown />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      
      await user.selectOptions(select, 'dark');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'dark');
    });

    it('should have proper ARIA label', async () => {
      renderWithProvider(<ThemeToggleDropdown />);

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toHaveAttribute('aria-label', 'Select theme');
      });
    });

    it('should display current theme as selected', async () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      renderWithProvider(<ThemeToggleDropdown />);

      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('dark');
      });
    });
  });

  describe('ThemeToggleSwitch', () => {
    it('should render switch button', async () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      renderWithProvider(<ThemeToggleSwitch />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should toggle between light and dark', async () => {
      const user = userEvent.setup();
      mockLocalStorage.getItem.mockReturnValue('light');
      
      renderWithProvider(<ThemeToggleSwitch />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');

      // Toggle from light to dark
      await user.click(button);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'dark');

      // Toggle from dark to light
      await user.click(button);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('trading-journal-theme', 'light');
    });

    it('should have proper ARIA label', async () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      renderWithProvider(<ThemeToggleSwitch />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toContain('dark');
      });
    });
  });
});

