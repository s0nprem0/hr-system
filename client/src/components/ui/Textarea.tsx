import React from 'react';
import cn from '../../utils/cn';
import Label from './Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
}

export const Textarea: React.FC<TextareaProps> = ({ label, className, ...rest }) => {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea className={cn('mt-1 block w-full px-3 py-2 border rounded-md bg-surface text-[var(--cp-text)] border-border', className)} {...rest} />
    </div>
  );
};

export default Textarea;
