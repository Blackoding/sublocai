import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const baseClasses = 'font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden cursor-pointer flex items-center justify-center group';
  
  const variantClasses = {
    primary: 'bg-[#2b9af3] text-white focus:ring-[#2b9af3]',
    secondary: 'bg-gray-600 text-white focus:ring-gray-500',
    outline: 'border-2 border-[#CCC] text-gray-700 focus:ring-[#2b9af3] group-hover:border-[#2b9af3] transition-colors duration-300',
    whatsapp: 'bg-green-600 text-white focus:ring-green-500',
    danger: 'bg-red-600 text-white focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'py-1 px-3 text-xs',
    md: 'py-2 px-6 text-sm',
    lg: 'py-3 px-8 text-base',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:bg-[#2b9af3]' 
    : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${className}
  `.trim();

  const getSlideColor = () => {
    // Verificar se há classes de cor no className
    if (className.includes('text-red-600') || className.includes('text-red-500') || className.includes('bg-red-600')) {
      return 'bg-red-600'; // Vermelho para botões vermelhos
    }
    if (className.includes('text-green-600') || className.includes('text-green-500') || className.includes('bg-green-600')) {
      return 'bg-green-600'; // Verde para botões verdes
    }
    if (className.includes('text-yellow-600') || className.includes('text-yellow-500') || className.includes('bg-yellow-600')) {
      return 'bg-yellow-600'; // Amarelo para botões amarelos
    }
    if (className.includes('text-orange-600') || className.includes('text-orange-500') || className.includes('bg-orange-600')) {
      return 'bg-orange-600'; // Laranja para botões laranja
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-[#1e7ce6]'; // Azul escuro para botão primary
      case 'secondary':
        return 'bg-gray-700'; // Cinza escuro para botão secondary
      case 'outline':
        return 'bg-[#2b9af3]'; // Azul para botão outline
      case 'whatsapp':
        return 'bg-green-700'; // Verde escuro para botão whatsapp
      case 'danger':
        return 'bg-red-700'; // Vermelho escuro para botão danger
      default:
        return 'bg-[#1e7ce6]';
    }
  };

  const getTextHoverClass = () => {
    // Verificar se há classes de cor no className
    if (className.includes('text-red-600') || className.includes('text-red-500') || className.includes('bg-red-600')) {
      return 'group-hover:text-white transition-colors duration-300';
    }
    if (className.includes('text-green-600') || className.includes('text-green-500') || className.includes('bg-green-600')) {
      return 'group-hover:text-white transition-colors duration-300';
    }
    if (className.includes('text-yellow-600') || className.includes('text-yellow-500') || className.includes('bg-yellow-600')) {
      return 'group-hover:text-white transition-colors duration-300';
    }
    if (className.includes('text-orange-600') || className.includes('text-orange-500') || className.includes('bg-orange-600')) {
      return 'group-hover:text-white transition-colors duration-300';
    }
    
    return variant === 'outline' ? 'group-hover:text-white transition-colors duration-300' : '';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {/* Elemento de slide universal */}
      <span className={`absolute inset-0 ${getSlideColor()} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out`}></span>
      
      {/* Conteúdo do botão - sem span wrapper para permitir gap */}
      <div className={`relative z-10 flex items-center gap-2 ${getTextHoverClass()}`}>
        {children}
      </div>
    </button>
  );
};

export default Button;
