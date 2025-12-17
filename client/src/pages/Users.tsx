import { useDataList } from '../utils/useDataList';
import { PageHeader } from '../components/PageHeader';
import PageContainer from '../components/layout/PageContainer';
import { DataTable, type Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';

type User = {
  _id: string;
  name?: string;
  email: string;
  role?: string;
  active?: boolean;
};

const Users = () => {
  const {
    items: users,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setPage,
    setSearch,
    handleDelete,
  } = useDataList<User>({
    endpoint: '/api/users',
    pageSize: 20,
    deleteConfirmMessage: 'Delete user? This action cannot be undone.',
    deleteSuccessMessage: 'User deleted',
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (user) => user.name || '—',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => user.role || 'user',
    },
    {
      key: 'active',
      header: 'Active',
      render: (user) => (user.active ? <span className="text-success">Active</span> : <span className="muted">Inactive</span>),
      className: 'w-24',
    },
  ];

  const actions = [
    {
      label: 'Edit',
      to: (user: User) => `/users/${user._id}/edit`,
    },
    {
      label: 'Delete',
      onClick: (user: User) => handleDelete(user._id),
      className: 'btn-danger',
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="card">
          <PageHeader
            title="Users"
            addButton={{ to: '/users/new', text: 'Add User' }}
            search={{ value: search, onChange: setSearch }}
          />

          <LoadingErrorWrapper loading={loading} error={error}>
            <DataTable
              data={users}
              columns={columns}
              actions={actions}
              emptyMessage="No users found"
            />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </LoadingErrorWrapper>
        </div>
      </div>
    </PageContainer>
  );
};

export default Users;
