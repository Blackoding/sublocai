import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  label, 
  options, 
  value = [], 
  onChange, 
  placeholder = "Selecione uma ou mais opções",
  className = "",
  maxSelections
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const [, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isInTable, setIsInTable] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Atualiza valores selecionados quando prop value muda
  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const selectedOptions = options.filter(option => selectedValues.includes(option.value));

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
          zIndex: 999999
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
          zIndex: 999999
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, isInTable, dropdownPosition]);

  const handleToggle = (optionValue: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(optionValue)) {
      // Remove se já está selecionado
      newValues = selectedValues.filter(val => val !== optionValue);
    } else {
      // Adiciona se não está selecionado e não excedeu o limite
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // Não adiciona se excedeu o limite
      }
      newValues = [...selectedValues, optionValue];
    }
    
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const removeSelection = (valueToRemove: string) => {
    const newValues = selectedValues.filter(val => val !== valueToRemove);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }
    
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    
    return `${selectedValues.length} especialidades selecionadas`;
  };

  const renderDropdown = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        const isDisabled = !isSelected && maxSelections && selectedValues.length >= maxSelections;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            disabled={!!isDisabled}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex flex-row gap-3 items-center ${
              isSelected ? 'bg-[#2b9af3]/10 text-[#2b9af3]' : 'text-gray-900'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Checkbox visual */}
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
              isSelected 
                ? 'bg-[#2b9af3] border-[#2b9af3]' 
                : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            <span className="flex-1">{option.label}</span>
          </button>
        );
      })}
      
      {maxSelections && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
          {selectedValues.length}/{maxSelections} selecionadas
        </div>
      )}
    </div>
  );

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
          {label}
          <label className="block text-xs font-light text-gray-500">
            (Selecione 1 ou mais)
          </label>
        </label>
      )}
      
      {/* Selected items display */}
      {selectedValues.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#2b9af3]/10 text-[#2b9af3] rounded-full text-sm"
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeSelection(option.value)}
                className="hover:bg-[#2b9af3]/20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Select Field */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white border rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#2b9af3] focus:border-[#2b9af3] shadow-sm transition-colors duration-200 cursor-pointer flex flex-row gap-2 items-center justify-between ${
            selectedValues.length > 0
              ? 'border-[#2b9af3] hover:border-[#1e7ce6]' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className={`block truncate ${selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {getDisplayText()}
          </span>
          
          {/* Chevron Icon */}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon 
              name="chevron-down" 
              size="md" 
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <>
            {isInTable ? (
              // Portal para tabelas
              createPortal(
                renderDropdown(),
                document.body
              )
            ) : (
              // Dropdown normal para outros contextos
              <div className={`absolute z-[999999] w-full ${
                dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}>
                {renderDropdown()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
