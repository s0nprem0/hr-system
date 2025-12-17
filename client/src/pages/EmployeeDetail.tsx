import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { formatRole } from '../context/AuthPermissions';
import api from '../utils/api';
import type { ApiResponse, EmployeeDTO } from '@hr/shared';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

interface Employee {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  profile?: { department?: { _id?: string; name?: string } } | null;
  createdAt?: string;
}

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      if (!isValidMongoId(id)) {
        setError('Invalid employee id');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/employees/${id}`);
        const r = res.data as ApiResponse<EmployeeDTO>;
        if (r?.success) setEmployee(r.data || null);
        else throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Failed to load employee');
      } catch (err: unknown) {
        const apiErr = handleApiError(err);
        if (/not found/i.test(apiErr.message)) setError('Employee not found');
        else setError(apiErr.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const toast = useToast();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!id) return;
    if (!isValidMongoId(id)) {
      toast.showToast('Invalid employee id', 'error');
      return;
    }
    const ok = await confirm('Delete this employee?');
    if (!ok) return;
    try {
      const res = await api.delete(`/api/employees/${id}`);
      const r = res.data as ApiResponse<null>;
      if (r?.success) navigate('/employees');
      else throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Delete failed');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.showToast(apiErr.message, 'error');
    }
  };

  return (
    <PageContainer>
      <div className="card mb-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Employee Detail</h1>
        {loading && <div className="muted">Loading...</div>}
        {error && <div className="text-danger">{error}</div>}
        {employee && (
          <div className="space-y-2 mt-3">
            <div><strong>Name:</strong> {employee.name}</div>
            <div><strong>Email:</strong> {employee.email}</div>
            <div><strong>Role:</strong> {formatRole(employee.role)}</div>
            <div><strong>Department:</strong> {employee.profile?.department?.name ?? '-'}</div>
            <div><strong>Created:</strong> {employee.createdAt ? new Date(employee.createdAt).toLocaleString() : '-'}</div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link to="/employees" className="muted">Back to employees</Link>
          <Link to={`/employees/${id}/edit`} className="btn">Edit</Link>
          <button className="btn text-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </PageContainer>
  );
};

export default EmployeeDetail;
