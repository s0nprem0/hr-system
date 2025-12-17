import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { FormCard } from '../components/ui';
import api from '../utils/api';
import type { ApiResponse, EmployeeDTO, PayrollDTO } from '@hr/shared';
import handleApiError from '../utils/handleApiError';
import { isValidMongoId } from '../utils/validators';
import { useToast } from '../context/ToastContext';

interface EmployeeShort {
  _id: string;
  name?: string;
  email: string;
}

const PayrollForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;
  const [employeeId, setEmployeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [employees, setEmployees] = useState<EmployeeShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const employeeRef = useRef<HTMLSelectElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);

  const toast = useToast();

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/api/employees', { params: { page: 1, limit: 200 } });
      const r = res.data as ApiResponse<{ items: EmployeeDTO[] }>;
      if (r?.success) setEmployees(r.data?.items || []);
      else throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Failed to load employees');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      console.error('Failed to fetch employees:', apiErr.message);
    }
  };

  const fetchPayroll = useCallback(async () => {
    if (!params.id) return;
    if (!isValidMongoId(params.id)) {
      setError('Invalid payroll id');
      return;
    }
    setLoading(true);
      try {
        const res = await api.get(`/api/payroll/${params.id}`);
        const r = res.data as ApiResponse<PayrollDTO>;
        if (r?.success) {
          const p = r.data;
          setEmployeeId(p?.employeeId || '');
          setAmount(p?.net != null ? String(p.net) : '');
          setPayDate(p?.periodStart ? new Date(p.periodStart).toISOString().slice(0, 10) : '');
        } else {
          throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Failed to load payroll');
        }
      } catch (err: unknown) {
      const apiErr = handleApiError(err);
      if (/not found/i.test(apiErr.message)) setError('Payroll entry not found');
      else setError(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchEmployees(); if (isEdit) fetchPayroll(); }, [params.id, fetchPayroll, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});
    const errs: Record<string, string> = {};
    if (!employeeId) errs.employeeId = 'Employee is required';
    if (!amount || Number.isNaN(Number(amount))) errs.amount = 'Valid amount is required';
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      const first = Object.keys(errs)[0];
      if (first === 'employeeId') employeeRef.current?.focus();
      if (first === 'amount') amountRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload: { employeeId: string; amount: number; payDate?: string } = {
        employeeId,
        amount: Number(amount),
        payDate: payDate || undefined,
      };
      if (isEdit && params.id) {
        const res = await api.put(`/api/payroll/${params.id}`, payload);
        const r = res.data as ApiResponse<PayrollDTO>;
        if (r?.success) toast.showToast('Payroll entry updated', 'success');
        else throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Update failed');
      } else {
        const res = await api.post('/api/payroll', payload);
        const r = res.data as ApiResponse<PayrollDTO>;
        if (r?.success) toast.showToast('Payroll entry created', 'success');
        else throw new Error((r as { success: false; error?: { message?: string } }).error?.message || 'Create failed');
      }
      navigate('/payroll');
    } catch (err: unknown) {
      const apiErr = handleApiError(err);
      if (apiErr.details && Array.isArray(apiErr.details)) {
        const fe: Record<string, string> = {};
        for (const d of apiErr.details) if (d.param && d.msg) fe[d.param] = d.msg;
        setFormErrors(fe);
        const first = Object.keys(fe)[0];
        if (first === 'employeeId') employeeRef.current?.focus();
        if (first === 'amount') amountRef.current?.focus();
        setError(apiErr.message || 'Validation failed');
      } else {
        setError(apiErr.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <form onSubmit={handleSubmit} className="">
        <FormCard>
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} Payroll Entry</h1>
          {loading && <div className="muted">Loading...</div>}
          {error && <div className="text-danger">{error}</div>}

          <div>
            <label className="block text-sm font-medium">Employee</label>
            <select ref={employeeRef} aria-invalid={!!formErrors.employeeId} aria-describedby={formErrors.employeeId ? 'employee-error' : undefined} className="input" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.employeeId; return c; }); }}>
              <option value="">-- Select employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
              ))}
            </select>
            {formErrors.employeeId && <div id="employee-error" className="text-sm text-danger mt-1">{formErrors.employeeId}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input ref={amountRef} aria-invalid={!!formErrors.amount} aria-describedby={formErrors.amount ? 'amount-error' : undefined} className="input" value={amount} onChange={(e) => { setAmount(e.target.value); setFormErrors((s)=>{ const c = { ...s }; delete c.amount; return c; }); }} type="number" step="0.01" />
            {formErrors.amount && <div id="amount-error" className="text-sm text-danger mt-1">{formErrors.amount}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Pay Date</label>
            <input className="input" value={payDate} onChange={(e) => setPayDate(e.target.value)} type="date" />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </FormCard>
      </form>
    </PageContainer>
  );
};

export default PayrollForm;
