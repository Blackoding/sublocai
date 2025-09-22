import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'danger';
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryButton,
  secondaryButton,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-2xl';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white rounded-3xl shadow-xl w-full ${getSizeClasses()} max-h-[95vh] overflow-hidden`}>
        {/* Header do Modal */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 mt-2">{subtitle}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 cursor-pointer"
              aria-label="Fechar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)]">
          {children}
        </div>

        {/* Footer do Modal */}
        {(primaryButton || secondaryButton) && (
          <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            {secondaryButton && (
              <Button
                onClick={secondaryButton.onClick}
                variant="outline"
                size="md"
                className="flex-1"
              >
                {secondaryButton.text}
              </Button>
            )}
            {primaryButton && (
              <Button
                onClick={primaryButton.onClick}
                variant={primaryButton.variant || "primary"}
                size="md"
                className="flex-1"
                disabled={primaryButton.disabled || primaryButton.loading}
              >
                {primaryButton.loading ? 'Carregando...' : primaryButton.text}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
