'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  label = 'Tags',
  placeholder = 'Add tags...',
  disabled = false,
  error,
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch tag suggestions with debounce
  useEffect(() => {
    if (!inputValue.trim() || inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tags?search=${encodeURIComponent(inputValue)}`);
        if (response.ok) {
          const data = await response.json();
          const tagNames = data.tags
            .map((t: any) => t.name)
            .filter((name: string) => !value.includes(name));
          setSuggestions(tagNames);
          setShowSuggestions(tagNames.length > 0);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();

    // Validate tag
    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) return;
    if (value.length >= maxTags) return;
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedTag)) {
      // Invalid characters
      return;
    }

    const newTags = [...value, trimmedTag];
    onChange?.(newTags);
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter((tag) => tag !== tagToRemove);
    onChange?.(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        addTag(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {maxTags && (
            <span className="text-gray-500 text-xs ml-2">
              ({value.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      {/* Tags Display */}
      <div className="w-full min-h-[42px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}

          {/* Input */}
          {value.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              className="flex-1 min-w-[120px] outline-none bg-transparent disabled:opacity-50 text-sm"
            />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && inputValue.length >= 2 && (
        <div className="absolute right-3 top-10 text-gray-400 text-sm">Loading...</div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Help Text */}
      <p className="mt-1 text-xs text-gray-500">
        Press Enter to add a tag. Only letters, numbers, hyphens, and underscores allowed.
      </p>
    </div>
  );
}

