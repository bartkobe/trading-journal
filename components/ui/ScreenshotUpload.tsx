'use client';

import { useState, useRef, DragEvent } from 'react';

interface Screenshot {
  id?: string;
  url: string;
  filename: string;
  fileSize?: number;
}

interface ScreenshotUploadProps {
  tradeId?: string;
  screenshots?: Screenshot[];
  onUploadSuccess?: (screenshot: Screenshot) => void;
  onDeleteSuccess?: (screenshotId: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function ScreenshotUpload({
  tradeId,
  screenshots = [],
  onUploadSuccess,
  onDeleteSuccess,
  maxFiles = 10,
  maxSizeMB = 10,
  disabled = false,
}: ScreenshotUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.';
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    if (!tradeId) {
      setError('Trade ID is required to upload screenshots');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check max files limit
    if (screenshots.length + uploadingFiles.length >= maxFiles) {
      setError(`Maximum ${maxFiles} screenshots allowed`);
      return;
    }

    try {
      setUploadingFiles((prev) => [...prev, file.name]);
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/trades/${tradeId}/screenshots`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to upload screenshot');
        return;
      }

      // Success
      if (onUploadSuccess) {
        onUploadSuccess(result.screenshot);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An unexpected error occurred during upload');
    } finally {
      setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Upload files sequentially
    for (const file of fileArray) {
      await uploadFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (screenshotId: string) => {
    if (!tradeId) return;

    if (!confirm('Are you sure you want to delete this screenshot?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/trades/${tradeId}/screenshots?screenshotId=${screenshotId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to delete screenshot');
        return;
      }

      // Success
      if (onDeleteSuccess) {
        onDeleteSuccess(screenshotId);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete screenshot');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canUploadMore = screenshots.length + uploadingFiles.length < maxFiles;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && !disabled && tradeId && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Upload screenshots
              </button>
              <span className="pl-1">or drag and drop</span>
            </div>

            <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to {maxSizeMB}MB</p>

            <p className="text-xs text-gray-500">
              {screenshots.length + uploadingFiles.length} / {maxFiles} screenshots
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((filename) => (
            <div
              key={filename}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{filename}</p>
                <p className="text-xs text-gray-500">Uploading...</p>
              </div>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot Grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {screenshots.map((screenshot) => (
            <div
              key={screenshot.id || screenshot.url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Image */}
              <img
                src={screenshot.url}
                alt={screenshot.filename}
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {/* View Full Size */}
                  <a
                    href={screenshot.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="View full size"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </a>

                  {/* Delete */}
                  {!disabled && screenshot.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(screenshot.id!)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Delete screenshot"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-xs text-white truncate">{screenshot.filename}</p>
                {screenshot.fileSize && (
                  <p className="text-xs text-gray-300">{formatFileSize(screenshot.fileSize)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Screenshots Message */}
      {screenshots.length === 0 && uploadingFiles.length === 0 && !tradeId && (
        <p className="text-sm text-gray-500 text-center py-4">
          Save the trade first to upload screenshots
        </p>
      )}
    </div>
  );
}
