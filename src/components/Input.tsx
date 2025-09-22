import React, { useState, useEffect, forwardRef } from 'react';

interface InputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time';
  className?: string;
  disabled?: boolean;
  required?: boolean;
  mask?: 'cpf' | 'phone' | 'currency' | 'cep' | 'cnpj';
  validate?: (value: string) => string | null; // Função de validação que retorna erro ou null
  showValidationError?: boolean; // Se deve mostrar erro de validação em tempo real
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  value, 
  onChange, 
  placeholder = "",
  type = "text",
  className = "",
  disabled = false,
  required = false,
  mask,
  validate,
  showValidationError = false
}, ref) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sincronizar o estado interno com o value prop
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Converte para centavos
    const cents = parseInt(numbers) || 0;
    
    // Formata como moeda brasileira
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(cents / 100);
    
    return formatted;
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara do CPF
    return limitedNumbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara do telefone
    return limitedNumbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    const limitedNumbers = numbers.slice(0, 8);
    
    // Aplica a máscara do CEP
    return limitedNumbers
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const limitedNumbers = numbers.slice(0, 14);
    
    // Aplica a máscara do CNPJ
    return limitedNumbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const applyMask = (value: string, maskType?: string) => {
    switch (maskType) {
      case 'cpf':
        return formatCPF(value);
      case 'phone':
        return formatPhone(value);
      case 'currency':
        return formatCurrency(value);
      case 'cep':
        return formatCEP(value);
      case 'cnpj':
        return formatCNPJ(value);
      default:
        return value;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    let finalValue = newValue;
    
    // Aplica máscara se especificada
    if (mask) {
      finalValue = applyMask(newValue, mask);
    } else if (type === 'text' && label.toLowerCase().includes('valor')) {
      // Fallback para formatação de valores monetários (compatibilidade)
      finalValue = formatCurrency(newValue);
    }
    
    setInputValue(finalValue);
    onChange?.(finalValue);
    
    // Validação em tempo real se habilitada
    if (showValidationError && validate) {
      const error = validate(finalValue);
      setValidationError(error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-500 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Input Field */}
      <div className="relative">
        <input
          ref={ref}
          type={type}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-white border rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 shadow-sm hover:border-gray-300 transition-colors duration-200 cursor-pointer text-[#333] placeholder-gray-500 ${
            showValidationError && validationError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-200 focus:ring-[#2b9af3] focus:border-[#2b9af3]'
          }`}
        />
      </div>
      
      {/* Validation Error Message */}
      {showValidationError && validationError && (
        <p className="text-red-500 text-sm mt-1">{validationError}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
