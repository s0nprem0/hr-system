import React from 'react';
import Card from './Card';

const CenteredCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <Card className={`card w-full max-w-md mx-auto p-6 ${className}`}>
      {children}
    </Card>
  );
};

export default CenteredCard;
