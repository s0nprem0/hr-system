import PageContainer from '../components/layout/PageContainer';
import { DataTable, type Column } from '../components/DataTable';
import { useDataList } from '../utils/useDataList';
import { PageHeader } from '../components/PageHeader';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';
import { formatRole } from '../context/AuthPermissions';

interface AuditLogRow {
  _id: string;
  collectionName: string;
  documentId: string | null;
  action: string;
  user?: string | null;
  before?: any;
  after?: any;
  createdAt: string;
}

const AuditLogs = () => {
  const { items, loading, error, page, pageSize, total, setPage, refetch, search, setSearch } = useDataList<AuditLogRow>({ endpoint: '/api/audits', pageSize: 20, searchPlaceholder: 'Filter by collection' });

  const columns: Column<AuditLogRow>[] = [
    { key: 'collectionName', header: 'Collection' },
    { key: 'documentId', header: 'Document ID' },
    { key: 'action', header: 'Action' },
    { key: 'user', header: 'User' },
    { key: 'createdAt', header: 'When', render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'before', header: 'Before', render: (r) => r.before ? JSON.stringify(r.before).slice(0, 100) + (JSON.stringify(r.before).length > 100 ? '…' : '') : '-' },
    { key: 'after', header: 'After', render: (r) => r.after ? JSON.stringify(r.after).slice(0, 100) + (JSON.stringify(r.after).length > 100 ? '…' : '') : '-' },
  ];

  return (
    <PageContainer>
      <div className="card">
        <PageHeader title="Audit Logs" search={{ value: search, onChange: setSearch }} />
        <LoadingErrorWrapper loading={loading} error={error}>
          <DataTable data={items} columns={columns} emptyMessage="No audit logs" />
        </LoadingErrorWrapper>
      </div>
    </PageContainer>
  );
};

export default AuditLogs;
