import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import Label from './Label';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectClasses> {
  label?: React.ReactNode;
}

const selectClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-[var(--cp-text)] border-border', {
  variants: {
    variant: {
      default: '',
      subtle: 'bg-[color:var(--cp-surface)]',
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
