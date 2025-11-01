import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScreenshotUpload } from '@/components/ui/ScreenshotUpload';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ScreenshotUpload', () => {
  const mockScreenshots = [
    {
      id: 'screenshot-1',
      url: 'https://example.com/image1.jpg',
      filename: 'chart1.jpg',
      fileSize: 1024000,
    },
    {
      id: 'screenshot-2',
      url: 'https://example.com/image2.png',
      filename: 'setup.png',
      fileSize: 2048000,
    },
  ];

  const defaultProps = {
    tradeId: 'trade-1',
    screenshots: mockScreenshots,
    onUploadSuccess: jest.fn(),
    onDeleteSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ screenshot: { id: 'new-screenshot', filename: 'uploaded.jpg' } }),
    });
  });

  it('should render upload area when tradeId is provided and can upload more', () => {
    render(<ScreenshotUpload {...defaultProps} />);

    expect(screen.getByText('Upload screenshots')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF, WebP up to 10MB')).toBeInTheDocument();
  });

  it('should not render upload area when disabled', () => {
    render(<ScreenshotUpload {...defaultProps} disabled={true} />);

    expect(screen.queryByText('Upload screenshots')).not.toBeInTheDocument();
  });

  it('should not render upload area when no tradeId', () => {
    render(<ScreenshotUpload {...defaultProps} tradeId={undefined} />);

    expect(screen.queryByText('Upload screenshots')).not.toBeInTheDocument();
    expect(screen.getByText('Save the trade first to upload screenshots')).toBeInTheDocument();
  });

  it('should not render upload area when at max files', () => {
    const manyScreenshots = Array.from({ length: 10 }, (_, i) => ({
      id: `screenshot-${i}`,
      url: `https://example.com/image${i}.jpg`,
      filename: `image${i}.jpg`,
      fileSize: 1024000,
    }));

    render(
      <ScreenshotUpload
        {...defaultProps}
        screenshots={manyScreenshots}
        maxFiles={10}
      />
    );

    expect(screen.queryByText('Upload screenshots')).not.toBeInTheDocument();
  });

  it('should display screenshot grid', () => {
    render(<ScreenshotUpload {...defaultProps} />);

    expect(screen.getByText('chart1.jpg')).toBeInTheDocument();
    expect(screen.getByText('setup.png')).toBeInTheDocument();
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
    expect(screen.getByText('2.00 MB')).toBeInTheDocument();
  });

  it('should show file count', () => {
    render(<ScreenshotUpload {...defaultProps} />);

    expect(screen.getByText('2 / 10 screenshots')).toBeInTheDocument();
  });

  it('should handle file input change', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trades/trade-1/screenshots', expect.any(Object));
      expect(onUploadSuccess).toHaveBeenCalledWith({ id: 'new-screenshot', filename: 'uploaded.jpg' });
    });
  });

  it('should validate file type on upload', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    await user.upload(fileInput, invalidFile);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onUploadSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')).toBeInTheDocument();
  });

  it('should validate file size on upload', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const largeFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, largeFile);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onUploadSuccess).not.toHaveBeenCalled();
    expect(screen.getByText('File too large. Maximum size is 10MB.')).toBeInTheDocument();
  });

  it('should show uploading state', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    // Mock fetch to delay response
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      ok: true,
      json: () => Promise.resolve({ screenshot: { id: 'new-screenshot', filename: 'uploaded.jpg' } })
    }), 100)));

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
    expect(screen.getByText('Uploading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });
  });

  it('should handle upload error', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    mockFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Upload failed' }),
    });

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(onUploadSuccess).not.toHaveBeenCalled();
    });
  });

  it('should handle drag and drop', async () => {
    const user = userEvent.setup();
    const onUploadSuccess = jest.fn();

    render(<ScreenshotUpload {...defaultProps} onUploadSuccess={onUploadSuccess} />);

    const dropZone = screen.getByText('Upload screenshots').closest('div');

    // Simulate drag enter
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: {
        files: [],
      },
    });

    expect(dropZone).toHaveClass('border-primary');

    // Simulate drag leave
    fireEvent.dragLeave(dropZone!);

    // Simulate drop
    const file = new File(['test content'], 'dropped.jpg', { type: 'image/jpeg' });
    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trades/trade-1/screenshots', expect.any(Object));
      expect(onUploadSuccess).toHaveBeenCalledWith({ id: 'new-screenshot', filename: 'uploaded.jpg' });
    });
  });

  it('should accept custom props', () => {
    render(<ScreenshotUpload {...defaultProps} maxFiles={5} maxSizeMB={5} disabled={true} />);

    // Component should render without errors with custom props
    expect(screen.getByText('Save the trade first to upload screenshots')).toBeInTheDocument();
  });
});

