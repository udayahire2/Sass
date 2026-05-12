import { buildApiUrl, parseApiData, getAuthHeaders, getErrorMessage } from "./api";

export interface PlatformFeedback {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    type: 'bug' | 'feature' | 'general' | 'other';
    message: string;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
    updated_at: string;
}

export async function submitPlatformFeedback(data: { type: string; message: string }) {
    try {
        const response = await fetch(buildApiUrl('/feedback'), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(result, 'Failed to submit feedback'));
        }

        return result.success;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return false;
    }
}

export async function fetchPlatformFeedback(): Promise<PlatformFeedback[]> {
    try {
        const response = await fetch(buildApiUrl('/feedback'), {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(result, 'Failed to fetch feedback'));
        }

        return parseApiData<PlatformFeedback[]>(result, []) || [];
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
    }
}

export async function updatePlatformFeedbackStatus(id: string, status: 'pending' | 'reviewed' | 'resolved') {
    try {
        const response = await fetch(buildApiUrl(`/feedback/${id}/status`), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(result, 'Failed to update feedback status'));
        }

        return result.success;
    } catch (error) {
        console.error("Error updating feedback status:", error);
        return false;
    }
}
