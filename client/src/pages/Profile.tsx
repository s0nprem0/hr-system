import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">My Profile</h1>
          <p className="muted">Name: {auth?.user?.name}</p>
          <p className="muted">Role: {auth?.user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
