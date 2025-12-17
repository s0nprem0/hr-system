import React from 'react';
import cn from '../../utils/cn';
import Label from './Label';
import { cva } from 'class-variance-authority';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string | null;
}

const inputClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-[var(--cp-surface)] text-[var(--cp-text)] placeholder:text-[var(--cp-muted)] border-[var(--cp-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cp-cta)] disabled:opacity-70 disabled:cursor-not-allowed');

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...rest }, ref) => {
  const invalid = !!error;
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={ref} aria-invalid={invalid} className={cn(inputClasses(), invalid ? 'ring-2 ring-(--cp-danger)' : '', className)} {...rest} />
      {error && <div role="alert" className="text-sm text-(--cp-danger) mt-1">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
