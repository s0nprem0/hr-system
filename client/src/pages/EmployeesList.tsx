import { useAuth } from '../context/AuthContext';
import { formatRole } from '../context/AuthPermissions';
import { useDataList } from '../utils/useDataList';
import { PageHeader } from '../components/PageHeader';
import { DataTable, type Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';
import PageContainer from '../components/layout/PageContainer';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  profile?: { department?: { name?: string } } | null;
}

const EmployeesList = () => {
  const auth = useAuth();

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
  } = useDataList<Employee>({
    endpoint: '/api/employees',
    pageSize: 20,
    deleteConfirmMessage: 'Delete this employee? This action cannot be undone.',
    deleteSuccessMessage: 'Employee deleted',
  });

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
    },
    {
      key: 'active',
      header: 'Active',
      render: (employee) => (employee.active ? <span className="text-success">Active</span> : <span className="muted">Inactive</span>),
      className: 'w-24',
    },
    {
      key: 'department',
      header: 'Department',
      render: (employee) => employee.profile?.department?.name ?? '-',
    },
  ];

  const actions = [
    {
      label: 'View',
      to: (employee: Employee) => `/employees/${employee._id}`,
      className: 'muted',
    },
    {
      label: 'Edit',
      to: (employee: Employee) => `/employees/${employee._id}/edit`,
      className: 'muted',
    },
    {
      label: 'Delete',
      onClick: (employee: Employee) => handleDelete(employee._id),
      className: 'text-danger',
      condition: () => !!auth?.can && auth.can('manageEmployees'),
    },
  ];

  return (
    <PageContainer>
      <div className="card">
        <PageHeader
          title="Employees"
          addButton={auth?.can && auth.can('manageEmployees') ? { to: '/employees/new', text: 'Add Employee' } : undefined}
          search={{ value: search, onChange: setSearch }}
        />

        <LoadingErrorWrapper loading={loading} error={error}>
          <DataTable
            data={items}
            columns={columns}
            actions={actions}
            emptyMessage="No employees found"
          />
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </LoadingErrorWrapper>
      </div>

      <p className="muted mt-4">
        Signed in as: {auth?.user?.name} ({formatRole(auth?.user?.role)})
      </p>
    </PageContainer>
  );
};

export default EmployeesList;
