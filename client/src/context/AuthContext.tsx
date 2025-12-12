/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

// Define types
interface User {
    _id: string;
    name: string;
    role: 'admin' | 'hr' | 'employee';
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
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
                    const response = await axios.get('http://localhost:5000/api/auth/verify', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setUser(response.data.user);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                     // Handle Axios specific error if needed
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = (user: User) => {
        setUser(user);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <userContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </userContext.Provider>
    );
};

export const useAuth = () => useContext(userContext);
export default AuthContext;
