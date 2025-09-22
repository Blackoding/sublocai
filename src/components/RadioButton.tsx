import React from 'react';

interface RadioButtonProps<T = string> {
  value: T;
  selectedValue: T | null;
  onChange: (value: T) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const RadioButton = <T,>({
  value,
  selectedValue,
  onChange,
  icon,
  title,
  description,
  className = ''
}: RadioButtonProps<T>) => {
  const isSelected = selectedValue === value;

  return (
    <div
      className={`
        relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-[#2b9af3] bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${className}
      `}
      onClick={() => onChange(value)}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Radio Button */}
        <div className="absolute top-4 right-4">
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected
                ? 'border-[#2b9af3] bg-[#2b9af3]'
                : 'border-gray-300 bg-white'
              }
            `}
          >
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>

        {/* Ícone */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isSelected
              ? 'bg-[#2b9af3] text-white'
              : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {icon}
        </div>

        {/* Texto */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadioButton;
