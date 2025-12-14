import React from 'react';
import cn from '../../utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, ...rest }, ref) => {
  return (
    <label className={cn('inline-flex items-center gap-2', className)}>
      <input ref={ref} type="checkbox" className="h-4 w-4 rounded border-border bg-surface text-primary" {...rest} />
      {label && <span className="text-sm text-[var(--cp-text)]">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
