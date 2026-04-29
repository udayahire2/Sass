import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/syllabus');

export interface SyllabusItem {
    id?: string;
    _id?: string;
    title: string;
    code: string;
    branch: string;
    semester: string;
    type: 'pdf' | 'markdown';
    credits: number;
    contentUrl: string;
    createdAt?: string;
    updatedAt?: string;
}

export const fetchSyllabus = async (): Promise<SyllabusItem[]> => {
    try {
        const response = await fetch(API_URL);
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch syllabus'));
        }

        return parseApiData<SyllabusItem[]>(payload, []);
    } catch (error) {
        console.error('Error fetching syllabus:', error);
        return [];
    }
};

export const createSyllabus = async (
    data: FormData | Omit<SyllabusItem, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<SyllabusItem | null> => {
    try {
        const isFormData = data instanceof FormData;
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: isFormData
                ? getAuthHeaders()
                : {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
            body: isFormData ? data : JSON.stringify(data),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to create syllabus'));
        }

        return parseApiData<SyllabusItem | null>(payload, null);
    } catch (error) {
        console.error('Error creating syllabus:', error);
        return null;
    }
};

export const deleteSyllabus = async (id: string): Promise<boolean> => {
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
        console.error('Error deleting syllabus:', error);
        return false;
    }
};
