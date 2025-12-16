import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof checkboxInput> {
  label?: React.ReactNode;
}

const wrapper = cva('inline-flex items-center gap-2');
const checkboxInput = cva('h-4 w-4 rounded border-border bg-surface', {
  variants: {
    variant: {
      default: 'text-[var(--cp-primary-foreground)]',
      cta: 'text-[var(--cp-cta-foreground)]',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, variant, ...rest }, ref) => {
  return (
    <label className={cn(wrapper(), className)}>
      <input ref={ref} type="checkbox" className={cn(checkboxInput({ variant }))} {...rest} />
      {label && <span className="text-sm text-[var(--cp-text)]">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
