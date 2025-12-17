import React from 'react';
import cn from '../../utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, children, required = false, ...rest }) => {
  return (
    <label className={cn('block text-sm font-medium text-(--cp-text)', className)} {...rest}>
      {children}
      {required && <span className="ml-1 text-(--cp-danger)" aria-hidden>*</span>}
    </label>
  );
};

export default Label;
