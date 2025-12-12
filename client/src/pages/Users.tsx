import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

type User = {
  _id: string;
  name?: string;
  email: string;
  role?: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const confirm = useConfirm();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/users');
      setUsers(res.data?.data || []);
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Delete user?', description: 'This action cannot be undone.' });
    if (!ok) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.showToast('User deleted', 'success');
      fetchUsers();
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.showToast(apiErr.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Users</h1>
            <Link to="/users/new" className="btn">Add User</Link>
          </div>

          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="p-2">{u.name || '—'}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{u.role || 'user'}</td>
                      <td className="p-2 text-right">
                        <div className="inline-flex gap-2">
                          <Link to={`/users/${u._id}/edit`} className="btn btn-sm">Edit</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
