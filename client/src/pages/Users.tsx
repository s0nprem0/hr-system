import { useDataList } from '../utils/useDataList';
import { PageHeader } from '../components/PageHeader';
import { DataTable, type Column } from '../components/DataTable';
import { Pagination } from '../components/Pagination';
import { LoadingErrorWrapper } from '../components/LoadingErrorWrapper';

type User = {
  _id: string;
  name?: string;
  email: string;
  role?: string;
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
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
    </div>
  );
};

export default Users;
