import { useEffect, useMemo, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { DataTable, type Column } from '../components/DataTable';
import api from '../utils/api';
import type { ApiResponse, AuditLogDTO } from '@hr/shared';
import handleApiError from '../utils/handleApiError';
import type { JSONValue } from '../types/json';
import { PageHeader } from '../components/PageHeader';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';
import { Input, Select, Button, Dialog } from '../components/ui';
import { Pagination } from '../components/Pagination';

interface AuditLogRow {
  _id: string;
  collectionName: string;
  documentId: string | null;
  action: string;
  user?: string | null;
  before?: JSONValue;
  after?: JSONValue;
  createdAt: string;
}

const AuditLogs = () => {
  const [items, setItems] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const [selected, setSelected] = useState<AuditLogRow | null>(null);
  const [open, setOpen] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: pageSize };
      // map client filter names to server expected query names
      const collectionName = filterCollection || search;
      if (collectionName) params.collectionName = collectionName;
      if (filterAction) params.action = filterAction;
      if (filterUser) params.user = filterUser;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await api.get('/api/audits', { params });
      const r = res.data as ApiResponse<{ items: AuditLogDTO[]; total: number }>;
      if (r?.success) {
        const data = r.data;
        setItems((data?.items || []) as AuditLogRow[]);
        setTotal(data?.total || 0);
      } else {
        type ApiErr = { success: false; error: { message?: string } };
        const errMsg = r && !(r as { success: boolean }).success ? (r as ApiErr).error?.message ?? 'Failed to load audits' : 'Failed to load audits';
        throw new Error(errMsg);
      }
    } catch (err: unknown) {
      const apiErr = (err && typeof err === 'object') ? (handleApiError(err) as { message: string }) : undefined;
      setError(apiErr?.message ?? 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, filterAction, filterUser, filterCollection, dateFrom, dateTo]);

  const columns: Column<AuditLogRow>[] = useMemo(() => [
    { key: 'collectionName', header: 'Collection' },
    { key: 'documentId', header: 'Document ID', render: (r) => r.documentId ?? '—' },
    { key: 'action', header: 'Action' },
    { key: 'user', header: 'User' },
    { key: 'createdAt', header: 'When', render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'before', header: 'Before', render: (r) => r.before ? JSON.stringify(r.before).slice(0, 80) + (JSON.stringify(r.before).length > 80 ? '…' : '') : '—' },
    { key: 'after', header: 'After', render: (r) => r.after ? JSON.stringify(r.after).slice(0, 80) + (JSON.stringify(r.after).length > 80 ? '…' : '') : '—' },
  ], []);

  const actions = [
    {
      label: 'View',
      onClick: (row: AuditLogRow) => { setSelected(row); setOpen(true); },
    },
  ];

  return (
    <PageContainer>
      <div className="card">
        <PageHeader
          title="Audit Logs"
          search={{ value: filterCollection || search, onChange: (v) => { setFilterCollection(v); setSearch(v); }, placeholder: 'Filter by collection or text' }}
        >
          <div className="flex items-center gap-2">
            <Select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="w-44">
              <option value="">All actions</option>
              <option value="create">create</option>
              <option value="update">update</option>
              <option value="delete">delete</option>
            </Select>
            <Input placeholder="User" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="w-40" />
            <Input type="date" value={dateFrom ?? ''} onChange={(e) => setDateFrom(e.target.value || null)} className="w-36" />
            <Input type="date" value={dateTo ?? ''} onChange={(e) => setDateTo(e.target.value || null)} className="w-36" />
            <Button onClick={() => { setPage(1); void fetchList(); }}>Apply</Button>
            <Button variant="ghost" onClick={() => { setFilterAction(''); setFilterUser(''); setFilterCollection(''); setDateFrom(null); setDateTo(null); setSearch(''); setPage(1); void fetchList(); }}>Clear</Button>
          </div>
        </PageHeader>

        <LoadingErrorWrapper loading={loading} error={error}>
          <DataTable data={items} columns={columns} actions={actions} emptyMessage="No audit logs" />

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p) => setPage(p)} />
        </LoadingErrorWrapper>

        <Dialog isOpen={open} onClose={() => setOpen(false)} title={selected ? `${selected.collectionName} — ${selected.action}` : 'Audit detail'}>
          {selected ? (
            <div className="space-y-4">
              <div className="muted text-sm">ID: {selected._id}</div>
              <div className="text-sm"><strong>User:</strong> {selected.user ?? '—'}</div>
              <div className="text-sm"><strong>When:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
              <div>
                <h4 className="font-semibold">Before</h4>
                <pre className="max-h-64 overflow-auto bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)] border-(--cp-border) rounded p-2 text-sm">{selected.before ? JSON.stringify(selected.before, null, 2) : '—'}</pre>
              </div>
              <div>
                <h4 className="font-semibold">After</h4>
                <pre className="max-h-64 overflow-auto bg-[color-mix(in srgb, var(--cp-surface) 96%, var(--cp-bg) 4%)] border-(--cp-border) rounded p-2 text-sm">{selected.after ? JSON.stringify(selected.after, null, 2) : '—'}</pre>
              </div>
            </div>
          ) : null}
        </Dialog>
      </div>
    </PageContainer>
  );
};

export default AuditLogs;
