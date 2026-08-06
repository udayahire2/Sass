import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, FileCode, Link, Upload, X, Layers, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Syllabus Type Scenario Toggle */}
                <div className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Syllabus Mode / Level</FormLabel>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/70 p-1 border border-border/60">
                        <button
                            type="button"
                            onClick={() => handleSyllabusTypeChange('subject')}
                            className={[
                                'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200',
                                syllabusTypeMode === 'subject'
                                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/60 font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                            ].join(' ')}
                        >
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>Subject-Level</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSyllabusTypeChange('program')}
                            className={[
                                'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200',
                                syllabusTypeMode === 'program'
                                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/60 font-semibold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                            ].join(' ')}
                        >
                            <Layers className="h-4 w-4 text-primary" />
                            <span>Program-Level</span>
                        </button>
                    </div>
                </div>

                {/* Program / Branch Selection */}
                <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Program / Branch</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select program / branch" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {branchOptions.map((branch) => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch === 'Both' ? '✦ Both (All Branches)' : `${branch} Engineering`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Scenario 1: Subject-Level Syllabus Fields */}
                {syllabusTypeMode === 'subject' && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="subjectName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Data Structures" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subjectCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Code *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. CS301" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {semesterOptions.map((sem) => (
                                                    <SelectItem key={sem} value={sem}>
                                                        Semester {sem}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year (Optional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {yearOptions.map((yr) => (
                                                    <SelectItem key={yr} value={yr}>
                                                        Year {yr}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </>
                )}

                {/* Scenario 2: Program-Level Syllabus Fields */}
                {syllabusTypeMode === 'program' && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bundle Title (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 1st Year Complete Syllabus" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="courseCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course / Bundle Code (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. COMP-Y1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Program Academic Year *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select academic year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {yearOptions.map((yr) => (
                                                <SelectItem key={yr} value={yr}>
                                                    {yr}st/th Year (Semesters {Number(yr) * 2 - 1} & {Number(yr) * 2})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Syllabus Summary / Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter course description, learning outcomes, or syllabus details..."
                                    className="min-h-20"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Content Type */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Content Format</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    handleFileChange(null);
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                                    <SelectItem value="markdown">Markdown File (.md)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Source Mode Tabs */}
                <div className="space-y-4">
                    <FormLabel className="text-sm font-medium">Content Source</FormLabel>
                    <div className="flex gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
                        <button
                            type="button"
                            onClick={() => handleSourceModeChange('upload')}
                            className={[
                                'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                sourceMode === 'upload'
                                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/50'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                            ].join(' ')}
                        >
                            <Upload className="h-4 w-4" />
                            Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSourceModeChange('link')}
                            className={[
                                'flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                sourceMode === 'link'
                                    ? 'bg-background text-foreground shadow-xs ring-1 ring-border/50'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
                            ].join(' ')}
                        >
                            <Link className="h-4 w-4" />
                            External Link
                        </button>
                    </div>

                    {/* Upload File Panel */}
                    {sourceMode === 'upload' && (
                        <FormField
                            control={form.control}
                            name="contentUrl"
                            render={({ fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <div
                                            className={[
                                                'relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
                                                isDragging
                                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                                    : uploadedFile
                                                    ? 'border-green-500/60 bg-green-500/5'
                                                    : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/30',
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
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                                                        {selectedType === 'pdf'
                                                            ? <FileText className="h-6 w-6 text-green-600" />
                                                            : <FileCode className="h-6 w-6 text-green-600" />}
                                                    </div>
                                                    <div className="min-w-0 text-center">
                                                        <p className="text-sm font-medium text-foreground truncate max-w-[280px]">{uploadedFile.name}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                                                        className="absolute top-2 right-2 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                        aria-label="Remove uploaded file"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                                                        <FileUp className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {isDragging ? 'Drop file here' : 'Click to upload or drag & drop'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {selectedType === 'pdf' ? 'PDF files only' : 'Markdown / .md / .txt files'}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </FormControl>
                                    {fieldState.error && (
                                        <p className="text-sm text-destructive">{fieldState.error.message}</p>
                                    )}
                                </FormItem>
                            )}
                        />
                    )}

                    {/* External Link Panel */}
                    {sourceMode === 'link' && (
                        <FormField
                            control={form.control}
                            name="contentUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Link className="h-4 w-4" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com/syllabus.pdf"
                                                className="pl-9"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Paste a direct URL to the syllabus file.
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        {form.formState.errors.root.message}
                    </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : `Save ${syllabusTypeMode === 'program' ? 'Program' : 'Subject'} Syllabus`}
                </Button>
            </form>
        </Form>
    );
}
