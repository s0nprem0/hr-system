import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const auth = useAuth();

  return (
    <div className="container-main py-6">
      <div className="space-y-6">
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
