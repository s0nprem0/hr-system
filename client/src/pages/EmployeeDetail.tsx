import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import axios from 'axios';
import handleApiError from '../utils/handleApiError';
import { useToast } from '../context/ToastContext';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: { department?: { _id?: string; name?: string } } | null;
  createdAt?: string;
}

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/employees/${id}`);
      setEmployee(res.data?.data || null);
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployee(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const toast = useToast();

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Delete this employee?')) return;
    try {
      await api.delete(`/api/employees/${id}`);
      navigate('/employees');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      toast.showToast(apiErr.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-4">
          <h1 className="text-2xl font-bold">Employee Detail</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}
          {employee && (
            <div className="space-y-2 mt-3">
              <div><strong>Name:</strong> {employee.name}</div>
              <div><strong>Email:</strong> {employee.email}</div>
              <div><strong>Role:</strong> {employee.role}</div>
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
      </div>
    </div>
  );
};

export default EmployeeDetail;
