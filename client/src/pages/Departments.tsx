import { Link } from 'react-router-dom';

const Departments = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Departments</h1>
          <Link to="/departments/new" className="btn">Add Department</Link>
        </div>
        <p className="muted">Placeholder departments list. Implement create/edit/delete with `/api/departments`.</p>
      </div>
    </div>
  );
};

export default Departments;
