import { buildApiUrl, getAuthHeaders, getErrorMessage } from './api';

export interface ExamTopicStat {
    topic: string;
    occurrencesCount: number;
    yearsCount: number;
    totalMarks: number;
    avgMarks: number;
    frequencyPercent: number;
    priority: 'high' | 'medium' | 'regular';
    yearsList: number[];
    sampleQuestions?: string[];
}

export interface SubjectExamIntelligence {
    success: boolean;
    subject: string;
    totalPapersAnalyzed: number;
    yearsAnalyzed: number[];
    topics: ExamTopicStat[];
}

export interface TagOccurrenceInput {
    subject: string;
    topic: string;
    year: number;
    examType?: string;
    marks?: number;
    paperId?: string;
    questionNumber?: string;
}

const API_BASE = buildApiUrl('/exam-intelligence');

export const fetchSubjectExamIntelligence = async (subject: string): Promise<SubjectExamIntelligence | null> => {
    try {
        const response = await fetch(`${API_BASE}/subject/${encodeURIComponent(subject)}`);
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch exam intelligence'));
        }
        return payload;
    } catch (error) {
        console.error('Error fetching subject exam intelligence:', error);
        return null;
    }
};

export const createQuestionTag = async (input: TagOccurrenceInput): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/tag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(input),
        });
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(payload, 'Failed to save question tag'));
        }
        return payload;
    } catch (error: any) {
        console.error('Error saving question tag:', error);
        return { success: false, message: error.message || 'Error saving tag' };
    }
};

export const fetchPaperTags = async (paperId: string): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE}/paper/${paperId}`);
        const payload = await response.json();
        if (!response.ok) {
            throw new Error(getErrorMessage(payload, 'Failed to fetch paper tags'));
        }
        return payload.data || [];
    } catch (error) {
        console.error('Error fetching paper tags:', error);
        return [];
    }
};

export const deleteQuestionTag = async (tagId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/tag/${tagId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting tag:', error);
        return false;
    }
};
