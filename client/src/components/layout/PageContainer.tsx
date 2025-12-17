import React from 'react';

const PageContainer: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <div className={`container-main py-6 ${className}`}>
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default PageContainer;
