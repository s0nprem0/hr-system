import React from 'react';
import cn from '../../utils/cn';
import Label from './Label';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, className, children, ...rest }) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <select className={cn('mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-[var(--cp-text)] border-border', className)} {...rest}>
        {children}
      </select>
    </div>
  );
};

export default Select;
