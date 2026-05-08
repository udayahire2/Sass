import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/content');

export type StudyContentType = 'study_stock' | 'imp_questions' | 'lecture_notes' | 'practice_quizzes';
export type StudyContentRole = 'student' | 'faculty' | 'admin';
export type StudyContentSort = 'date_desc' | 'date_asc';

export interface StudyContent {
    _id: string;
    id: string;
    title: string;
    type: StudyContentType;
    uploaderRole: StudyContentRole;
    uploaderName: string;
    uploaderAvatar?: string | null;
    uploaderUserId?: string;
    fileUrl: string;
    description: string;
    resourceFormat?: string | null;
    originalFilename?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    createdAt: string;
    updatedAt?: string;
}

export interface FetchContentParams {
    type?: StudyContentType;
    role?: StudyContentRole;
    sort?: StudyContentSort;
}

const buildQuery = (params: FetchContentParams = {}) => {
    const query = new URLSearchParams();

    if (params.type) query.set('type', params.type);
    if (params.role) query.set('role', params.role);
    if (params.sort) query.set('sort', params.sort);

    const value = query.toString();
    return value ? `?${value}` : '';
};

export const fetchContent = async (params: FetchContentParams = {}): Promise<StudyContent[]> => {
    try {
        const response = await fetch(`${API_URL}${buildQuery(params)}`);
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch content'));
        }

        return parseApiData<StudyContent[]>(payload, []);
    } catch (error) {
        console.error('Error fetching content:', error);
        return [];
    }
};

export const uploadContent = async (formData: FormData): Promise<StudyContent | null> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to upload content'));
        }

        return parseApiData<StudyContent | null>(payload, null);
    } catch (error) {
        console.error('Error uploading content:', error);
        return null;
    }
};

export const deleteContent = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to delete content'));
        }

        return true;
    } catch (error) {
        console.error('Error deleting content:', error);
        return false;
    }
};

export const buildContentFileUrl = (content: Pick<StudyContent, 'id' | 'fileUrl'>): string => {
    if (/^https?:\/\//i.test(content.fileUrl)) {
        return content.fileUrl;
    }

    return buildApiUrl(`/content/${encodeURIComponent(content.id)}/file`);
};

