import { buildApiUrl, getAuthHeaders, getErrorMessage, parseApiData } from './api';

const API_URL = buildApiUrl('/study-materials');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FacultyStats {
    total_uploaded: number;
    approved_count: number;
    pending_count: number;
    rejected_count: number;
    feedback_given_count: number;
}

export interface MaterialFeedback {
    id: string;
    studyMaterialId: string;
    reviewerUserId: string;
    reviewerName: string;
    feedbackText: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Faculty Stats ────────────────────────────────────────────────────────────

export const fetchFacultyStats = async (): Promise<FacultyStats> => {
    const empty: FacultyStats = {
        total_uploaded: 0,
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        feedback_given_count: 0,
    };
    try {
        const response = await fetch(`${API_URL}/faculty/stats`, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch faculty stats'));
        }
        return parseApiData<FacultyStats>(payload, empty);
    } catch (error) {
        console.error('Error fetching faculty stats:', error);
        return empty;
    }
};

// ─── Feedback ─────────────────────────────────────────────────────────────────

export const fetchMaterialFeedback = async (
    materialId: string,
): Promise<MaterialFeedback[]> => {
    try {
        const response = await fetch(`${API_URL}/${materialId}/feedback`, {
            headers: getAuthHeaders(),
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch feedback'));
        }
        return parseApiData<MaterialFeedback[]>(payload, []);
    } catch (error) {
        console.error('Error fetching material feedback:', error);
        return [];
    }
};

export const submitMaterialFeedback = async (
    materialId: string,
    data: { feedback_text: string; rating: number },
): Promise<{ success: boolean; message: string; data: MaterialFeedback | null }> => {
    try {
        const response = await fetch(`${API_URL}/${materialId}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        });
        const payload = await response.json();
        return {
            success: response.ok && payload.success !== false,
            message: payload.message ?? (response.ok ? 'Feedback submitted' : 'Failed to submit feedback'),
            data: parseApiData<MaterialFeedback | null>(payload, null),
        };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, message: 'Something went wrong', data: null };
    }
};
