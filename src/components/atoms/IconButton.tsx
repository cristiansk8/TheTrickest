import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'edit' | 'delete' | 'view' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  edit: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  delete: 'bg-red-500 hover:bg-red-600 text-white',
  view: 'bg-purple-600 hover:bg-purple-700 text-white',
  info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
};

const sizeStyles = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'edit',
  size = 'sm',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-lg transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
