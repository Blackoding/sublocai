import React from 'react';

interface IconProps {
  name: 'search' | 'menu' | 'close' | 'phone' | 'chevron-down';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fill?: 'none' | 'current';
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className = '', 
  fill = 'none' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const iconPaths = {
    search: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
      />
    ),
    menu: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 6h16M4 12h16M4 18h16" 
      />
    ),
    close: (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    ),
    phone: (
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    ),
    'chevron-down': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 9l-7 7-7-7" 
      />
    ),
  };

  const combinedClasses = `inline-block ${sizeClasses[size]} ${className}`.trim();

  return (
    <svg 
      className={combinedClasses}
      fill={fill}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
};

export default Icon;
