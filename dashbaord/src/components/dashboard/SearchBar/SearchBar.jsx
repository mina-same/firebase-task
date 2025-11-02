/**
 * SearchBar Component
 * 
 * Search input field for filtering feedback data
 * Includes debouncing for performance
 * 
 * @component
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce } from '../../../utils/helpers';
import { UI_CONFIG } from '../../../config/constants';
import './SearchBar.module.css';

/**
 * Search bar component with debounced search
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Search callback function
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceDelay - Debounce delay in milliseconds
 * @returns {JSX.Element} SearchBar component
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Search feedback by employee name or notes...',
  debounceDelay = UI_CONFIG.DEBOUNCE_DELAY,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  /**
   * Debounced search callback
   * Only triggers after user stops typing for the specified delay
   */
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (onSearch) {
        onSearch(value);
      }
    }, debounceDelay),
    [onSearch, debounceDelay]
  );
  
  /**
   * Handles input change
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  /**
   * Clears the search field
   */
  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };
  
  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-gray-50 transition-all duration-200 text-sm placeholder:text-gray-400"
        aria-label="Search feedback"
      />
      
      {/* Clear Button */}
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// Prop types for type checking
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceDelay: PropTypes.number,
};

export default SearchBar;

