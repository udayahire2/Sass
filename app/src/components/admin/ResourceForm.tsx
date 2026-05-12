import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, Link, Upload, X } from 'lucide-react';
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
import { createResource, updateResource, type CreateResourcePayload, type ResourceCategory, type ResourceItem } from '@/services/resource-service';

const branchOptions = ['Computer', 'IT', 'Civil', 'Mechanical', 'Electrical', 'ENTC'];
const semesterOptions = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const yearOptions = ['FE', 'SE', 'TE', 'BE'] as const;
const categoryOptions = ['Notes', 'PYQ', 'IMP Questions', 'Sample Paper', 'Syllabus', 'Lab Manual', 'Reference Book', 'Other'] as const;

type SourceMode = 'upload' | 'link';

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.md,.txt';

const formSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    subject: z.string().min(2, { message: 'Subject is required.' }),
    semester: z.string().min(1, { message: 'Semester is required.' }),
    branch: z.string().min(1, { message: 'Branch is required.' }),
    year: z.enum(yearOptions),
    category: z.enum(categoryOptions),
    type: z.enum(['pdf', 'video', 'doc', 'markdown']),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    author: z.string().min(2, { message: 'Author is required.' }),
    url: z.string().optional(),
});

type ResourceFormProps = {
    fixedCategory?: ResourceCategory;
    initialValues?: ResourceItem | null;
    onSuccess: () => void;
};

export default function ResourceForm({ fixedCategory, initialValues, onSuccess }: ResourceFormProps) {
    const isEditing = Boolean(initialValues);
    const [sourceMode, setSourceMode] = useState<SourceMode>('link');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            subject: '',
            semester: '',
            branch: '',
            year: 'SE',
            category: fixedCategory ?? 'Notes',
            type: 'pdf',
            description: '',
            author: '',
            url: '',
        },
    });

    useEffect(() => {
        form.reset({
            title: initialValues?.title ?? '',
            subject: initialValues?.subject ?? '',
            semester: initialValues?.semester ?? '',
            branch: initialValues?.branch ?? '',
            year: initialValues?.year ?? 'SE',
            category: initialValues?.category ?? fixedCategory ?? 'Notes',
            type: initialValues?.type ?? 'pdf',
            description: initialValues?.description ?? '',
            author: initialValues?.author ?? '',
            url: initialValues?.url ?? '',
        });
        // If editing an existing resource that has a url, default to link mode
        if (initialValues?.url) {
            setSourceMode('link');
        }
    }, [fixedCategory, form, initialValues]);

    const handleSourceModeChange = (mode: SourceMode) => {
        setSourceMode(mode);
        setUploadedFile(null);
        form.setValue('url', '');
        form.clearErrors('url');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (file: File | null) => {
        setUploadedFile(file);
        if (file) {
            form.setValue('url', file.name);
            form.clearErrors('url');
        } else {
            form.setValue('url', '');
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
            form.setError('url', { type: 'manual', message: 'Please upload a file.' });
            return;
        }

        if (sourceMode === 'link' && (!values.url || values.url.trim() === '')) {
            form.setError('url', { type: 'manual', message: 'Please enter a valid resource URL.' });
            return;
        }

        if (sourceMode === 'upload' && uploadedFile) {
            // Use FormData for file upload
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('subject', values.subject);
            formData.append('semester', values.semester);
            formData.append('branch', values.branch);
            formData.append('year', values.year);
            formData.append('category', fixedCategory ?? values.category);
            formData.append('type', values.type);
            formData.append('description', values.description);
            formData.append('author', values.author);
            formData.append('pattern', '2019');
            formData.append('unit', 'All');
            formData.append('sourceMode', 'upload');
            formData.append('file', uploadedFile);

            const resource = initialValues
                ? await updateResource(initialValues._id, formData)
                : await createResource(formData);

            if (resource) {
                form.reset();
                setUploadedFile(null);
                setSourceMode('link');
                onSuccess();
                return;
            }
        } else {
            // JSON payload for link
            const payload: CreateResourcePayload = {
                ...values,
                url: values.url || '',
                category: fixedCategory ?? values.category,
                pattern: '2019',
                unit: 'All',
            };

            const resource = initialValues
                ? await updateResource(initialValues._id, payload)
                : await createResource(payload);

            if (resource) {
                form.reset();
                onSuccess();
                return;
            }
        }

        form.setError('root', {
            type: 'server',
            message: 'Failed to save resource. Please check your admin session and try again.',
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title - full width */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Resource title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Subject & Type - stack on mobile, side by side on sm+ */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                    <Input placeholder="Subject" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="doc">Document</SelectItem>
                                        <SelectItem value="markdown">Markdown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Branch & Semester */}
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
                                                {branch}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {semesterOptions.map((semester) => (
                                            <SelectItem key={semester} value={semester}>
                                                {semester}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Year & Category */}
                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
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
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={Boolean(fixedCategory)}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categoryOptions.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                            name="url"
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
                                                accept={ACCEPTED_FILE_TYPES}
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                            />
                                            {uploadedFile ? (
                                                <>
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10">
                                                        <FileText className="h-6 w-6 text-green-600" />
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
                                                            PDF, DOC, DOCX, PPT, Markdown files
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
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            <Link className="h-4 w-4" />
                                        </div>
                                        <FormControl>
                                            <Input
                                                placeholder="https://drive.google.com/file/..."
                                                className="pl-9"
                                                {...field}
                                            />
                                        </FormControl>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Paste a direct link to the resource (Google Drive, Dropbox, YouTube, etc.)
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                {/* Author */}
                <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Author</FormLabel>
                            <FormControl>
                                <Input placeholder="Professor name or source" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Brief description..." className="min-h-24" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {form.formState.errors.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                )}

                <div className="pt-2">
                    <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Resource' : 'Add Resource'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
