import React from 'react';
import cn from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof checkboxInput> {
  label?: React.ReactNode;
}

const wrapper = cva('inline-flex items-center gap-2');
const checkboxInput = cva('h-4 w-4 rounded border-[var(--cp-border)] bg-(--cp-surface) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--cp-cta)', {
  variants: {
    variant: {
      default: 'text-(--cp-primary-foreground)',
      cta: 'text-(--cp-cta-foreground)',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, variant, id, ...rest }, ref) => {
  const inputId = id ?? `chk-${Math.random().toString(36).slice(2, 9)}`
  return (
    <div className={cn(wrapper(), className)}>
      <input id={inputId} ref={ref} type="checkbox" className={cn(checkboxInput({ variant }))} {...rest} />
      {label && <label htmlFor={inputId} className="text-sm text-(--cp-text)">{label}</label>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
