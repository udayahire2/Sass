import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/study-materials');

export interface StudyMaterial {
    _id: string;
    id?: string;
    title: string;
    subject: string;
    branch?: string;
    type: 'PDF' | 'PPT' | 'DOCX' | 'Markdown' | 'Video' | 'Notes';
    url?: string;
    filePath?: string;
    originalFilename?: string;
    mimeType?: string;
    fileSize?: number;
    status: 'pending' | 'approved' | 'rejected';
    author: string;
    createdAt: string;
    updatedAt?: string;
}

export const fetchApprovedMaterials = async (): Promise<StudyMaterial[]> => {
    try {
        const response = await fetch(`${API_URL}/approved`);
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch materials'));
        }

        return parseApiData<StudyMaterial[]>(payload, []);
    } catch (error) {
        console.error('Error fetching approved materials:', error);
        return [];
    }
};

export const fetchPendingMaterials = async (): Promise<StudyMaterial[]> => {
    try {
        const response = await fetch(`${API_URL}/pending`, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch pending materials'));
        }

        return parseApiData<StudyMaterial[]>(payload, []);
    } catch (error) {
        console.error('Error fetching pending materials:', error);
        return [];
    }
};

export const fetchRejectedMaterials = async (): Promise<StudyMaterial[]> => {
    try {
        const response = await fetch(`${API_URL}/rejected`, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch rejected materials'));
        }

        return parseApiData<StudyMaterial[]>(payload, []);
    } catch (error) {
        console.error('Error fetching rejected materials:', error);
        return [];
    }
};

export const uploadMaterial = async (formData: FormData): Promise<StudyMaterial | null> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to upload material'));
        }

        return parseApiData<StudyMaterial | null>(payload, null);
    } catch (error) {
        console.error('Error uploading material:', error);
        return null;
    }
};

export const fetchUserMaterials = async (): Promise<StudyMaterial[]> => {
    try {
        // Try dedicated endpoint first
        const response = await fetch(`${API_URL}/my`, {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            const payload = await response.json();
            if (payload.success !== false) {
                return parseApiData<StudyMaterial[]>(payload, []);
            }
        }

        // Fallback: aggregate from all three status endpoints
        const [pending, approved, rejected] = await Promise.all([
            fetchPendingMaterials(),
            fetchApprovedMaterials(),
            fetchRejectedMaterials(),
        ]);

        return [...pending, ...approved, ...rejected];
    } catch (error) {
        console.error('Error fetching user materials:', error);

        // Last resort fallback
        try {
            const [pending, approved, rejected] = await Promise.all([
                fetchPendingMaterials(),
                fetchApprovedMaterials(),
                fetchRejectedMaterials(),
            ]);
            return [...pending, ...approved, ...rejected];
        } catch {
            return [];
        }
    }
};

export const updateMaterialStatus = async (
    id: string,
    status: 'approved' | 'rejected'
): Promise<StudyMaterial | null> => {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ status }),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to update status'));
        }

        return parseApiData<StudyMaterial | null>(payload, null);
    } catch (error) {
        console.error('Error updating material status:', error);
        return null;
    }
};

export const fetchBookmarkedMaterials = async (): Promise<StudyMaterial[]> => {
    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch bookmarked materials'));
        }

        return parseApiData<StudyMaterial[]>(payload, []);
    } catch (error) {
        console.error('Error fetching bookmarked materials:', error);
        return [];
    }
};

export const toggleBookmark = async (id: string): Promise<{ success: boolean; bookmarked?: boolean }> => {
    try {
        const response = await fetch(`${API_URL}/${id}/bookmark`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to toggle bookmark'));
        }

        return { success: true, bookmarked: payload.bookmarked };
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return { success: false };
    }
};
