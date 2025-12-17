import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import Label from './Label';

interface FormFieldPropsExt extends VariantProps<typeof fieldClasses> {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
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

export const FormField: React.FC<FormFieldPropsExt> = ({ label, help, error, children, className, compact }) => {
  const hasError = !!error;
  return (
    <div className={cn(fieldClasses({ compact: compact ? true : undefined }), className)}>
      {label && <Label className={hasError ? 'text-(--cp-danger)' : ''}>{label}</Label>}
      {children}
      {help && !hasError && <div className="text-sm text-(--cp-muted)">{help}</div>}
      {hasError && <div role="alert" className="text-sm text-(--cp-danger)">{error}</div>}
    </div>
  );
};

export default FormField;
