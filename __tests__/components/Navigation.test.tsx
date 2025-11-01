import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/ui/Navigation';
import { usePathname } from 'next/navigation';

// Mock next/navigation
const mockPathname = '/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => mockPathname),
}));

// Mock ThemeToggle
jest.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

describe('Navigation', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render navigation with logo and brand', () => {
      render(<Navigation />);
      expect(screen.getByText('Trading Journal')).toBeInTheDocument();
      expect(screen.getByText('Track. Analyze. Improve.')).toBeInTheDocument();
      expect(screen.getByLabelText('Trading Journal home')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<Navigation />);
      const dashboardLinks = screen.getAllByText('Dashboard');
      const tradesLinks = screen.getAllByText('Trades');
      const newTradeLinks = screen.getAllByText('New Trade');
      
      expect(dashboardLinks.length).toBeGreaterThan(0);
      expect(tradesLinks.length).toBeGreaterThan(0);
      expect(newTradeLinks.length).toBeGreaterThan(0);
    });

    it('should render theme toggle', () => {
      render(<Navigation />);
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render user info when user is provided', () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      render(<Navigation user={user} />);
      const nameElements = screen.getAllByText('John Doe');
      const emailElements = screen.getAllByText('john@example.com');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(emailElements.length).toBeGreaterThan(0);
    });

    it('should render default name when user name is null', () => {
      const user = {
        name: null,
        email: 'user@example.com',
      };
      render(<Navigation user={user} />);
      const traderElements = screen.getAllByText('Trader');
      const emailElements = screen.getAllByText('user@example.com');
      expect(traderElements.length).toBeGreaterThan(0);
      expect(emailElements.length).toBeGreaterThan(0);
    });

    it('should render logout button when user is provided', () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      render(<Navigation user={user} />);
      expect(screen.getByLabelText('Log out of Trading Journal')).toBeInTheDocument();
    });

    it('should not render user menu when user is null', () => {
      render(<Navigation user={null} />);
      expect(screen.queryByText('Trader')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Log out of Trading Journal')).not.toBeInTheDocument();
    });
  });

  describe('Active Link Highlighting', () => {
    it('should highlight Dashboard link when pathname is /dashboard', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<Navigation />);
      const dashboardLinks = screen.getAllByText('Dashboard');
      const dashboardLink = dashboardLinks[0].closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Trades link when pathname starts with /trades', () => {
      mockUsePathname.mockReturnValue('/trades');
      render(<Navigation />);
      const tradesLinks = screen.getAllByText('Trades');
      const tradesLink = tradesLinks[0].closest('a');
      expect(tradesLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight Trades link when pathname is /trades/123', () => {
      mockUsePathname.mockReturnValue('/trades/123');
      render(<Navigation />);
      const tradesLinks = screen.getAllByText('Trades');
      const tradesLink = tradesLinks[0].closest('a');
      expect(tradesLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not highlight links when pathname does not match', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navigation />);
      const dashboardLinks = screen.getAllByText('Dashboard');
      const tradesLinks = screen.getAllByText('Trades');
      const dashboardLink = dashboardLinks[0].closest('a');
      const tradesLink = tradesLinks[0].closest('a');
      expect(dashboardLink).not.toHaveAttribute('aria-current');
      expect(tradesLink).not.toHaveAttribute('aria-current');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Navigation />);
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Trading Journal home')).toBeInTheDocument();
      expect(screen.getByLabelText('Create new trade')).toBeInTheDocument();
    });

    it('should have proper navigation landmarks', () => {
      render(<Navigation />);
      const nav = screen.getByLabelText('Main navigation');
      expect(nav.tagName).toBe('NAV');
      
      const primaryNav = screen.getByLabelText('Primary');
      expect(primaryNav).toHaveAttribute('role', 'navigation');
    });

    it('should have aria-current on active links', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<Navigation />);
      const dashboardLinks = screen.getAllByText('Dashboard');
      const dashboardLink = dashboardLinks[0].closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Links', () => {
    it('should have correct href for Dashboard link', () => {
      render(<Navigation />);
      const dashboardLinks = screen.getAllByText('Dashboard');
      const dashboardLink = dashboardLinks[0].closest('a');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('should have correct href for Trades link', () => {
      render(<Navigation />);
      const tradesLinks = screen.getAllByText('Trades');
      const tradesLink = tradesLinks[0].closest('a');
      expect(tradesLink).toHaveAttribute('href', '/trades');
    });

    it('should have correct href for New Trade link', () => {
      render(<Navigation />);
      const newTradeLinks = screen.getAllByText('New Trade');
      expect(newTradeLinks.length).toBeGreaterThan(0);
      // Check the first one (desktop version)
      const newTradeLink = newTradeLinks[0].closest('a');
      expect(newTradeLink).toHaveAttribute('href', '/trades/new');
    });

    it('should have correct href for logo link', () => {
      render(<Navigation />);
      const logoLink = screen.getByLabelText('Trading Journal home');
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Mobile Menu', () => {
    it('should render mobile menu button', () => {
      render(<Navigation />);
      expect(screen.getByLabelText('Open mobile menu')).toBeInTheDocument();
    });

    it('should have mobile navigation section', () => {
      render(<Navigation />);
      const mobileNav = screen.getByLabelText('Mobile navigation');
      expect(mobileNav).toBeInTheDocument();
    });
  });
});

