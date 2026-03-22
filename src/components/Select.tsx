import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: readonly SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  filterable?: boolean;
  filterPlaceholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  className = "",
  disabled = false,
  filterable = false,
  filterPlaceholder = "Filtrar opções...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [filterQuery, setFilterQuery] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"below" | "above">(
    "below",
  );
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isInTable, setIsInTable] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      setFilterQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && filterable) {
      const id = window.requestAnimationFrame(() => {
        filterInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [isOpen, filterable]);

  const selectedOption = options.find((option) => option.value === selectedValue);

  const q = filterQuery.trim().toLowerCase();
  const visibleOptions =
    filterable && q.length > 0
      ? options.filter(
          (o) =>
            o.value === "" ||
            o.label.toLowerCase().includes(q) ||
            o.value.toLowerCase().includes(q),
        )
      : options;

  // Detecta se está dentro de uma tabela e ajusta posicionamento
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Detecta se está dentro de uma tabela
      const tableElement = selectRef.current.closest('table');
      setIsInTable(!!tableElement);
      
      if (tableElement) {
        // Para tabelas, usa posicionamento absoluto com portal
        // const _scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        // const _scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setDropdownStyle({
          position: 'fixed',
          top: dropdownPosition === 'above' ? rect.top - 200 : rect.bottom,
          left: rect.left,
          width: rect.width,
          zIndex: 1000000,
          pointerEvents: 'auto'
        });
      }
      
      // Se há mais espaço acima e o dropdown é maior que o espaço abaixo
      if (spaceAbove > spaceBelow && spaceBelow < 200) {
        setDropdownPosition('above');
      } else {
        setDropdownPosition('below');
      }
    }
  }, [isOpen, dropdownPosition]);

  // Fecha o dropdown quando clica fora e atualiza posição
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (isOpen && selectRef.current && isInTable) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: dropdownPosition === 'above' ? rect.top - 200 : rect.bottom,
          left: rect.left,
          width: rect.width,
          zIndex: 1000000,
          pointerEvents: 'auto'
        });
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, isInTable, dropdownPosition]);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-500 mb-2">
          {label}
        </label>
      )}
      
      {/* Select Field */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm transition-colors duration-200 flex flex-row gap-2 items-center justify-between ${
            disabled 
              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
              : selectedOption 
                ? 'bg-white border-[#2b9af3] hover:border-[#1e7ce6] cursor-pointer' 
                : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
          }`}
        >
          <span className={`block truncate ${
            disabled 
              ? 'text-gray-400' 
              : selectedOption 
                ? 'text-gray-900' 
                : 'text-gray-500'
          }`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          {/* Chevron Icon */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon 
              name="chevron-down" 
              size="md" 
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                disabled ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
          </span>
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <>
            {isInTable ? (
              createPortal(
                <div
                  style={{
                    ...dropdownStyle,
                    pointerEvents: "auto",
                    zIndex: 1000000,
                  }}
                  className="flex max-h-60 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {filterable ? (
                    <div className="shrink-0 border-b border-gray-200 bg-white p-2">
                      <input
                        ref={filterInputRef}
                        type="search"
                        autoComplete="off"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder={filterPlaceholder}
                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2b9af3] focus:outline-none focus:ring-2 focus:ring-[#2b9af3]/30"
                      />
                    </div>
                  ) : null}
                  <div className="min-h-0 flex-1 overflow-auto">
                    {visibleOptions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">
                        Nenhuma opção encontrada
                      </p>
                    ) : (
                      visibleOptions.map((option) => (
                        <button
                          key={option.value === "" ? "__all" : option.value}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelect(option.value);
                          }}
                          className={`flex w-full cursor-pointer flex-row items-center gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50 ${
                            selectedValue === option.value
                              ? "bg-[#2b9af3]/10 text-[#2b9af3]"
                              : "text-gray-900"
                          }`}
                          style={{ pointerEvents: "auto", zIndex: 1000000 }}
                        >
                          {option.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>,
                document.body,
              )
            ) : (
              <div
                className={`absolute flex w-full max-h-60 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${
                  dropdownPosition === "above" ? "bottom-full mb-1" : "top-full mt-1"
                }`}
                style={{ zIndex: 1000000, pointerEvents: "auto" }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {filterable ? (
                  <div className="shrink-0 border-b border-gray-200 bg-white p-2">
                    <input
                      ref={filterInputRef}
                      type="search"
                      autoComplete="off"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      placeholder={filterPlaceholder}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2b9af3] focus:outline-none focus:ring-2 focus:ring-[#2b9af3]/30"
                    />
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 overflow-auto">
                  {visibleOptions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      Nenhuma opção encontrada
                    </p>
                  ) : (
                    visibleOptions.map((option) => (
                      <button
                        key={option.value === "" ? "__all" : option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(option.value);
                        }}
                        className={`flex w-full cursor-pointer flex-row items-center gap-2 px-4 py-3 text-left transition-colors duration-200 hover:bg-gray-50 ${
                          selectedValue === option.value
                            ? "bg-[#2b9af3]/10 text-[#2b9af3]"
                            : "text-gray-900"
                        }`}
                        style={{ pointerEvents: "auto", zIndex: 1000000 }}
                      >
                        {option.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Select;
