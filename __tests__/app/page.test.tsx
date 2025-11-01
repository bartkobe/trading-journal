import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock components
jest.mock('@/components/auth/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

jest.mock('@/components/auth/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">Register Form</div>,
}));

jest.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('HomePage', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('should show minimal loading state initially while checking authentication', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<HomePage />);

    // Should show theme toggle but no main content during loading
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.queryByText('Trading Journal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  it('should redirect to dashboard if user is authenticated', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: '1', email: 'test@example.com' } }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show login form if user is not authenticated', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    render(<HomePage />);

    // Wait for loading to finish and login form to appear
    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should show login form on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  it('should show login form by default', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });

  it('should render theme toggle', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });
});

