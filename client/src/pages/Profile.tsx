import { useAuth } from '../context/AuthContext';
import { formatRole } from '../context/AuthPermissions';
import PageContainer from '../components/layout/PageContainer';

const Profile = () => {
  const auth = useAuth();

  return (
    <PageContainer>
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="muted">Name: {auth?.user?.name}</p>
        <p className="muted">Role: {formatRole(auth?.user?.role)}</p>
      </div>
    </PageContainer>
  );
};

export default Profile;
