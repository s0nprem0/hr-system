import React from 'react';
import cn from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...rest }) => {
  return (
    <div className={cn('bg-surface border border-border rounded-md shadow-sm p-4', className)} {...rest}>
      {children}
    </div>
  );
};

export default Card;
