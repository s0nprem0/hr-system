import { useDataList } from '../utils/useDataList';
import { PageHeader } from '../components/PageHeader';
import { DataTable, type Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';
import PageContainer from '../components/layout/PageContainer';

type PayrollEntry = {
  _id: string;
  amount: number;
  payDate?: string;
  employee?: { _id: string; name?: string; email?: string } | null;
};

const Payroll = () => {
  const {
    items,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setPage,
    setSearch,
    handleDelete,
  } = useDataList<PayrollEntry>({
    endpoint: '/api/payroll',
    pageSize: 20,
    deleteConfirmMessage: 'Delete this payroll entry?',
    deleteSuccessMessage: 'Payroll entry deleted',
  });

  const columns: Column<PayrollEntry>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (entry) => entry.employee ? `${entry.employee.name || entry.employee.email || '—'}` : '—',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (entry) => entry.amount?.toFixed ? entry.amount.toFixed(2) : entry.amount,
    },
    {
      key: 'payDate',
      header: 'Pay Date',
      render: (entry) => entry.payDate ? new Date(entry.payDate).toLocaleDateString() : '-',
    },
  ];

  const actions = [
    {
      label: 'Edit',
      to: (entry: PayrollEntry) => `/payroll/${entry._id}`,
    },
    {
      label: 'Delete',
      onClick: (entry: PayrollEntry) => handleDelete(entry._id),
      className: 'btn-danger',
    },
  ];

  return (
    <PageContainer>
      <div className="card">
        <PageHeader
          title="Payroll"
          addButton={{ to: '/payroll/new', text: 'Add Payroll Entry' }}
          search={{ value: search, onChange: setSearch, placeholder: 'Search by employee' }}
        />

        <LoadingErrorWrapper loading={loading} error={error}>
          <DataTable
            data={items}
            columns={columns}
            actions={actions}
            emptyMessage="No payroll entries found"
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </LoadingErrorWrapper>
      </div>
    </PageContainer>
  );
};

export default Payroll;
