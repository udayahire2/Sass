import { useRef, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, FileCode, Link as LinkIcon, Upload, X, Layers, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createSyllabus } from '@/services/syllabus-service';

const branchOptions = ['Computer', 'IT', 'Civil', 'Mechanical', 'Electrical', 'ENTC', 'Both'];
const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];
const yearOptions = ['1', '2', '3', '4'];

type SyllabusTypeMode = 'subject' | 'program';
type SourceMode = 'upload' | 'link';

const formSchema = z.object({
    syllabusType: z.enum(['subject', 'program']),
    title: z.string().optional(),
    subjectName: z.string().optional(),
    code: z.string().optional(),
    subjectCode: z.string().optional(),
    courseCode: z.string().optional(),
    program: z.string().min(1, { message: 'Program/Branch is required.' }),
    branch: z.string().optional(),
    semester: z.string().optional(),
    semesters: z.string().optional(),
    year: z.string().optional(),
    type: z.enum(['pdf', 'markdown']),
    contentUrl: z.string().optional(),
    description: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.syllabusType === 'program') {
        if (!data.year) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Year is required for program-level syllabus.',
                path: ['year'],
            });
        }
    } else {
        if (!data.subjectName && !data.title) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Subject Name is required.',
                path: ['subjectName'],
            });
        }
        if (!data.subjectCode && !data.code) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Subject Code is required.',
                path: ['subjectCode'],
            });
        }
        if (!data.semester) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Semester is required for subject-level syllabus.',
                path: ['semester'],
            });
        }
    }
});

