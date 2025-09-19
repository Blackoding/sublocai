import React from 'react';

interface LoadingProps {
  message?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  description,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-12 text-center ${className}`}>
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className={`animate-spin rounded-full border-b-2 border-[#2b9af3] mb-4 ${sizeClasses[size]}`}></div>
        
        {/* Mensagem principal */}
        <h3 className={`font-medium text-gray-900 mb-2 ${textSizeClasses[size]}`}>
          {message}
        </h3>
        
        {/* Descrição opcional */}
        {description && (
          <p className="text-gray-600">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
