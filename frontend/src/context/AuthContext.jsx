import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setUser({ username: decoded.username, role: decoded.role });
            } else {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/auth/login/', {
                username,
                password
            });
            const token = response.data.access;
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            const decoded = parseJwt(token);
            setUser({ username: decoded?.username || username, role: decoded?.role || 'customer' });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('http://localhost:8000/api/auth/register/', userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
