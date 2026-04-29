export const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

export const buildApiUrl = (path: string): string => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const getApiOrigin = (): string => {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return new URL(API_BASE_URL, window.location.origin).origin;
    } catch {
        return window.location.origin;
    }
};

export const buildAssetUrl = (path: string): string => {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiOrigin()}${normalizedPath}`;
};

export const parseApiData = <T>(payload: unknown, fallback: T): T => {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        const data = (payload as { data?: T | null }).data;
        return (data ?? fallback) as T;
    }

    return (payload ?? fallback) as T;
};

export const getErrorMessage = (payload: unknown, fallback = 'Request failed'): string => {
    if (payload && typeof payload === 'object') {
        if ('message' in payload && typeof payload.message === 'string' && payload.message.trim()) {
            return payload.message;
        }

        if ('error' in payload && typeof payload.error === 'string' && payload.error.trim()) {
            return payload.error;
        }
    }

    return fallback;
};

export const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
};
