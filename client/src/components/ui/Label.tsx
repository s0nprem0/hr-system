import React from 'react';
import cn from '../../utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ className, children, ...rest }) => {
  return (
    <label className={cn('block text-sm font-medium text-[var(--cp-text)]', className)} {...rest}>
      {children}
    </label>
  );
};

export default Label;
