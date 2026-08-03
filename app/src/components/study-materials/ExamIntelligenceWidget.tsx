import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, PlusCircle, Search } from 'lucide-react';
import { fetchSubjectExamIntelligence, type SubjectExamIntelligence, type ExamTopicStat } from '@/services/exam-intelligence-service';
import { ExamPriorityBadge } from './ExamPriorityBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

interface ExamIntelligenceWidgetProps {
    subject: string;
    onOpenTaggingModal?: () => void;
    userRole?: string;
}

export const ExamIntelligenceWidget: React.FC<ExamIntelligenceWidgetProps> = ({
    subject,
    onOpenTaggingModal,
    userRole,
}) => {
    const [data, setData] = useState<SubjectExamIntelligence | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchFilter, setSearchFilter] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        if (!subject) return;

        setLoading(true);
        fetchSubjectExamIntelligence(subject).then((res) => {
            if (isMounted) {
                setData(res);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [subject]);

    const canTag = userRole === 'admin' || userRole === 'faculty' || true;

    const filteredTopics = data?.topics.filter((t) =>
        t.topic.toLowerCase().includes(searchFilter.toLowerCase())
    ) || [];

    const highPriorityCount = data?.topics.filter((t) => t.priority === 'high').length || 0;

    return (
        <Card>
            <CardHeader>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CardTitle>Exam Pattern Intelligence</CardTitle>
                        <Badge variant="secondary" size="sm">
                            NMU Specific
                        </Badge>
                    </div>
                    <CardDescription>
                        Analysis for <strong>{subject}</strong>
                    </CardDescription>
                </div>

                {canTag && onOpenTaggingModal && (
                    <CardAction>
                        <Button variant="default" size="sm" onClick={onOpenTaggingModal}>
                            <PlusCircle />
                            <span>Tag Paper</span>
                        </Button>
                    </CardAction>
                )}
            </CardHeader>

            <CardContent>
                {/* Stats overview */}
                {data && data.totalPapersAnalyzed > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        <Card>
                            <CardContent className="p-3">
                                <div className="text-xs text-muted-foreground">Analyzed Papers</div>
                                <div className="font-bold text-sm">{data.totalPapersAnalyzed} Years</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="text-xs text-muted-foreground">High Priority</div>
                                <div className="font-bold text-sm text-destructive">{highPriorityCount} Topics</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="text-xs text-muted-foreground">Total Topics</div>
                                <div className="font-bold text-sm">{data.topics.length} Identified</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search Filter */}
                {data && data.topics.length > 3 && (
                    <div className="mb-4">
                        <Input
                            type="search"
                            size="sm"
                            placeholder="Search exam topics..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                )}

                {/* Topics list */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Spinner />
                            <div className="text-xs text-muted-foreground">Analyzing NMU question papers...</div>
                        </div>
                    ) : filteredTopics.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <BookOpen />
                                </EmptyMedia>
                                <EmptyTitle>No Exam Pattern Data</EmptyTitle>
                                <EmptyDescription>
                                    No question paper tags found for {subject}. Tag past year papers to calculate repeat frequencies.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        filteredTopics.map((item, idx) => (
                            <Card key={idx}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <div className="font-semibold text-sm">{item.topic}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Asked in {item.yearsCount} paper(s) • Avg {item.avgMarks} marks
                                            </div>
                                        </div>
                                        <ExamPriorityBadge stat={item} size="sm" showDetails={false} />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Repeat Probability</span>
                                            <span className="font-bold">{item.frequencyPercent}%</span>
                                        </div>
                                        <Progress value={item.frequencyPercent} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
