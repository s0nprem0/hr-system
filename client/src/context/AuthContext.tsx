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

export const AuthContext = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await api.get('/api/auth/verify');
                    if (response.data?.success) {
                        setUser(response.data.user);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = (user: User, token?: string) => {
        setUser(user);
        try {
            if (token) {
                localStorage.setItem('token', token);
            }
        } catch (e) {}
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('token');
        } catch (e) {}
    };

    return (
        <userContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </userContext.Provider>
    );
};

export const useAuth = () => useContext(userContext);
export default AuthContext;