export default function SyllabusForm({ onSuccess }: { onSuccess: () => void }) {
    const [syllabusTypeMode, setSyllabusTypeMode] = useState<SyllabusTypeMode>('subject');
    const [sourceMode, setSourceMode] = useState<SourceMode>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            syllabusType: 'subject',
            title: '',
            subjectName: '',
            code: '',
            subjectCode: '',
            courseCode: '',
            program: '',
            branch: '',
            semester: '',
            semesters: '',
            year: '',
            type: 'pdf',
            contentUrl: '',
            description: '',
        },
    });

    const selectedType = useWatch({
        control: form.control,
        name: 'type',
    });

    const acceptedExtensions = selectedType === 'pdf' ? '.pdf' : '.md,.markdown,.txt';

    const handleSyllabusTypeChange = (mode: SyllabusTypeMode) => {
        setSyllabusTypeMode(mode);
        form.setValue('syllabusType', mode);
        form.clearErrors();
    };

    const handleSourceModeChange = (mode: SourceMode) => {
        setSourceMode(mode);
        setUploadedFile(null);
        form.setValue('contentUrl', '');
        form.clearErrors('contentUrl');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (file: File | null) => {
        const extension = file?.name.split('.').pop()?.toLowerCase();
        const isValidFile =
            !file ||
            (selectedType === 'pdf' && extension === 'pdf') ||
            (selectedType === 'markdown' && ['md', 'markdown', 'txt'].includes(extension || ''));

        if (!isValidFile) {
            form.setError('contentUrl', {
                type: 'manual',
                message: selectedType === 'pdf'
                    ? 'Please upload a PDF file.'
                    : 'Please upload a Markdown or text file.',
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setUploadedFile(file);
        if (file) {
            form.setValue('contentUrl', file.name);
            form.clearErrors('contentUrl');
        } else {
            form.setValue('contentUrl', '');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFileChange(file);
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (sourceMode === 'upload' && !uploadedFile) {
            form.setError('contentUrl', { type: 'manual', message: 'Please upload a file.' });
            return;
        }

        if (sourceMode === 'link' && (!values.contentUrl || values.contentUrl.trim() === '')) {
            form.setError('contentUrl', { type: 'manual', message: 'Please provide a valid URL.' });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('syllabusType', syllabusTypeMode);

            const title = syllabusTypeMode === 'program'
                ? (values.title || `${values.program} - Year ${values.year} Syllabus`)
                : (values.subjectName || values.title || '');

            const code = syllabusTypeMode === 'program'
                ? (values.courseCode || values.code || '')
                : (values.subjectCode || values.code || '');

            formData.append('title', title);
            formData.append('subjectName', values.subjectName || title);
            formData.append('code', code);
            formData.append('subjectCode', values.subjectCode || code);
            formData.append('courseCode', values.courseCode || code);
            formData.append('program', values.program || '');
            formData.append('branch', values.program || '');

            if (values.semester) formData.append('semester', values.semester);
            if (values.year) formData.append('year', values.year);
            if (values.type) formData.append('type', values.type);
            if (values.description) formData.append('description', values.description);
            if (values.contentUrl) formData.append('contentUrl', values.contentUrl);

            formData.append('sourceMode', sourceMode);

            if (sourceMode === 'upload' && uploadedFile) {
                formData.append('file', uploadedFile);
            }

            const created = await createSyllabus(formData);

            if (created) {
                form.reset();
                setUploadedFile(null);
                setSourceMode('upload');
                onSuccess();
            }
        } catch (err: any) {
            form.setError('root', {
                type: 'server',
                message: err.message || 'Failed to save syllabus. Please check session and retry.',
            });
        }
    }

    const errors = Object.entries(form.formState.errors).reduce((acc, [key, err]) => {
        if (err?.message) acc[key] = err.message;
        return acc;
    }, {} as Record<string, string>);

    return (
        <Form errors={errors} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
                {/* Syllabus Type Scenario Toggle */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Syllabus Mode / Level</label>
                    <div className="flex gap-2 rounded-xl bg-muted/70 p-1 border border-border/60">
                        <Button
                            type="button"
                            variant={syllabusTypeMode === 'subject' ? 'default' : 'ghost'}
                            onClick={() => handleSyllabusTypeChange('subject')}
                            className="flex-1 shadow-none"
                        >
                            <BookOpen className="h-4 w-4 mr-2" /> Subject-Level
                        </Button>
                        <Button
                            type="button"
                            variant={syllabusTypeMode === 'program' ? 'default' : 'ghost'}
                            onClick={() => handleSyllabusTypeChange('program')}
                            className="flex-1 shadow-none"
                        >
                            <Layers className="h-4 w-4 mr-2" /> Program-Level
                        </Button>
                    </div>
                </div>

                <Controller
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                        <Field name="program">
                            <FieldLabel>Program / Branch</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select program / branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchOptions.map((branch) => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch === 'Both' ? '✦ Both (All Branches)' : `${branch} Engineering`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError />
                        </Field>
                    )}
                />

                {syllabusTypeMode === 'subject' && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field name="subjectName">
                                <FieldLabel>Subject Name *</FieldLabel>
                                <Input placeholder="e.g. Data Structures" {...form.register('subjectName')} />
                                <FieldError />
                            </Field>
                            <Field name="subjectCode">
                                <FieldLabel>Subject Code *</FieldLabel>
                                <Input placeholder="e.g. CS301" {...form.register('subjectCode')} />
                                <FieldError />
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Controller
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <Field name="semester">
                                        <FieldLabel>Semester *</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {semesterOptions.map((sem) => (
                                                    <SelectItem key={sem} value={sem}>
                                                        Semester {sem}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError />
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <Field name="year">
                                        <FieldLabel>Year (Optional)</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((yr) => (
                                                    <SelectItem key={yr} value={yr}>
                                                        Year {yr}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError />
                                    </Field>
                                )}
                            />
                        </div>
                    </>
                )}

                {syllabusTypeMode === 'program' && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field name="title">
                                <FieldLabel>Bundle Title (Optional)</FieldLabel>
                                <Input placeholder="e.g. 1st Year Complete Syllabus" {...form.register('title')} />
                                <FieldError />
                            </Field>
                            <Field name="courseCode">
                                <FieldLabel>Course / Bundle Code (Optional)</FieldLabel>
                                <Input placeholder="e.g. COMP-Y1" {...form.register('courseCode')} />
                                <FieldError />
                            </Field>
                        </div>

                        <Controller
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <Field name="year">
                                    <FieldLabel>Program Academic Year *</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select academic year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map((yr) => (
                                                <SelectItem key={yr} value={yr}>
                                                    {yr}st/th Year (Semesters {Number(yr) * 2 - 1} & {Number(yr) * 2})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError />
                                </Field>
                            )}
                        />
                    </>
                )}

                <Field name="description">
                    <FieldLabel>Syllabus Summary / Description</FieldLabel>
                    <Textarea
                        placeholder="Enter course description, learning outcomes, or syllabus details..."
                        className="min-h-20"
                        {...form.register('description')}
                    />
                    <FieldError />
                </Field>

                <Controller
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <Field name="type">
                            <FieldLabel>Document Content Format</FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    handleFileChange(null);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                                    <SelectItem value="markdown">Markdown File (.md)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError />
                        </Field>
                    )}
                />

                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium">Content Source</label>
                    <div className="flex gap-2 rounded-xl bg-secondary/50 p-1 border border-border">
                        <Button
                            type="button"
                            variant={sourceMode === 'upload' ? 'default' : 'ghost'}
                            onClick={() => handleSourceModeChange('upload')}
                            className="flex-1 shadow-none"
                        >
                            <Upload className="h-4 w-4 mr-2" /> Upload File
                        </Button>
                        <Button
                            type="button"
                            variant={sourceMode === 'link' ? 'default' : 'ghost'}
                            onClick={() => handleSourceModeChange('link')}
                            className="flex-1 shadow-none"
                        >
                            <LinkIcon className="h-4 w-4 mr-2" /> External Link
                        </Button>
                    </div>

                    {sourceMode === 'upload' && (
                        <Field name="contentUrl">
                            <div
                                className={[
                                    'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
                                    isDragging
                                        ? 'border-primary bg-primary/5'
                                        : uploadedFile
                                        ? 'border-green-500/60 bg-green-500/5'
                                        : 'border-input hover:bg-accent/50',
                                ].join(' ')}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={acceptedExtensions}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                />
                                {uploadedFile ? (
                                    <>
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10">
                                            {selectedType === 'pdf'
                                                ? <FileText className="h-6 w-6 text-green-600" />
                                                : <FileCode className="h-6 w-6 text-green-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium max-w-[280px] truncate">{uploadedFile.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {(uploadedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                                            className="absolute top-2 right-2 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            aria-label="Remove uploaded file"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                                            <FileUp className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {isDragging ? 'Drop file here' : 'Click to upload or drag & drop'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {selectedType === 'pdf' ? 'PDF files only' : 'Markdown / .md / .txt files'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <FieldError />
                        </Field>
                    )}

                    {sourceMode === 'link' && (
                        <Field name="contentUrl">
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="https://example.com/syllabus.pdf"
                                    className="pl-9"
                                    {...form.register('contentUrl')}
                                />
                            </div>
                            <FieldDescription>
                                Paste a direct URL to the syllabus file.
                            </FieldDescription>
                            <FieldError />
                        </Field>
                    )}
                </div>

                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        {form.formState.errors.root.message}
                    </p>
                )}

                <Button type="submit" className="w-full" size="lg" loading={form.formState.isSubmitting}>
                    {`Save ${syllabusTypeMode === 'program' ? 'Program' : 'Subject'} Syllabus`}
                </Button>
            </div>
        </Form>
    );
}
