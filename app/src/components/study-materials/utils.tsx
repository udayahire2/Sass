import { FileText, Video, BookOpen, Book } from "lucide-react";

export const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return <FileText className="h-4 w-4" />;
    if (t === 'video') return <Video className="h-4 w-4" />;
    if (t === 'notes') return <BookOpen className="h-4 w-4" />;
    return <Book className="h-4 w-4" />;
};

export const getResourceColor = (type: string) => {
    const t = type.toLowerCase();
    switch (t) {
        case 'video': return { bg: 'bg-red-500/10', text: 'text-red-500', ring: 'ring-red-500/20' };
        case 'pdf': return { bg: 'bg-blue-500/10', text: 'text-blue-500', ring: 'ring-blue-500/20' };
        case 'notes': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/20' };
        default: return { bg: 'bg-primary/10', text: 'text-primary', ring: 'ring-primary/20' };
    }
};
