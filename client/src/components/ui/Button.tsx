import React from 'react';
import cn from '../../utils/cn';

type Variant = 'default' | 'primary' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'default', className, children, ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors';
  const variants: Record<Variant, string> = {
    default: 'bg-surface border border-border text-[var(--cp-text)] hover:bg-gray-50',
    primary: 'bg-primary text-primary-foreground hover:brightness-95',
    ghost: 'bg-transparent text-[var(--cp-text)] hover:bg-gray-100',
  };

  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
};

export default Button;
