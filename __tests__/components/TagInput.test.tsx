import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '@/components/ui/TagInput';

// Mock fetch
global.fetch = jest.fn();

describe('TagInput', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<TagInput onChange={mockOnChange} />);
      expect(screen.getByLabelText('Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument();
    });

    it('should render with custom label and placeholder', () => {
      render(
        <TagInput
          label="Custom Tags"
          placeholder="Enter tags..."
          onChange={mockOnChange}
        />
      );
      expect(screen.getByLabelText('Custom Tags')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter tags...')).toBeInTheDocument();
    });

    it('should render existing tags', () => {
      render(<TagInput value={['tag1', 'tag2']} onChange={mockOnChange} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });

    it('should display tag count when maxTags is set', () => {
      render(<TagInput value={['tag1']} maxTags={10} onChange={mockOnChange} />);
      expect(screen.getByText('(1/10)')).toBeInTheDocument();
    });

    it('should hide input when maxTags is reached', () => {
      const tags = Array(5).fill(0).map((_, i) => `tag${i}`);
      render(<TagInput value={tags} maxTags={5} onChange={mockOnChange} />);
      expect(screen.queryByPlaceholderText('Add tags...')).not.toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      render(<TagInput error="Invalid tag" onChange={mockOnChange} />);
      expect(screen.getByText('Invalid tag')).toBeInTheDocument();
    });

    it('should disable input when disabled prop is true', () => {
      render(<TagInput disabled={true} onChange={mockOnChange} />);
      const input = screen.getByPlaceholderText('Add tags...');
      expect(input).toBeDisabled();
    });
  });

  describe('Adding Tags', () => {
    it('should add tag when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'newtag');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
    });

    it('should trim and lowercase tag when added', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, '  NewTag  ');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
    });

    it('should not add duplicate tags', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['existing']} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('');
      await user.type(input, 'existing');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add tag with invalid characters', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'tag with spaces');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should not add tag when maxTags is reached', async () => {
      const user = userEvent.setup();
      const tags = Array(5).fill(0).map((_, i) => `tag${i}`);
      render(<TagInput value={tags} maxTags={5} onChange={mockOnChange} />);

      // Input should not be visible when maxTags is reached
      expect(screen.queryByPlaceholderText('Add tags...')).not.toBeInTheDocument();
    });

    it('should not add empty tag', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.keyboard('{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Removing Tags', () => {
    it('should remove tag when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['tag1', 'tag2']} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith(['tag2']);
    });

    it('should remove last tag when Backspace is pressed on empty input', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['tag1', 'tag2']} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('');
      input.focus();
      await user.keyboard('{Backspace}');

      expect(mockOnChange).toHaveBeenCalledWith(['tag1']);
    });
  });

  describe('Autocomplete Suggestions', () => {
    it('should fetch suggestions when typing 2+ characters', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'suggestion1' }, { name: 'suggestion2' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'su');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 1000 });

      expect(mockFetch).toHaveBeenCalledWith('/api/tags?search=su');
    });

    it('should not fetch suggestions for less than 2 characters', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 's');

      await waitFor(() => {
        // Wait a bit to ensure no fetch is called
      }, { timeout: 500 });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should display suggestions when available', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }, { name: 'reversal' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should filter out already selected tags from suggestions', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }, { name: 'reversal' }] }),
      } as Response);

      render(<TagInput value={['momentum']} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.queryByText('momentum')).not.toBeInTheDocument();
        expect(screen.getByText('reversal')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should add tag from suggestion when clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });

      const suggestionButton = screen.getByText('momentum');
      await user.click(suggestionButton);

      expect(mockOnChange).toHaveBeenCalledWith(['momentum']);
    });

    it('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }, { name: 'reversal' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['reversal']);
    });

    it('should close suggestions when Escape is pressed', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('momentum')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should add tag from input when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'newtag');
      await user.keyboard('{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['newtag']);
    });

    it('should handle ArrowUp and ArrowDown for suggestion navigation', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }, { name: 'reversal' }] }),
      } as Response);

      render(<TagInput onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Arrow down should move selection
      await user.keyboard('{ArrowDown}');
      // Should not close suggestions
      expect(screen.getByText('momentum')).toBeInTheDocument();
    });
  });

  describe('Click Outside Handling', () => {
    it('should close suggestions when clicking outside', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ tags: [{ name: 'momentum' }] }),
      } as Response);

      render(
        <div>
          <TagInput onChange={mockOnChange} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const input = screen.getByPlaceholderText('Add tags...');
      await user.type(input, 'mo');

      await waitFor(() => {
        expect(screen.getByText('momentum')).toBeInTheDocument();
      }, { timeout: 1000 });

      const outsideElement = screen.getByTestId('outside');
      await user.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText('momentum')).not.toBeInTheDocument();
      });
    });
  });
});

