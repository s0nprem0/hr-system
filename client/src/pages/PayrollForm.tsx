import { useNavigate, useParams } from 'react-router-dom';

const PayrollForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit' : 'Create'} Payroll Entry</h1>
          <p className="muted mb-4">Form placeholder — integrate with `/api/payroll`.</p>
          <div className="flex gap-2">
            <button className="btn" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn">Save (stub)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollForm;
