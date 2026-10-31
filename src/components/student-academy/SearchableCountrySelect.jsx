import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe2, X } from 'lucide-react';
import { TARGET_COUNTRY_OPTIONS } from '../../data/mockData';

export const SearchableCountrySelect = ({
  value = '',
  onChange,
  countries = TARGET_COUNTRY_OPTIONS,
  placeholder = 'Select Target Country...',
  error = null,
  id = 'target-country-select',
  name = 'preferredLocation',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Find currently selected country object
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    const cleanVal = value.trim().toLowerCase();
    return countries.find(
      c => c.name.toLowerCase() === cleanVal || 
           c.code.toLowerCase() === cleanVal ||
           cleanVal.includes(c.name.toLowerCase()) ||
           cleanVal.includes(c.code.toLowerCase())
    ) || { name: value, flag: '🌐', code: '' };
  }, [value, countries]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.region && c.region.toLowerCase().includes(q))
    );
  }, [searchQuery, countries]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredCountries.length) {
        handleSelect(filteredCountries[focusedIndex]);
      }
    }
  };

  const handleSelect = (country) => {
    if (onChange) {
      onChange(country.name);
    }
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Hidden Native Select for DOM Form Sync & Automated Testing */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {countries.map(c => (
          <option key={c.code || c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Trigger Button */}
      <button
        type="button"
        id={`${id}-trigger`}
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
          isOpen
            ? 'border-gold-500 ring-2 ring-gold-500/20 bg-white dark:bg-navy-900'
            : error
            ? 'border-rose-500 bg-rose-500/5'
            : 'border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 hover:border-gold-500/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Globe2 className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          {selectedCountry ? (
            <span className="flex items-center gap-2 text-navy-900 dark:text-white font-bold truncate">
              <span className="text-sm shrink-0" role="img" aria-label={selectedCountry.name}>
                {selectedCountry.flag || '🌐'}
              </span>
              <span className="truncate">{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-slate-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-gold-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-navy-800 bg-slate-50/80 dark:bg-navy-950/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or jurisdiction..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-navy-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-gold-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, idx) => {
                const isSelected = selectedCountry?.name === country.name;
                const isFocused = idx === focusedIndex;

                return (
                  <button
                    key={country.code || country.name}
                    type="button"
                    onClick={() => handleSelect(country)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition font-medium ${
                      isSelected
                        ? 'bg-gold-500/15 text-gold-700 dark:text-gold-400 font-bold'
                        : isFocused
                        ? 'bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800/60'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-sm shrink-0" role="img" aria-label={country.name}>
                        {country.flag || '🌐'}
                      </span>
                      <span className="truncate">{country.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {country.region && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-400 font-normal">
                          {country.region}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-gold-500" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching country options found.
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export {
  INTERNATIONAL_OR_GCC_CATEGORIES,
  isInternationalOrGccExam,
  resolveDefaultExamCountry
} from '../../data/targetCountryUtils';

export default SearchableCountrySelect;
