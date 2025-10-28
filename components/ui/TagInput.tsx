'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface Tag {
  id: string;
  name: string;
  _count?: {
    trades: number;
  };
}

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  label,
  placeholder = 'Add tags...',
  error,
  disabled = false,
  maxTags = 20,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch tag suggestions as user types
  useEffect(() => {
    if (inputValue.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`/api/tags?search=${encodeURIComponent(inputValue)}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out already selected tags
          const filtered = data.tags.filter((tag: Tag) => !value.includes(tag.name));
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue, value]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (value.length >= maxTags) return;

    const newTags = [...value, trimmed];
    onChange?.(newTags);
    setInputValue('');
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

      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].name);
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
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}

      {/* Tag Display Area */}
      <div
        className={`min-h-[42px] w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 ${
          error
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Selected Tags */}
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              )}
            </span>
          ))}

          {/* Input Field */}
          {!disabled && value.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue && setShowSuggestions(true)}
              placeholder={value.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] outline-none bg-transparent"
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => addTag(suggestion.name)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <span>{suggestion.name}</span>
              {suggestion._count && suggestion._count.trades > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion._count.trades} {suggestion._count.trades === 1 ? 'trade' : 'trades'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to add a tag. Use letters, numbers, hyphens, and underscores only.
        </p>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Max Tags Warning */}
      {value.length >= maxTags && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  );
}

