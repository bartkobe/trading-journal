'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';

interface Screenshot {
  id?: string;
  url: string;
  filename: string;
  fileSize?: number;
  preview?: string; // Local preview URL
  file?: File; // For new uploads
}

interface ScreenshotUploadProps {
  tradeId?: string;
  existingScreenshots?: Screenshot[];
  onUploadComplete?: (screenshot: Screenshot) => void;
  onDeleteSuccess?: (screenshotId: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ScreenshotUpload({
  tradeId,
  existingScreenshots = [],
  onUploadComplete,
  onDeleteSuccess,
  disabled = false,
  maxFiles = 10,
  maxSizeMB = 10,
}: ScreenshotUploadProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>(existingScreenshots);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`;
    }

    if (file.size > maxSizeBytes) {
      return `${file.name}: File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  // Handle file selection
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');

    // Check max files
    if (screenshots.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} screenshots allowed`);
      return;
    }

    const filesArray = Array.from(files);

    // Validate all files
    for (const file of filesArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // If tradeId is provided, upload immediately
    if (tradeId) {
      await uploadFiles(filesArray);
    } else {
      // Otherwise, just show previews (for new trade form)
      const newScreenshots: Screenshot[] = filesArray.map((file) => ({
        url: URL.createObjectURL(file),
        filename: file.name,
        fileSize: file.size,
        preview: URL.createObjectURL(file),
        file,
      }));

      setScreenshots([...screenshots, ...newScreenshots]);
    }
  };

  // Upload files to server
  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/trades/${tradeId}/screenshots`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        const newScreenshot: Screenshot = data.screenshot;

        setScreenshots((prev) => [...prev, newScreenshot]);

        if (onUploadComplete) {
          onUploadComplete(newScreenshot);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload screenshot');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Delete screenshot
  const deleteScreenshot = async (screenshot: Screenshot, index: number) => {
    if (!screenshot.id) {
      // Just remove from preview (not uploaded yet)
      setScreenshots((prev) => prev.filter((_, i) => i !== index));
      if (screenshot.preview) {
        URL.revokeObjectURL(screenshot.preview);
      }
      return;
    }

    try {
      // TODO: Implement delete endpoint
      // For now, just remove from UI
      setScreenshots((prev) => prev.filter((_, i) => i !== index));

      if (onDeleteSuccess) {
        onDeleteSuccess(screenshot.id);
      }
    } catch (err) {
      setError('Failed to delete screenshot');
      console.error('Delete error:', err);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.target.files);
  };

  const openFilePicker = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleChange}
          className="hidden"
          disabled={disabled || screenshots.length >= maxFiles}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {uploading ? (
              <p className="font-medium">Uploading...</p>
            ) : (
              <>
                <p className="font-medium">
                  {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs mt-1">
                  JPEG, PNG, GIF, WebP up to {maxSizeMB}MB (max {maxFiles} files)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Screenshot Previews */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {screenshots.map((screenshot, index) => (
            <div
              key={screenshot.id || screenshot.preview || index}
              className="relative group aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
            >
              <Image
                src={screenshot.preview || screenshot.url}
                alt={screenshot.filename}
                fill
                className="object-cover"
              />

              {/* Overlay with filename and delete button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col justify-between p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScreenshot(screenshot, index);
                  }}
                  className="self-end opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-opacity"
                  aria-label="Delete screenshot"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{screenshot.filename}</p>
                  {screenshot.fileSize && (
                    <p className="text-white text-xs">{formatFileSize(screenshot.fileSize)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot count */}
      {screenshots.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {screenshots.length} / {maxFiles} screenshot{screenshots.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

