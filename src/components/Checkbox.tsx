import React from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  value?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
  value
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
      checked ? 'border-[#2b9af3] bg-blue-50' : 'border-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        value={value}
        className="rounded border-gray-300 text-[#2b9af3] focus:ring-[#2b9af3] focus:ring-2 focus:ring-offset-0"
      />
      <span className={`ml-3 text-sm transition-colors duration-200 ${
        checked ? 'text-[#2b9af3] font-medium' : 'text-gray-700'
      }`}>
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
