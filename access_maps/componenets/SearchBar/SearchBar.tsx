'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';

type SearchBarProps = {
  onLocationSelect: (coordinates: { lng: number; lat: number }) => void;
};

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // Debounce the search to avoid too many API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    onLocationSelect({ lng, lat });
    setSearchText(suggestion.place_name);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchContainer} onClick={(e) => e.stopPropagation()}>      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search location..."
          className={styles.searchInput}
        />
        {searchText && (
          <button
            className={styles.clearButton}
            onClick={() => {
              setSearchText('');
              setSuggestions([]);
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {isLoading && <div className={styles.loader}>Searching...</div>}
      </div>
      {suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={styles.suggestionItem}
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
