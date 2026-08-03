import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createQuestionTag, fetchPaperTags, deleteQuestionTag, type TagOccurrenceInput } from '@/services/exam-intelligence-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionPaperTaggingModalProps {
    isOpen: boolean;
    onClose: () => void;
    paperId?: string;
    initialSubject?: string;
}

export const QuestionPaperTaggingModal: React.FC<QuestionPaperTaggingModalProps> = ({
    isOpen,
    onClose,
    paperId,
    initialSubject = 'Data Structures',
}) => {
    const [subject, setSubject] = useState<string>(initialSubject);
    const [topic, setTopic] = useState<string>('');
    const [year, setYear] = useState<number>(new Date().getFullYear() - 1);
    const [examType, setExamType] = useState<string>('End Sem');
    const [marks, setMarks] = useState<number>(7);
    const [questionNumber, setQuestionNumber] = useState<string>('');

    const [existingTags, setExistingTags] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const loadTags = async () => {
        if (paperId) {
            const tags = await fetchPaperTags(paperId);
            setExistingTags(tags);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (initialSubject) setSubject(initialSubject);
            loadTags();
        }
    }, [isOpen, paperId, initialSubject]);

    if (!isOpen) return null;

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!subject.trim() || !topic.trim()) {
            setErrorMessage('Subject and topic names are required.');
            return;
        }

        setLoading(true);
        const payload: TagOccurrenceInput = {
            subject: subject.trim(),
            topic: topic.trim(),
            year: Number(year),
            examType,
            marks: Number(marks),
            paperId,
            questionNumber: questionNumber.trim(),
        };

        const res = await createQuestionTag(payload);
        setLoading(false);

        if (res.success) {
            setSuccessMessage(`Successfully tagged "${topic}"!`);
            setTopic('');
            setQuestionNumber('');
            loadTags();
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            setErrorMessage(res.message || 'Failed to add tag');
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        const ok = await deleteQuestionTag(tagId);
        if (ok) {
            loadTags();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} >
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>Exam Topic Tagging</DialogTitle>
                    <DialogDescription>
                        Tag questions to generate Exam-Pattern Intelligence
                    </DialogDescription>
                </DialogHeader>

                {/* Feedback Alerts */}
                {successMessage && (
                    <div className="mb-4">
                        <Badge variant="success" size="lg">
                            <CheckCircle2 />
                            <span>{successMessage}</span>
                        </Badge>
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4">
                        <Badge variant="error" size="lg">
                            <AlertCircle />
                            <span>{errorMessage}</span>
                        </Badge>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAddTag} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel>Subject Name</FieldLabel>
                            <Input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Data Structures"
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Topic / Unit Name</FieldLabel>
                            <Input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. Linked List"
                                required
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <Field>
                            <FieldLabel>Year</FieldLabel>
                            <Input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Exam Type</FieldLabel>
                            <NativeSelect
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                            >
                                <NativeSelectOption value="End Sem">End Sem</NativeSelectOption>
                                <NativeSelectOption value="Mid Sem">Mid Sem</NativeSelectOption>
                                <NativeSelectOption value="Re-Exam">Re-Exam</NativeSelectOption>
                            </NativeSelect>
                        </Field>

                        <Field>
                            <FieldLabel>Marks</FieldLabel>
                            <Input
                                type="number"
                                value={marks}
                                onChange={(e) => setMarks(Number(e.target.value))}
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Q. Number</FieldLabel>
                            <Input
                                type="text"
                                value={questionNumber}
                                onChange={(e) => setQuestionNumber(e.target.value)}
                                placeholder="Q1(a)"
                            />
                        </Field>
                    </div>

                    <Button type="submit" variant="default" disabled={loading}>
                        <Plus />
                        <span>{loading ? 'Adding Tag...' : 'Save Question Topic Tag'}</span>
                    </Button>
                </form>

                {/* Existing Tags List */}
                {paperId && existingTags.length > 0 && (
                    <div className="mt-6 border-t pt-4 space-y-2">
                        <div className="font-semibold text-sm">Tagged Questions in this Paper ({existingTags.length})</div>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {existingTags.map((t) => (
                                <Card key={t._id}>
                                    <CardContent className="p-3 flex items-center justify-between">
                                        <div className="text-xs">
                                            <strong>{t.topic}</strong> ({t.year} {t.examType} {t.questionNumber ? `- ${t.questionNumber}` : ''} | {t.marks} Marks)
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteTag(t._id)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter variant="bare">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
