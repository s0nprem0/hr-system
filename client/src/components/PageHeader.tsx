import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  addButton?: {
    to: string;
    text: string;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  children?: ReactNode;
}

export function PageHeader({ title, addButton, search, children }: PageHeaderProps) {
  return (
    <div className="card mb-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        {search && (
          <input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search"}
            className="input"
          />
        )}
        {addButton && (
          <Link to={addButton.to} className="btn">
            {addButton.text}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
