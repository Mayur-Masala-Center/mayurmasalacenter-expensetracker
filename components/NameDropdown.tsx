"use client";
import { useState, useEffect, useRef } from "react";

type NameDropdownProps = {
  names: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
};

export default function NameDropdown({
  names,
  value,
  onChange,
  placeholder = "Select or type...",
  label,
  required,
}: NameDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = names.filter((name) =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNames(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredNames(names.slice(0, 10)); // Show first 10 suggestions
      setIsOpen(names.length > 0);
    }
  }, [value, names]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (value.length === 0) {
      setFilteredNames(names.slice(0, 10));
    }
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium block mb-1">
          {label}
          {required && <span className="text-masala-red ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input w-full"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        {isOpen && filteredNames.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-masala-brown/20 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-slideDown">
            {filteredNames.map((name, index) => (
              <div
                key={index}
                onClick={() => handleSelect(name)}
                className="px-4 py-2.5 cursor-pointer hover:bg-masala-brown/5 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between group"
              >
                <span className="text-sm text-masala-brown group-hover:text-masala-brown transition-colors">
                  {name}
                </span>
                <span className="text-xs text-masala-brown/40 group-hover:text-masala-brown/60">
                  {names.filter((n) => n === name).length > 1 && `${names.filter((n) => n === name).length} entries`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}