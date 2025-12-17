import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

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
    <div className="card mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {search && (
          <Input
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder || 'Search'}
            className="w-64"
          />
        )}
        {addButton && (
          <Link to={addButton.to}>
            <Button variant="primary">{addButton.text}</Button>
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
