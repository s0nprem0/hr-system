import React from 'react';
import cn from '../../utils/cn';

export interface FormFieldProps {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, className }) => {
  return (
    <div className={cn('space-y-1', className)}>
      {label}
      {children}
    </div>
  );
};

export default FormField;
