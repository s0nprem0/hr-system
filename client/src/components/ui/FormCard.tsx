import React from 'react';
import Card from './Card';

const FormCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <Card className={`card space-y-4 max-w-3xl mx-auto ${className}`}>
      {children}
    </Card>
  );
};

export default FormCard;
