import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/admin');

export interface DashboardStats {
    totalUsers: number;
    totalResources: number;
    newUsers: number;
    newResources: number;
}

export interface AdminProfile {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
}

export const fetchDashboardStats = async (): Promise<DashboardStats | null> => {
    try {
        const response = await fetch(`${API_URL}/stats`, {
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(getErrorMessage(data, 'Failed to fetch stats'));
        }

        return parseApiData<DashboardStats | null>(data, null);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
};

export const fetchProfile = async (): Promise<AdminProfile | null> => {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(getErrorMessage(data, 'Failed to fetch profile'));
        }

        return parseApiData<AdminProfile | null>(data, null);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
};

export const updateProfile = async (data: Partial<AdminProfile>): Promise<AdminProfile | null> => {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const payload = await response.json();
            throw new Error(getErrorMessage(payload, 'Failed to update profile'));
        }

        const payload = await response.json();
        return parseApiData<AdminProfile | null>(payload, null);
    } catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
};
