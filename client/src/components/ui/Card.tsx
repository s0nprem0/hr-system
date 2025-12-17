import React from 'react';
import cn from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...rest }) => {
  return (
    <div
      role="region"
      aria-label="card"
      className={cn('bg-(--cp-surface) border-(--cp-border) rounded-md shadow p-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card;
