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
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId?.() ?? Math.random().toString(36).slice(2, 9);
  const titleId = `dialog-title-${id}`;

  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;

    const onDocumentKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const dlg = dialogRef.current;
      if (!dlg) return;
      const focusable = dlg.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onDocumentKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus the dialog container (or first focusable)
    const timer = setTimeout(() => {
      const dlg = dialogRef.current;
      if (!dlg) return;
      const focusable = dlg.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
      else dlg.focus();
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onDocumentKey);
      document.body.style.overflow = prevOverflow;
      if (prev) prev.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn('relative z-10 w-full max-w-lg bg-surface border border-border rounded-md shadow-lg p-6')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Dialog'}
      >
        <div className="flex items-start justify-between">
          {title ? (
            <h3 id={titleId} className="text-lg font-semibold">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <Button onClick={onClose} variant="ghost">Close</Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
