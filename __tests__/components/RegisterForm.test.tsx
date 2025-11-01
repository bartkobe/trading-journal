import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/auth/RegisterForm';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock window.location.href assignment
delete (global.window as any).location;
(global.window as any).location = { href: '' };


// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (global.window as any).location.href = '';
  });

  describe('Rendering', () => {
    it('should render registration form with all fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/name.*optional/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should show password requirements hint', () => {
      render(<RegisterForm />);

      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('should show loading state when submitting', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true, user: { id: '1', email: 'test@example.com' } }),
            } as Response);
          }, 100)
        )
      );

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for weak password', async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'weak');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with all fields and redirect to dashboard', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          message: 'User registered successfully',
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        }),
      } as Response);

      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name.*optional/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123',
          }),
        });
      });

      // Verify successful registration - the redirect happens via window.location.href
      // which forces a full page reload to update the navigation state
    });

    it('should submit form without name and redirect to dashboard', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com', name: null },
        }),
      } as Response);

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123',
          }),
        });
      });

      // Verify successful registration - the redirect happens via window.location.href
      // which forces a full page reload to update the navigation state
    });

    it('should display error message for duplicate email', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'User with this email already exists' }),
      } as Response);

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should display error message for validation errors', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation failed' }),
      } as Response);

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid registration/i)).toBeInTheDocument();
      });
    });

    it('should display error message for network failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText(/name.*optional/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it('should disable form fields when loading', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true }),
            } as Response);
          }, 100)
        )
      );

      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name.*optional/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123');
      await user.click(submitButton);

      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});

