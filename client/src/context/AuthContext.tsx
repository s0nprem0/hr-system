/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

// Define types
interface User {
    _id: string;
    name: string;
    role: 'admin' | 'hr' | 'employee';
}

interface AuthContextType {
    user: User | null;
    login: (user: User, token?: string) => void;
    logout: () => void;
    loading: boolean;
}

const userContext = createContext<AuthContextType | null>(null);

export function AuthContext({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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
            safeRemoveItem('token');
            safeRemoveItem('refreshToken');
            setUser(null);
            // redirect to login using replace to avoid back navigation to protected pages
            if (typeof window !== 'undefined') window.location.replace('/login');
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
        <userContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </userContext.Provider>
    );
}

export function useAuth() {
    return useContext(userContext);
}

export default AuthContext;
