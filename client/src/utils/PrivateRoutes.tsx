import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PrivateRoutesProps {
    children: ReactNode;
    requiredRole?: string[]; // We define that requiredRole is an array of strings
}

const PrivateRoutes = ({ children, requiredRole }: PrivateRoutesProps) => {
    const auth = useAuth();

    if (auth?.loading) {
        return <div>Loading...</div>;
    }

    if (!auth?.user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && (!auth || !auth.hasAnyRole || !auth.hasAnyRole(requiredRole as any))) {
        return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
};

export default PrivateRoutes;
