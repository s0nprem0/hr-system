import type { ReactNode } from 'react';
import Card from './Card';

export interface FormCardProps {
  children?: ReactNode;
  className?: string;
}

const FormCard = ({ children, className = '' }: FormCardProps) => {
  return (
    <Card className={`card space-y-4 max-w-3xl mx-auto ${className}`}>
      {children}
    </Card>
  );
};

export default FormCard;
