export interface StudyMaterial {
    id: string | number;
    type: string;
    title: string;
    subject: string;
    author: string;
    branch: string;
    semester: string;
    rating?: number;
    description?: string;
    views?: number | string;
    duration?: string;
    isNew?: boolean;
    url?: string;
    content?: string;
    updatedAt?: string;
}
