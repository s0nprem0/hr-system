import React from 'react';
import cn from '../../utils/cn';
import Button from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-lg bg-surface border border-border rounded-md shadow-lg p-6')} role="dialog" aria-modal>
        <div className="flex items-start justify-between">
          {title ? <h3 className="text-lg font-semibold">{title}</h3> : <div />}
          <Button onClick={onClose} variant="ghost">Close</Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
