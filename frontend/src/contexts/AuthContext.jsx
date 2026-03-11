import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // ── Step 1: Restore from localStorage immediately (no flicker) ──────
            const savedUser = localStorage.getItem('user');
            const savedAvatar = localStorage.getItem('userAvatar');

            if (!savedUser) {
                // No saved session — skip the network call entirely.
                // This eliminates the 404 noise for unauthenticated visitors.
                setLoading(false);
                return;
            }

            // Hydrate state instantly from localStorage while we validate
            const parsedUser = JSON.parse(savedUser);
            const hydratedUser = savedAvatar ? { ...parsedUser, avatar: savedAvatar } : parsedUser;
            setUser(hydratedUser);

            // ── Step 2: Validate the session cookie with the backend ─────────────
            // Only fires when there's a saved user (cookie likely exists).
            const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });

            if (res.ok) {
                const data = await res.json();
                // Merge fresh server data with locally stored avatar
                const freshUser = savedAvatar ? { ...data.user, avatar: savedAvatar } : data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            } else {
                // Token expired or backend restarted (in-memory DB reset) —
                // silently log the user out on the frontend.
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('userAvatar');
            }
        } catch {
            // Network error — keep the localStorage user so the UI doesn't break
            // if the backend is temporarily unreachable.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const updateAvatar = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file provided'));
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                localStorage.setItem('userAvatar', dataUrl);
                setUser(prev => {
                    const updated = { ...prev, avatar: dataUrl };
                    localStorage.setItem('user', JSON.stringify(updated));
                    return updated;
                });
                resolve(dataUrl);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const removeAvatar = () => {
        localStorage.removeItem('userAvatar');
        setUser(prev => {
            if (!prev) return prev;
            const { avatar, ...rest } = prev;
            localStorage.setItem('user', JSON.stringify(rest));
            return rest;
        });
    };

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                return data.user;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const signup = async (name, email, password, role = 'student') => {
        try {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                return data.user;
            } else {
                throw new Error(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const updateProfile = async (formData) => {
        const res = await fetch(`${API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            setUser(data.user);
            return data.user;
        } else {
            throw new Error(data.error || 'Update failed');
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    const forgotPassword = async (email) => {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
        return data;
    };

    const resetPassword = async (token, password) => {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, updateAvatar, removeAvatar, forgotPassword, resetPassword, loading }}>
            {loading ? (
                <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                    <div className="animate-pulse">Loading app...</div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
