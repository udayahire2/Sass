import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, FileCode, Link, Upload, X } from 'lucide-react';
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

type SourceMode = 'upload' | 'link';

const formSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Course code is required.' }),
    semester: z.string().optional(),
    year: z.string().optional(),
    branch: z.string().min(1, { message: 'Branch is required.' }),
    type: z.enum(['pdf', 'markdown']),
    contentUrl: z.string().optional(),
}).refine((values) => Boolean(values.semester) !== Boolean(values.year), {
    message: 'Select either semester or year.',
    path: ['semester'],
});

export default function SyllabusForm({ onSuccess }: { onSuccess: () => void }) {
    const [sourceMode, setSourceMode] = useState<SourceMode>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            code: '',
            semester: '',
            year: '',
            branch: '',
            type: 'pdf',
            contentUrl: '',
        },
    });

    const selectedType = useWatch({
        control: form.control,
        name: 'type',
    });
    const selectedSemester = useWatch({
        control: form.control,
        name: 'semester',
    });
    const selectedYear = useWatch({
        control: form.control,
        name: 'year',
    });

    const acceptedExtensions = selectedType === 'pdf' ? '.pdf' : '.md,.markdown,.txt';

    const handleSourceModeChange = (mode: SourceMode) => {
        setSourceMode(mode);
        // Clear file & URL when switching modes
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

        if (!values.semester && !values.year) {
            form.setError('semester', { type: 'manual', message: 'Please select either a semester or a year.' });
            return;
        }

        if (values.semester && values.year) {
            form.setError('year', { type: 'manual', message: 'Select semester or year, not both.' });
            return;
        }

        const formData = new FormData();
        Object.entries(values).forEach(([k, v]) => {
            if (v !== undefined && String(v).trim() !== '') formData.append(k, String(v));
        });

        if (sourceMode === 'upload' && uploadedFile) {
            formData.append('file', uploadedFile);
        }
        formData.append('sourceMode', sourceMode);

        const created = await createSyllabus(formData);

        if (created) {
            form.reset();
            setUploadedFile(null);
            setSourceMode('upload');
            onSuccess();
            return;
        }

        form.setError('root', {
            type: 'server',
            message: 'Failed to save syllabus. Please check your admin session and try again.',
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title & Code - stack on mobile, side by side on sm */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Data Structures" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. CS301" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Branch, Semester & Year */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="branch"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Branch</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {branchOptions.map((branch) => (
                                            <SelectItem key={branch} value={branch}>
                                                {branch === 'Both' ? '✦ Both (All Branches)' : branch}
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
                        name="semester"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Semester</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue('year', '');
                                        form.clearErrors('year');
                                    }}
                                    value={field.value}
                                    disabled={Boolean(selectedYear)}
                                >
                                    <FormControl>
                                        <SelectTrigger className={selectedYear ? 'opacity-50 cursor-not-allowed' : ''}>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {semesterOptions.map((semester) => (
                                            <SelectItem key={semester} value={semester}>
                                                Semester {semester}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.value && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-7 px-2 text-xs"
                                        onClick={() => form.setValue('semester', '')}
                                    >
                                        Clear semester
                                    </Button>
                                )}
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
                            <FormLabel>Year</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('semester', '');
                                    form.clearErrors('semester');
                                }}
                                value={field.value}
                                disabled={Boolean(selectedSemester)}
                            >
                                <FormControl>
                                    <SelectTrigger className={selectedSemester ? 'opacity-50 cursor-not-allowed' : ''}>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {yearOptions.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            Year {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {field.value && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-7 px-2 text-xs"
                                    onClick={() => form.setValue('year', '')}
                                >
                                    Clear year
                                </Button>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    handleFileChange(null);
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF File</SelectItem>
                                    <SelectItem value="markdown">Markdown File</SelectItem>
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
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
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
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
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
                                                'relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
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
                                        Paste a direct link to the syllabus document (Google Drive, Dropbox, etc.)
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                {form.formState.errors.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Syllabus'}
                </Button>
            </form>
        </Form>
    );
}
