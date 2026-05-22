import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { buildApiUrl, parseApiData, buildAvatarUrl } from "@/services/api"

export interface User {
    name: string
    email: string
    avatar?: string
    avatarUrl?: string
    role?: 'student' | 'faculty' | 'admin'
}

function getStoredUser() {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as User;
    } catch (error) {
        console.error("Failed to parse stored user", error);
        return null;
    }
}

/**
 * Hook to manage user authentication state from localStorage
 * This is a temporary solution until proper AuthContext is implemented
 */
export function useLocalAuth() {
    const [user, setUser] = useState<User | null>(() => getStoredUser())
    const navigate = useNavigate()

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }, [navigate])

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!token || !storedUser) {
                return;
            }

            try {
                // Optimistically set user from local storage
                setUser(JSON.parse(storedUser));

                const res = await fetch(buildApiUrl('/auth/me'), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    const currentUser = parseApiData<User | null>(data, null) ?? (data.user as User | null);
                    if (data.success && currentUser) {
                        if (currentUser.avatar && currentUser.avatar.startsWith('/')) {
                            currentUser.avatar = buildAvatarUrl(currentUser.avatar);
                        } else if (currentUser.avatarUrl && currentUser.avatarUrl.startsWith('/')) {
                            currentUser.avatar = buildAvatarUrl(currentUser.avatarUrl);
                        }
                        setUser(currentUser);
                        localStorage.setItem('user', JSON.stringify(currentUser));
                    }
                } else {
                    // Token invalid or expired
                    console.error("Session verification failed", res.status);
                    logout();
                }
            } catch (error) {
                console.error("Auth verification error", error);
                // Don't logout immediately on network error, keep local state
            }
        };

        verifySession();

        const handleAuthChange = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user on auth change", e);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, [logout]);

    const getInitials = (name: string) => {
        if (!name) return "U"
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    }

    return {
        user,
        logout,
        getInitials,
        isAuthenticated: !!user
    }
}
