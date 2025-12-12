import { Link } from 'react-router-dom';

const Payroll = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Payroll</h1>
          <Link to="/payroll/new" className="btn">Add Payroll Entry</Link>
        </div>
        <p className="muted">Placeholder payroll list. Integrate with `/api/payroll` for listing and CRUD.</p>
      </div>
    </div>
  );
};

export default Payroll;
