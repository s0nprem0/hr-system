/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

// Define types
import type { Role } from './AuthPermissions';
import { getPermissions } from './AuthPermissions';

interface User {
    _id: string;
    name: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (user: User, token?: string) => void;
    logout: () => void;
    loading: boolean;
    hasRole: (role: User['role']) => boolean;
    hasAnyRole: (roles: User['role'][]) => boolean;
    can: (permission: string) => boolean;
    permissions: Record<string, boolean>;
}

const userContext = createContext<AuthContextType | null>(null);

export function AuthContext({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const permissions = getPermissions(user?.role ?? null);

    function hasRole(role: User['role']) {
        return !!user && user.role === role;
    }

    function hasAnyRole(roles: User['role'][] = []) {
        return !!user && roles.includes(user.role);
    }

    function can(permission: string) {
        return !!permissions && !!permissions[permission];
    }

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = safeGetItem('token');
                if (token) {
                    const response = await api.get('/api/auth/verify');
                    if (response.data?.success) {
                        // server standardised responses are wrapped in `data`
                        // e.g. { success: true, data: { user: ... } }
                        setUser(response.data?.data?.user ?? null);
                    }
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
        // Listen for global unauthorized events emitted by the API layer
        const onUnauthorized = () => {
            // Clear local auth state and call shared helper to clear storage + redirect.
            setUser(null);
            setLoading(false);
            handleUnauthorized();
        };
        window.addEventListener('auth:unauthorized', onUnauthorized as EventListener);
        return () => {
            window.removeEventListener('auth:unauthorized', onUnauthorized as EventListener);
        };
    }, []);

    function login(userParam: User, token?: string) {
        setUser(userParam);
        try {
            if (token) {
                safeSetItem('token', token);
            }
        } catch {
            // ignore
        }
    }

    function logout() {
        setUser(null);
        safeRemoveItem('token');
        safeRemoveItem('refreshToken');
    }

    return (
        <userContext.Provider value={{ user, login, logout, loading, hasRole, hasAnyRole, can, permissions }}>
            {children}
        </userContext.Provider>
    );
}

export function useAuth() {
    return useContext(userContext);
}

export function handleUnauthorized(redirectFn?: (path: string) => void) {
    try {
        safeRemoveItem('token');
        safeRemoveItem('refreshToken');
    } catch {
        // ignore
    }
    // Note: not changing any React state here; the context's listener calls this helper and also clears state via its closure.
    if (redirectFn) {
        redirectFn('/login');
    } else if (typeof window !== 'undefined' && typeof window.location?.replace === 'function') {
        window.location.replace('/login');
    }
}

export default AuthContext;
