/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

type ConfirmResolve = (value: boolean) => void;
interface ConfirmState {
  message: string;
  resolve: ConfirmResolve | null;
}

const ConfirmContext = createContext<{ confirm: (message: string) => Promise<boolean> } | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<ConfirmState | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((res) => {
      setCurrent({ message, resolve: res });
    });
  }, []);

  const handle = (value: boolean) => {
    if (current?.resolve) current.resolve(value);
    setCurrent(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow p-6 max-w-sm w-full">
            <div className="mb-4 text-sm text-slate-900">{current.message}</div>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => handle(false)}>Cancel</button>
              <button className="btn" onClick={() => handle(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmContext;
