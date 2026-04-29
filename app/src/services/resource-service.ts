import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/resources');

export interface ResourceItem {
    _id: string;
    title: string;
    subject: string;
    semester: string;
    branch: string;
    type: 'pdf' | 'video' | 'doc' | 'markdown';
    description: string;
    category: 'Notes' | 'PYQ' | 'Syllabus' | 'Lab Manual' | 'Reference Book' | 'Other';
    pattern?: string;
    unit?: string;
    year: 'FE' | 'SE' | 'TE' | 'BE';
    author: string;
    url: string;
    createdAt?: string;
}

export type CreateResourcePayload = Omit<ResourceItem, '_id' | 'createdAt'>;

export const fetchResources = async (): Promise<ResourceItem[]> => {
    try {
        const response = await fetch(API_URL, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();

        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch resources'));
        }

        return parseApiData<ResourceItem[]>(payload, []);
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
};

export const createResource = async (
    payload: CreateResourcePayload
): Promise<ResourceItem | null> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(getErrorMessage(data, 'Failed to create resource'));
        }

        return parseApiData<ResourceItem | null>(data, null);
    } catch (error) {
        console.error('Error creating resource:', error);
        return null;
    }
};

export const deleteResource = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (response.status === 204) {
            return true;
        }

        const payload = await response.json();
        return response.ok && payload.success !== false;
    } catch (error) {
        console.error('Error deleting resource:', error);
        return false;
    }
};
