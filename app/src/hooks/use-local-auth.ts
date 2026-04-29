import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { buildApiUrl, parseApiData } from "@/services/api"

export interface User {
    name: string
    email: string
    avatar?: string
    role?: 'student' | 'faculty' | 'admin'
}

/**
 * Hook to manage user authentication state from localStorage
 * This is a temporary solution until proper AuthContext is implemented
 */
export function useLocalAuth() {
    const [user, setUser] = useState<User | null>(null)
    const navigate = useNavigate()

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
    }, []);

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }

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
