import Button from './ui/Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = Math.min((page - 1) * pageSize + 1, total);
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="muted">
        {startItem} - {endItem} of {total}
      </div>
      <div className="flex gap-2">
        <Button disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))} className="px-3">Prev</Button>
        <div className="muted px-2">Page {page} / {totalPages}</div>
        <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-3">Next</Button>
      </div>
    </div>
  );
}
