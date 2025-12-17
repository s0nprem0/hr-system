import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import Label from './Label';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectClasses> {
  label?: React.ReactNode;
}

const selectClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-[var(--cp-surface)] text-[var(--cp-text)] placeholder:text-[var(--cp-muted)] border-[var(--cp-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cp-cta)] disabled:opacity-70 disabled:cursor-not-allowed', {
  variants: {
    variant: {
      default: '',
      subtle: 'bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)]',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Select: React.FC<SelectProps> = ({ label, className, children, variant, ...rest }) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select className={cn(selectClasses({ variant }), className)} {...rest}>
        {children}
      </select>
    </div>
  );
};

export default Select;
