import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export interface FormFieldProps extends VariantProps<typeof fieldClasses> {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const fieldClasses = cva('space-y-1', {
  variants: {
    compact: {
      true: 'space-y-0.5',
    },
  },
});

export const FormField: React.FC<FormFieldProps> = ({ label, children, className, compact }) => {
  return (
    <div className={cn(fieldClasses({ compact: compact ? true : undefined }), className)}>
      {label}
      {children}
    </div>
  );
};

export default FormField;
