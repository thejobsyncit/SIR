import React, { useState, useEffect, useMemo } from 'react';
import { SUPPORTED_COUNTRY_CODES, validatePhoneNumber, cleanDigits, detectUserCountry } from '../../utils/phoneValidation';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

export const CountryPhoneInput = ({
  value = '',
  onChange,
  onValidationChange,
  required = true,
  disabled = false,
  label = 'Phone / WhatsApp Number',
  placeholder = 'Enter phone number',
  defaultCountryCode = null,
  className = ''
}) => {
  // Determine initial dial code: parsed from value, or defaultCountryCode, or detected from user location
  const initialDialCode = useMemo(() => {
    if (value) {
      const match = SUPPORTED_COUNTRY_CODES.find(c => value.startsWith(c.dialCode));
      if (match) return match.dialCode;
    }
    return defaultCountryCode || detectUserCountry();
  }, []);

  const [selectedDialCode, setSelectedDialCode] = useState(initialDialCode);
  const [nationalNumber, setNationalNumber] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [validationResult, setValidationResult] = useState({ isValid: false, error: null });

  // Find active country metadata
  const activeCountry = useMemo(() => {
    return SUPPORTED_COUNTRY_CODES.find(c => c.dialCode === selectedDialCode) || SUPPORTED_COUNTRY_CODES[0];
  }, [selectedDialCode]);

  // Maximum digits allowed for active country (e.g. 10 for India, 9 for UAE)
  const maxDigits = activeCountry.digitsLength || 10;

  // Sync initial incoming value if passed
  useEffect(() => {
    if (value) {
      // If value is a mock/dummy placeholder number, do not prefill it
      if (value.includes('123 4567') || value.includes('1234567') || value.includes('9876543210')) {
        setNationalNumber('');
        return;
      }
      const match = SUPPORTED_COUNTRY_CODES.find(c => value.startsWith(c.dialCode));
      if (match) {
        setSelectedDialCode(match.dialCode);
        const rest = cleanDigits(value.slice(match.dialCode.length)).slice(0, match.digitsLength || 10);
        setNationalNumber(rest);
      } else {
        const cleaned = cleanDigits(value).slice(0, maxDigits);
        setNationalNumber(cleaned);
      }
    } else {
      setNationalNumber('');
    }
  }, [value]);

  // Run validation whenever selectedDialCode or nationalNumber changes
  useEffect(() => {
    const res = validatePhoneNumber(nationalNumber, selectedDialCode);
    setValidationResult(res);
    if (onValidationChange) {
      onValidationChange(res);
    }
  }, [selectedDialCode, nationalNumber]);

  // Handle number keystroke change with strict digit count capping
  const handleNumberChange = (e) => {
    const raw = e.target.value;
    let digits = cleanDigits(raw);

    // If UAE (+971) and candidate types leading domestic '0' (e.g. 050...), strip it to 9 digits
    if (activeCountry.code === 'AE' && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // Strictly enforce max digits limit (cannot exceed country limit, e.g. 10 numbers)
    if (digits.length > maxDigits) {
      digits = digits.slice(0, maxDigits);
    }

    setNationalNumber(digits);
    setIsTouched(true);

    if (onChange) {
      onChange(digits ? `${selectedDialCode} ${digits}` : '');
    }
  };

  // Block non-digit keys and block typing beyond maxDigits
  const handleKeyDown = (e) => {
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
      'Home', 'End'
    ];
    
    if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Strictly block non-numeric characters
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // If input already reached max length and no text is selected, block further digits
    const input = e.target;
    const hasSelection = input.selectionStart !== input.selectionEnd;
    if (!hasSelection && input.value.length >= maxDigits) {
      e.preventDefault();
    }
  };

  // Handle country dropdown change with automatic length adjustment
  const handleCountryChange = (e) => {
    const newDialCode = e.target.value;
    setSelectedDialCode(newDialCode);
    setIsTouched(true);

    const newCountry = SUPPORTED_COUNTRY_CODES.find(c => c.dialCode === newDialCode) || SUPPORTED_COUNTRY_CODES[0];
    const newMaxDigits = newCountry.digitsLength || 10;
    
    // Auto-trim existing number to fit newly selected country
    let adjustedNumber = nationalNumber.slice(0, newMaxDigits);
    if (newCountry.code === 'AE' && adjustedNumber.startsWith('0')) {
      adjustedNumber = adjustedNumber.slice(1);
    }
    setNationalNumber(adjustedNumber);

    if (onChange) {
      onChange(adjustedNumber ? `${newDialCode} ${adjustedNumber}` : '');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition shadow-sm">
        {/* Country Selector with Clean Badge & Native Select */}
        <div className="relative flex items-center bg-slate-50 dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 px-3 shrink-0 hover:bg-slate-100 dark:hover:bg-navy-850 transition">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-[10px] font-mono font-extrabold text-slate-700 dark:text-slate-200 tracking-wider">
              {activeCountry.code}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
              {activeCountry.dialCode}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          <select
            value={selectedDialCode}
            onChange={handleCountryChange}
            disabled={disabled}
            aria-label="Country Dial Code"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          >
            {SUPPORTED_COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.dialCode} className="text-slate-900 bg-white dark:bg-navy-900 dark:text-white">
                {c.country} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        {/* National Number Input (Strictly 0-9 digits only, max digits enforced, clean placeholder) */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={maxDigits}
            value={nationalNumber}
            onChange={handleNumberChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsTouched(true)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full py-2.5 px-3 text-xs sm:text-sm text-slate-900 dark:text-white bg-transparent outline-none font-medium placeholder-slate-400 dark:placeholder-slate-500 tracking-wide font-mono"
          />

          {isTouched && nationalNumber && (
            <div className="pr-3 flex items-center">
              {validationResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation Error Message */}
      {isTouched && !validationResult.isValid && nationalNumber && (
        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
          <span>{validationResult.error}</span>
        </p>
      )}
    </div>
  );
};

export default CountryPhoneInput;
