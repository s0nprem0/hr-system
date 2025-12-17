import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import type { Role } from '../context/AuthPermissions';
import { redirectToLogin } from './authRedirect';
import type { ReactNode } from 'react';

interface PrivateRoutesProps {
    children: ReactNode;
    requiredRole?: Role[]; // requiredRole is an array of `Role`
}

const PrivateRoutes = ({ children, requiredRole }: PrivateRoutesProps) => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (auth?.loading) {
        return <div>Loading...</div>;
    }

    if (!auth?.user) {
        redirectToLogin(navigate, location.pathname + (location.search || ''));
        return null;
    }

    if (requiredRole && (!auth || !auth.hasAnyRole || !auth.hasAnyRole(requiredRole))) {
        return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
};

export default PrivateRoutes;
