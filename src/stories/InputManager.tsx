'use client';

import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

interface InputOption {
  label: string;
  value: string;
}

interface InputItem {
  name: string;
  label: string;
  type: 'text' | 'search' | 'checkbox' | 'select';
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  options?: InputOption[];
}

interface InputManagerProps {
  inputs: InputItem[];
}

export const InputManager: React.FC<InputManagerProps> = ({ inputs }) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocusedField(null);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, input: InputItem) => {
    const val = input.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    input.onChange(input.name, val);
    setHighlightedIndex(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, input: InputItem) => {
    if (!input.options) return;

    const filtered = input.options.filter(o =>
      o.label.toLowerCase().includes(input.value.toLowerCase())
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => (i < filtered.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i > 0 ? i - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const sel = filtered[highlightedIndex];
      if (sel) {
        input.onChange(input.name, sel.value);
        setFocusedField(null);
        setHighlightedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setFocusedField(null);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6 font-sans">
      {inputs.map(input => {
        const isFocused = focusedField === input.name;
        const filteredOptions = input.type === 'search' && input.options
          ? input.options.filter(o => o.label.toLowerCase().includes(input.value.toLowerCase()))
          : [];

        return (
          <div key={input.name} className="relative">
            <label htmlFor={input.name} className="block mb-1 font-semibold text-gray-900">
              {input.label}
            </label>

            {(input.type === 'text' || input.type === 'search') && (
              <>
                <input
                  id={input.name}
                  type={input.type}
                  value={input.value}
                  onChange={e => onInputChange(e, input)}
                  onFocus={() => setFocusedField(input.name)}
                  onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                  onKeyDown={e => input.type === 'search' && onKeyDown(e, input)}
                  placeholder={`Enter ${input.label.toLowerCase()}`}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-900"
                />
                {isFocused && filteredOptions.length > 0 && (
                  <ul className="absolute z-20 w-full max-h-48 overflow-auto border border-gray-300 rounded bg-white mt-1 shadow">
                    {filteredOptions.map((opt, idx) => (
                      <li
                        key={opt.value}
                        onMouseDown={e => {
                          e.preventDefault();
                          input.onChange(input.name, opt.value);
                          setFocusedField(null);
                          setHighlightedIndex(-1);
                        }}
                        className={`px-3 py-2 cursor-pointer ${
                          idx === highlightedIndex
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-100 text-gray-900'
                        }`}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {input.type === 'checkbox' && (
              <label className="inline-flex items-center cursor-pointer text-gray-900">
                <input
                  type="checkbox"
                  checked={input.value}
                  onChange={e => onInputChange(e, input)}
                  className="mr-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                />
                {input.label}
              </label>
            )}

            {input.type === 'select' && input.options && (
              <select
                id={input.name}
                value={input.value}
                onChange={e => onInputChange(e, input)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
              >
                {input.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {input.error && <p className="text-red-600 mt-1">{input.error}</p>}
          </div>
        );
      })}
    </div>
  );
};
