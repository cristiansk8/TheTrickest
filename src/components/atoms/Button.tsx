import React from 'react';
import { memo } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'purple';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-green-600 hover:bg-green-700 text-white border-2 border-green-300 hover:shadow-lg hover:shadow-green-500/50',
  secondary: 'bg-cyan-600 hover:bg-cyan-700 text-white border-2 border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-300 hover:shadow-lg hover:shadow-red-500/50',
  success: 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-200 hover:shadow-lg hover:shadow-green-500/50',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-yellow-200 hover:shadow-lg hover:shadow-yellow-500/50',
  purple: 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-300 hover:shadow-lg hover:shadow-purple-500/50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Button component following arcade design system
 * - Solid colors only (no gradients)
 * - 2px borders with glow shadows
 * - Hover scale transform
 * - Optimized with React.memo
 */
export const Button = memo(function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-black uppercase tracking-wider rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`.trim();

  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : (
          <>
            {leftIcon && <span>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </div>
    </button>
  );
});
