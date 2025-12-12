/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../utils/api';

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
                const token = localStorage.getItem('token');
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
            try {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            } catch {
                // ignore
            }
            setUser(null);
            // redirect to login
            if (typeof window !== 'undefined') window.location.href = '/login';
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
                localStorage.setItem('token', token);
            }
        } catch {
            // ignore storage errors
        }
    }

    function logout() {
        setUser(null);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        } catch {
            // ignore storage errors
        }
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
