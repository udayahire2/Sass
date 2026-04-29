export type Branch = "Computer" | "IT" | "Mechanical" | "Civil" | "Electrical";

export interface Topic {
    id: string;
    title: string;
    description: string; // 2-3 lines context
    youtubeVideoId?: string; // Just the ID
    videoDuration?: string; // Video length e.g. "10:05"
    estimatedTime?: string; // e.g., "15 mins"
    summaryPoints: string[]; // Exam ready summary
    markdownContent: string; // Full notes
    quiz?: {
        questions: Array<{
            id: string;
            question: string;
            options: string[];
            correctIndex: number;
        }>
    }
}

export interface Unit {
    id: string;
    number: number;
    title: string;
    topics: Topic[];
}

export interface QuestionPaper {
    id: string;
    year: string;
    term: "Summer" | "Winter";
    type: "Unsolved" | "Solved" | "Model" | "Previous";
    pdfUrl: string;
    pages?: number;
    fileSize?: string;
}

export interface Subject {
    id: string;
    name: string;
    code: string;
    semester: number;
    branch: Branch;
    units: Unit[];
    papers: QuestionPaper[];
}

export const BRANCHES: Branch[] = ["Computer", "IT", "Mechanical", "Civil", "Electrical"];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// MOCK DATA GENERATOR
const createTopic = (id: string, title: string): Topic => ({
    id,
    title,
    description: `Comprehensive detailed study note for ${title}. Focuses on core concepts required for NMU exams.`,
    youtubeVideoId: "dQw4w9WgXcQ", // Placeholder
    videoDuration: "10:00",
    estimatedTime: "15 mins",
    summaryPoints: [
        "Key concept definition and importance.",
        "Standard algorithm steps or formula.",
        "Common exam question patterns.",
        "Advantages and limitations."
    ],
    markdownContent: `# ${title}

This is a **rich content demonstration** to verify the *Notion-like* UI updates.

## 1. Core Concepts
Understanding the fundamental principles is key.

> "Simplicity is the soul of efficiency." – Austin Freeman

## 2. Implementation Example

Here is how you might implement this algorithm in **JavaScript**:

\`\`\`javascript
function calculateEfficiency(input) {
    // This is a comment
    const factor = 1.5;
    if (input > 10) {
        return input * factor;
    }
    return input;
}

console.log(calculateEfficiency(20));
\`\`\`

### Python Alternative
And here is the same logic in **Python**:

\`\`\`python
def calculate_efficiency(input_val):
    # Python implementation
    factor = 1.5
    if input_val > 10:
        return input_val * factor
    return input_val

print(calculate_efficiency(20))
\`\`\`

## 3. Deployment
To deploy this module, run the following command:

\`\`\`bash
npm install @sassy/algorithm
npm run build
\`\`\`

- [x] Verified installation
- [ ] Verified build process
`,
    quiz: {
        questions: [
            {
                id: "q1",
                question: `What is the primary purpose of ${title}?`,
                options: ["Efficiency", "Security", "Redundancy", "None"],
                correctIndex: 0
            }
        ]
    }
});

const createUnit = (id: string, num: number, title: string, topics: string[]): Unit => ({
    id,
    number: num,
    title,
    topics: topics.map((t, i) => createTopic(`${id}-t${i + 1}`, t))
});

export const SUBJECTS_DB: Subject[] = [
    {
        id: "dsa",
        name: "Data Structures & Algorithms",
        code: "COMP-301",
        semester: 3,
        branch: "Computer",
        papers: [
            { id: "p1", year: "2023", term: "Winter", type: "Unsolved", pdfUrl: "#", pages: 4, fileSize: "1.2 MB" },
            { id: "p2", year: "2023", term: "Summer", type: "Solved", pdfUrl: "#", pages: 12, fileSize: "3.5 MB" },
        ],
        units: [
            createUnit("dsa-u1", 1, "Stack & Queue", ["Stack Operations", "Queue Types", "Applications of Stack"]),
            createUnit("dsa-u2", 2, "Linked Lists", ["Singly Linked List", "Doubly Linked List", "Circular Linked List"]),
            createUnit("dsa-u3", 3, "Trees", ["Binary Tree", "BST", "AVL Trees"]),
        ]
    },
    {
        id: "oop",
        name: "Object Oriented Programming",
        code: "COMP-302",
        semester: 3,
        branch: "Computer",
        papers: [],
        units: [
            createUnit("oop-u1", 1, "Introduction to C++", ["Classes & Objects", "Constructors", "Destructors"]),
            createUnit("oop-u2", 2, "Inheritance", ["Types of Inheritance", "Virtual Functions", "Polymorphism"]),
        ]
    },
    {
        id: "math1",
        name: "Engineering Mathematics I",
        code: "COM-101",
        semester: 1,
        branch: "Computer", // Simplified, usually Common
        papers: [],
        units: [
            createUnit("m1-u1", 1, "Matrices", ["Rank of Matrix", "Linear Equations", "Eigen Values"]),
        ]
    }
];

export const getSubjects = (branch: string, semester: string) => {
    return SUBJECTS_DB.filter(s => s.branch === branch && s.semester.toString() === semester);
};

export const getSubject = (id: string) => SUBJECTS_DB.find(s => s.id === id);
