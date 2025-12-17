import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { Button, Input } from './ui';
import { Plus, Search } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  addButton?: {
    to: string;
    text: string;
  } | null;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  } | null;
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--cp-muted)" />
            <Input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'Search'}
              className="w-64 pl-10"
            />
          </div>
        )}
        {addButton && (
          <Link to={addButton.to}>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              {addButton.text}
            </Button>
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
