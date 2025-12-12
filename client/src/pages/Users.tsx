import { Link } from 'react-router-dom';

const Users = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="card mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users (Admin)</h1>
        </div>
        <p className="muted">Placeholder users admin page. Implement list and delete using `/api/users`.</p>
      </div>
    </div>
  );
};

export default Users;
