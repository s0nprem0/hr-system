import { type ReactNode } from 'react';

interface LoadingErrorWrapperProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
  loadingMessage?: string;
}

export function LoadingErrorWrapper({
  loading,
  error,
  children,
  loadingMessage = 'Loading...'
}: LoadingErrorWrapperProps) {
  if (loading) {
    return <div className="muted">{loadingMessage}</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return <>{children}</>;
}
