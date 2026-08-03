import React from 'react';
import { Flame, Zap, HelpCircle } from 'lucide-react';
import type { ExamTopicStat } from '@/services/exam-intelligence-service';
import { Badge } from '@/components/ui/badge';

interface ExamPriorityBadgeProps {
    stat?: ExamTopicStat;
    priority?: 'high' | 'medium' | 'regular';
    yearsCount?: number;
    totalPapers?: number;
    avgMarks?: number;
    size?: 'sm' | 'default' | 'lg';
    showDetails?: boolean;
}

export const ExamPriorityBadge: React.FC<ExamPriorityBadgeProps> = ({
    stat,
    priority = stat?.priority || 'regular',
    yearsCount = stat?.yearsCount || 0,
    avgMarks = stat?.avgMarks || 0,
    size = 'default',
    showDetails = true,
}) => {
    if (priority === 'regular' && !stat) {
        return null;
    }

    const isHigh = priority === 'high';
    const isMedium = priority === 'medium';

    if (isHigh) {
        return (
            <Badge variant="destructive" size={size}>
                <Flame />
                <span>High Exam Priority</span>
                {showDetails && yearsCount > 0 && (
                    <span>
                        ({yearsCount}x asked {avgMarks > 0 ? `- ${avgMarks}m` : ''})
                    </span>
                )}
            </Badge>
        );
    }

    if (isMedium) {
        return (
            <Badge variant="warning" size={size}>
                <Zap />
                <span>Medium Priority</span>
                {showDetails && yearsCount > 0 && (
                    <span>({yearsCount}x asked)</span>
                )}
            </Badge>
        );
    }

    return (
        <Badge variant="outline" size={size}>
            <HelpCircle />
            <span>Regular Topic</span>
        </Badge>
    );
};
