import React from 'react';
import cn from '../../utils/cn';
import Label from './Label';
import { cva } from 'class-variance-authority';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string | null;
}

const inputClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-[var(--cp-text)] placeholder:text-[var(--cp-muted)] border-border');

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...rest }, ref) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={ref} className={cn(inputClasses(), className)} {...rest} />
      {error && <div className="text-sm text-danger mt-1">{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
