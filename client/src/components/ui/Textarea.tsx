import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import Label from './Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaClasses> {
  label?: React.ReactNode;
}

const textareaClasses = cva('mt-1 block w-full px-3 py-2 border rounded-md bg-[var(--cp-surface)] text-[var(--cp-text)] placeholder:text-[var(--cp-muted)] border-[var(--cp-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cp-cta)] disabled:opacity-70 disabled:cursor-not-allowed', {
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
