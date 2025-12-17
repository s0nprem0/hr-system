import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface border border-border text-[var(--cp-text)] hover:bg-[color-mix(in srgb, var(--cp-surface) 92%, var(--cp-bg) 8%)]',
        primary: 'bg-[var(--cp-cta)] text-[var(--cp-cta-foreground)] hover:bg-[var(--cp-cta-hover)] focus-visible:ring-[var(--cp-cta)]',
        ghost: 'bg-transparent text-[var(--cp-text)] hover:bg-[color-mix(in srgb, var(--cp-surface) 94%, transparent 6%)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Button: React.FC<ButtonProps> = ({ variant = 'default', className, children, loading = false, type = 'button', leftIcon, rightIcon, ...rest }) => {
  const disabled = rest.disabled || loading;

  return (
    <button
      type={type}
      aria-busy={loading}
      aria-disabled={disabled}
      disabled={disabled}
      className={cn(buttonVariants({ variant }), disabled ? 'opacity-70 cursor-not-allowed' : '', className)}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;

