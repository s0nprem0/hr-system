import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import Label from './Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaClasses> {
  label?: React.ReactNode;
}

const textareaClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-[var(--cp-text)] border-border', {
  variants: {
    variant: {
      default: '',
      large: 'min-h-[120px] p-4',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Textarea: React.FC<TextareaProps> = ({ label, className, variant, ...rest }) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea className={cn(textareaClasses({ variant }), className)} {...rest} />
    </div>
  );
};

export default Textarea;
