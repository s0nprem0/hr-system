import type { ReactNode } from 'react';
import Card from './Card';

export interface CenteredCardProps {
  children?: ReactNode;
  className?: string;
}

const CenteredCard = ({ children, className = '' }: CenteredCardProps) => {
  return (
    <Card className={`card w-full max-w-md mx-auto p-6 ${className}`}>
      {children}
    </Card>
  );
};

export default CenteredCard;
