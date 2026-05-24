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

const toAbsoluteUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url) || typeof window === 'undefined') {
        return url;
    }

    return new URL(url, window.location.origin).toString();
};

export type AssetUrlOptions = {
    studyMaterialId?: string;
    syllabusId?: string;
};

export const buildAssetUrl = (path: string, options: AssetUrlOptions = {}): string => {
    if (!path) {
        return '';
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (options.studyMaterialId) {
        return toAbsoluteUrl(buildApiUrl(`/files/${encodeURIComponent(options.studyMaterialId)}`));
    }

    if (options.syllabusId) {
        return toAbsoluteUrl(buildApiUrl(`/syllabus/${encodeURIComponent(options.syllabusId)}/file`));
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiOrigin()}${normalizedPath}`;
};

/**
 * Resolve an avatar path (relative or absolute) to a full URL
 * pointing to the backend static file server.
 * Always uses the API origin so cross-origin avatar images load correctly.
 */
export const buildAvatarUrl = (path: string): string => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;  // already absolute
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiOrigin()}${normalizedPath}`;
};

export const fetchAssetBlobUrl = async (url: string): Promise<string> => {
    const response = await fetch(url, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to load file');
    }

    return URL.createObjectURL(await response.blob());
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

export type Branch = 'Computer' | 'IT' | 'Mechanical' | 'Civil' | 'Electrical';

export interface Topic {
    id: string;
    _id?: string;
    title: string;
    description: string;
    contentMarkdown?: string;
    markdownContent?: string;
    videoUrl?: string | null;
    youtubeVideoId?: string | null;
    videoDuration?: string;
    estimatedTime?: string;
    summaryPoints: string[];
    unit?: {
        id: string;
        number: number;
        title: string;
    };
    subject?: {
        id: string;
        name: string;
        title?: string;
        code: string;
        branch: string;
        semester: number;
    };
}

export interface Unit {
    id: string;
    _id?: string;
    number: number;
    unitNumber?: number;
    title: string;
    description?: string | null;
    topics: Topic[];
}

export interface QuestionPaper {
    id: string;
    year: string;
    term: 'Summer' | 'Winter';
    type: 'Unsolved' | 'Solved' | 'Model' | 'Previous';
    pdfUrl: string;
    pages?: number;
    fileSize?: string;
}

export interface Subject {
    id: string;
    _id?: string;
    name: string;
    title?: string;
    code: string;
    semester: number;
    branch: string;
    credits?: number;
    description?: string | null;
    unitCount?: number;
    topicCount?: number;
    units: Unit[];
    papers: QuestionPaper[];
}

export const BRANCHES: Branch[] = ['Computer', 'IT', 'Mechanical', 'Civil', 'Electrical'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const requestApiData = async <T>(path: string, fallback: T, message: string): Promise<T> => {
    const response = await fetch(buildApiUrl(path));
    const payload = await response.json();

    if (!response.ok || payload.success === false) {
        throw new Error(getErrorMessage(payload, message));
    }

    return parseApiData<T>(payload, fallback);
};

export const fetchSubjectsByBranchSemester = async (
    branch: string,
    semester: string
): Promise<Subject[]> => {
    const params = new URLSearchParams({ branch, semester });
    return requestApiData<Subject[]>(`/subjects?${params.toString()}`, [], 'Failed to fetch subjects');
};

export const fetchSubjectUnits = async (subjectId: string): Promise<Unit[]> => {
    return requestApiData<Unit[]>(`/subjects/${subjectId}/units`, [], 'Failed to fetch subject units');
};

export const fetchTopicById = async (topicId: string): Promise<Topic | null> => {
    return requestApiData<Topic | null>(`/topics/${topicId}`, null, 'Failed to fetch topic');
};

export const updateTopic = async (topicId: string, data: { title?: string; content_markdown?: string }): Promise<Topic> => {
    const response = await fetch(buildApiUrl(`/topics/${topicId}`), {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to update topic'));
    return parseApiData<Topic>(payload, {} as Topic);
};

// --- Notes API ---
export interface Note {
    id: string;
    user_id: string;
    topic_id?: string | null;
    title: string;
    content_markdown: string;
    created_at: string;
    updated_at: string;
}

export const getNotes = async (): Promise<Note[]> => {
    const response = await fetch(buildApiUrl('/notes'), {
        headers: getAuthHeaders(),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to fetch notes'));
    return parseApiData<Note[]>(payload, []);
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const response = await fetch(buildApiUrl(`/notes/${id}`), {
        headers: getAuthHeaders(),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to fetch note'));
    return parseApiData<Note | null>(payload, null);
};

export const createNote = async (data: { title: string; content_markdown: string; topic_id?: string | null }): Promise<Note> => {
    const response = await fetch(buildApiUrl('/notes'), {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to create note'));
    return parseApiData<Note>(payload, {} as Note);
};

export const updateNote = async (id: string, data: { title?: string; content_markdown?: string; topic_id?: string | null }): Promise<Note> => {
    const response = await fetch(buildApiUrl(`/notes/${id}`), {
        method: 'PUT',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to update note'));
    return parseApiData<Note>(payload, {} as Note);
};

export const deleteNote = async (id: string): Promise<void> => {
    const response = await fetch(buildApiUrl(`/notes/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to delete note'));
};

export const renameNote = async (id: string, title: string): Promise<Note> => {
    const response = await fetch(buildApiUrl(`/notes/${id}/rename`), {
        method: 'PATCH',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(getErrorMessage(payload, 'Failed to rename note'));
    return parseApiData<Note>(payload, {} as Note);
};
