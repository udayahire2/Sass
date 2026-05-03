const { z } = require('zod');

const branchEnum = z.enum(['Computer', 'IT', 'Civil', 'Mechanical', 'Electrical', 'ENTC', 'Both']);
const yearEnum = z.enum(['FE', 'SE', 'TE', 'BE']);
const syllabusTypeEnum = z.enum(['pdf', 'markdown']);
const resourceTypeEnum = z.enum(['pdf', 'video', 'doc', 'markdown']);
const resourceCategoryEnum = z.enum(['Notes', 'PYQ', 'Syllabus', 'Lab Manual', 'Reference Book', 'Other']);
const materialTypeEnum = z.enum(['PDF', 'PPT', 'DOCX', 'Markdown', 'Video', 'Notes']);

const trimmedString = (minimum, field) =>
    z.string().trim().min(minimum, `${field} must be at least ${minimum} characters`);

const emailSchema = z.string().trim().email('A valid email address is required').transform((value) => value.toLowerCase());

const signupStudentSchema = z.object({
    role: z.literal('student'),
    name: trimmedString(2, 'Name'),
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    branch: branchEnum,
    year: yearEnum,
});

const signupFacultySchema = z.object({
    role: z.literal('faculty'),
    name: trimmedString(2, 'Name'),
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    designation: trimmedString(2, 'Designation'),
    department: trimmedString(2, 'Department'),
    collegeName: trimmedString(2, 'College name'),
    subjects: z.union([
        z.array(trimmedString(1, 'Subject')).min(1, 'At least one subject is required'),
        trimmedString(1, 'Subjects').transform((value) =>
            value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
        ),
    ]),
});

const registerSchema = z.discriminatedUnion('role', [signupStudentSchema, signupFacultySchema]);

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

const verifyOtpSchema = z.object({
    email: emailSchema,
    otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be a 6 digit code'),
});

const updateProfileSchema = z.object({
    name: trimmedString(2, 'Name').optional(),
    branch: branchEnum.optional(),
    year: yearEnum.optional(),
});

const createSyllabusSchema = z.object({
    title: trimmedString(2, 'Title'),
    code: trimmedString(2, 'Code'),
    branch: branchEnum,
    semester: z.string().trim().regex(/^([1-8]|all)$/, 'Semester must be between 1 and 8, or "all"'),
    type: syllabusTypeEnum,
    contentUrl: trimmedString(2, 'Content'),
});

const createResourceSchema = z.object({
    title: trimmedString(2, 'Title'),
    subject: trimmedString(2, 'Subject'),
    semester: trimmedString(1, 'Semester'),
    branch: branchEnum,
    type: resourceTypeEnum,
    description: trimmedString(10, 'Description'),
    category: resourceCategoryEnum,
    pattern: z.string().trim().optional().default(''),
    unit: z.string().trim().optional().default(''),
    year: yearEnum,
    author: trimmedString(2, 'Author'),
    url: z.string().trim().url('A valid URL is required'),
});

const updateMaterialStatusSchema = z.object({
    status: z.enum(['approved', 'rejected']),
    reason: z.string().trim().max(500).optional(),
});

const adminProfileSchema = z.object({
    firstName: trimmedString(1, 'First name').optional(),
    lastName: z.string().trim().optional(),
    email: emailSchema.optional(),
});

const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    branch: z.string().trim().optional(),
    semester: z.string().trim().optional(),
    status: z.string().trim().optional(),
});

const materialUploadBodySchema = z.object({
    title: trimmedString(2, 'Title'),
    subject: trimmedString(2, 'Subject'),
    type: materialTypeEnum.optional(),
    author: trimmedString(2, 'Author').optional(),
    url: z.string().trim().url().optional(),
});

const materialFeedbackSchema = z.object({
    feedback_text: trimmedString(5, 'Feedback'),
    rating: z.coerce.number().int().min(1).max(5),
});

module.exports = {
    adminProfileSchema,
    createResourceSchema,
    createSyllabusSchema,
    loginSchema,
    materialFeedbackSchema,
    materialUploadBodySchema,
    paginationQuerySchema,
    registerSchema,
    updateMaterialStatusSchema,
    updateProfileSchema,
    verifyOtpSchema,
};
