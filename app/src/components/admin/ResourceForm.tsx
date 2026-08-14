import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, Link as LinkIcon, Upload, X } from 'lucide-react';
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

    // Convert RHF errors to flat object for coss Form
    const errors = Object.entries(form.formState.errors).reduce((acc, [key, err]) => {
        if (err?.message) acc[key] = err.message;
        return acc;
    }, {} as Record<string, string>);

    return (
        <Form errors={errors} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
                <Field name="title">
                    <FieldLabel>Title</FieldLabel>
                    <Input placeholder="Resource title" {...form.register('title')} />
                    <FieldError />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field name="subject">
                        <FieldLabel>Subject</FieldLabel>
                        <Input placeholder="Subject" {...form.register('subject')} />
                        <FieldError />
                    </Field>
                    
                    <Controller
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <Field name="type">
                                <FieldLabel>Type</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="doc">Document</SelectItem>
                                        <SelectItem value="markdown">Markdown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError />
                            </Field>
                        )}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        control={form.control}
                        name="branch"
                        render={({ field }) => (
                            <Field name="branch">
                                <FieldLabel>Branch</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchOptions.map((branch) => (
                                            <SelectItem key={branch} value={branch}>
                                                {branch}
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
                        name="semester"
                        render={({ field }) => (
                            <Field name="semester">
                                <FieldLabel>Semester</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterOptions.map((semester) => (
                                            <SelectItem key={semester} value={semester}>
                                                {semester}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError />
                            </Field>
                        )}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <Field name="year">
                                <FieldLabel>Year</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
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
                        name="category"
                        render={({ field }) => (
                            <Field name="category">
                                <FieldLabel>Category</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(fixedCategory)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError />
                            </Field>
                        )}
                    />
                </div>

                {/* Source Mode Selector */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium">Content Source</label>
                    <div className="flex gap-2 p-1 rounded-lg bg-secondary/50 border border-border">
                        <Button
                            type="button"
                            variant={sourceMode === 'upload' ? 'default' : 'ghost'}
                            className="flex-1 shadow-none"
                            onClick={() => handleSourceModeChange('upload')}
                        >
                            <Upload className="h-4 w-4 mr-2" /> Upload File
                        </Button>
                        <Button
                            type="button"
                            variant={sourceMode === 'link' ? 'default' : 'ghost'}
                            className="flex-1 shadow-none"
                            onClick={() => handleSourceModeChange('link')}
                        >
                            <LinkIcon className="h-4 w-4 mr-2" /> External Link
                        </Button>
                    </div>

                    {sourceMode === 'upload' && (
                        <Field name="url">
                            <div
                                className={[
                                    'relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200',
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
                                    accept={ACCEPTED_FILE_TYPES}
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                />
                                {uploadedFile ? (
                                    <>
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10">
                                            <FileText className="h-6 w-6 text-green-600" />
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
                                                PDF, DOC, DOCX, PPT, Markdown files
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <FieldError />
                        </Field>
                    )}

                    {sourceMode === 'link' && (
                        <Field name="url">
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="https://drive.google.com/file/..."
                                    className="pl-9"
                                    {...form.register('url')}
                                />
                            </div>
                            <FieldDescription>
                                Paste a direct link to the resource (Google Drive, Dropbox, YouTube, etc.)
                            </FieldDescription>
                            <FieldError />
                        </Field>
                    )}
                </div>

                <Field name="author">
                    <FieldLabel>Author</FieldLabel>
                    <Input placeholder="Professor name or source" {...form.register('author')} />
                    <FieldError />
                </Field>

                <Field name="description">
                    <FieldLabel>Description</FieldLabel>
                    <Textarea placeholder="Brief description..." className="min-h-24" {...form.register('description')} />
                    <FieldError />
                </Field>

                {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                )}

                <Button type="submit" size="lg" className="w-full" loading={form.formState.isSubmitting}>
                    {isEditing ? 'Update Resource' : 'Add Resource'}
                </Button>
            </div>
        </Form>
    );
}
