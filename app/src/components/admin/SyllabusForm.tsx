import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, FileText, FileCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

const formSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    code: z.string().min(2, { message: 'Course code is required.' }),
    semester: z.string().optional(),
    branch: z.string().min(1, { message: 'Branch is required.' }),
    type: z.enum(['pdf', 'markdown']),
    contentUrl: z.string().optional(),
});

export default function SyllabusForm({ onSuccess }: { onSuccess: () => void }) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [allSemesters, setAllSemesters] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            code: '',
            semester: '',
            branch: '',
            type: 'pdf',
            contentUrl: '',
        },
    });

    const selectedType = useWatch({
        control: form.control,
        name: 'type',
    });

    const acceptedExtensions = selectedType === 'pdf' ? '.pdf' : '.md,.markdown,.txt';

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
        if (!uploadedFile) {
            form.setError('contentUrl', { type: 'manual', message: 'Please upload a file.' });
            return;
        }

        if (!allSemesters && !values.semester) {
            form.setError('semester', { type: 'manual', message: 'Please select a semester or check "All Semesters".' });
            return;
        }

        const formData = new FormData();
        const semester = allSemesters ? 'all' : (values.semester ?? '');
        const submitValues = { ...values, semester };
        Object.entries(submitValues).forEach(([k, v]) => {
            if (v !== undefined) formData.append(k, String(v));
        });
        formData.append('file', uploadedFile);

        const created = await createSyllabus(formData);

        if (created) {
            form.reset();
            setUploadedFile(null);
            setAllSemesters(false);
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
                                <FormLabel>Semester / Year</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={allSemesters ? '' : field.value}
                                    disabled={allSemesters}
                                >
                                    <FormControl>
                                        <SelectTrigger className={allSemesters ? 'opacity-50 cursor-not-allowed' : ''}>
                                            <SelectValue placeholder={allSemesters ? 'All semesters' : 'Select semester'} />
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
                                <div className="flex items-center gap-2 mt-2">
                                    <Checkbox
                                        id="all-semesters"
                                        checked={allSemesters}
                                        onCheckedChange={(checked) => {
                                            setAllSemesters(Boolean(checked));
                                            if (checked) {
                                                form.setValue('semester', '');
                                                form.clearErrors('semester');
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="all-semesters"
                                        className="text-xs text-muted-foreground cursor-pointer select-none"
                                    >
                                        Applies to all semesters
                                    </label>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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

                <FormField
                    control={form.control}
                    name="contentUrl"
                    render={({ fieldState }) => (
                        <FormItem>
                            <FormLabel>
                                {selectedType === 'pdf' ? 'Upload PDF File' : 'Upload Markdown File'}
                            </FormLabel>
                            <FormControl>
                                <div
                                    className={[
                                        'relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                                        isDragging
                                            ? 'border-primary bg-primary/5'
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
