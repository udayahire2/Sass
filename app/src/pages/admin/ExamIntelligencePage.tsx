import React, { useState } from 'react';
import { Sparkles, Plus, BookOpen, Layers, Flame, Zap, HelpCircle } from 'lucide-react';
import { ExamIntelligenceWidget } from '@/components/study-materials/ExamIntelligenceWidget';
import { QuestionPaperTaggingModal } from './QuestionPaperTaggingModal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

const COMMON_SUBJECTS = [
    'Data Structures',
    'Operating Systems',
    'Computer Networks',
    'Database Management Systems',
    'Software Engineering',
    'Object Oriented Programming',
    'Theory of Computation',
    'Artificial Intelligence',
];

export default function ExamIntelligencePage() {
    const [selectedSubject, setSelectedSubject] = useState<string>('Data Structures');
    const [customSubject, setCustomSubject] = useState<string>('');
    const [showTaggingModal, setShowTaggingModal] = useState<boolean>(false);

    const activeSubject = customSubject.trim() || selectedSubject;

    return (
        <div className="space-y-6">
            {/* Header Banner Card */}
            <Card>
                <CardHeader>
                    <div>
                        <div className="mb-2">
                            <Badge variant="info" size="lg">
                                <Sparkles />
                                <span>Exam-Pattern Intelligence Manager</span>
                            </Badge>
                        </div>
                        <CardTitle>NMU Question Paper Frequency Analytics</CardTitle>
                        <CardDescription>
                            Manage past year question topic occurrences, weightages, and priority tags to help students target high-yield exam topics.
                        </CardDescription>
                    </div>

                    <CardAction>
                        <Button variant="default" onClick={() => setShowTaggingModal(true)}>
                            <Plus />
                            <span>Tag New PYQ Question</span>
                        </Button>
                    </CardAction>
                </CardHeader>
            </Card>

            {/* Subject Selector Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <BookOpen />
                            <span className="font-semibold text-sm">Target Subject:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <NativeSelect
                                value={selectedSubject}
                                onChange={(e) => {
                                    setSelectedSubject(e.target.value);
                                    setCustomSubject('');
                                }}
                            >
                                {COMMON_SUBJECTS.map((sub) => (
                                    <NativeSelectOption key={sub} value={sub}>
                                        {sub}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>

                            <span className="text-xs text-muted-foreground hidden sm:inline">or Custom:</span>

                            <div className="w-48">
                                <Input
                                    type="text"
                                    placeholder="Type custom subject..."
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Intelligence Display Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Intelligence Widget Column */}
                <div className="lg:col-span-2 space-y-6">
                    <ExamIntelligenceWidget
                        subject={activeSubject}
                        onOpenTaggingModal={() => setShowTaggingModal(true)}
                        userRole="admin"
                    />
                </div>

                {/* Guidelines & Priority Info Side Panel */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Layers />
                                <CardTitle>How Priority Tiers Work</CardTitle>
                            </div>
                            <CardDescription>
                                Questions are automatically categorized into 3 priority tiers based on frequency across NMU question papers:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 border rounded-xl space-y-1">
                                <Badge variant="destructive">
                                    <Flame />
                                    <span>High Priority</span>
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                    Appeared in ≥ 60% papers or average ≥ 6 marks.
                                </div>
                            </div>

                            <div className="p-3 border rounded-xl space-y-1">
                                <Badge variant="warning">
                                    <Zap />
                                    <span>Medium Priority</span>
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                    Appeared in 30% - 59% papers.
                                </div>
                            </div>

                            <div className="p-3 border rounded-xl space-y-1">
                                <Badge variant="outline">
                                    <HelpCircle />
                                    <span>Regular Topic</span>
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                    Low occurrence frequency.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tagging Modal */}
            <QuestionPaperTaggingModal
                isOpen={showTaggingModal}
                onClose={() => setShowTaggingModal(false)}
                initialSubject={activeSubject}
            />
        </div>
    );
}
