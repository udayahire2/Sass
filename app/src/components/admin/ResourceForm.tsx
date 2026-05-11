import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
    url: z.string().min(1, { message: 'Please enter a valid resource URL.' }),
});

type ResourceFormProps = {
    fixedCategory?: ResourceCategory;
    initialValues?: ResourceItem | null;
    onSuccess: () => void;
};

export default function ResourceForm({ fixedCategory, initialValues, onSuccess }: ResourceFormProps) {
    const isEditing = Boolean(initialValues);
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
    }, [fixedCategory, form, initialValues]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: CreateResourcePayload = {
            ...values,
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

                {/* URL */}
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
