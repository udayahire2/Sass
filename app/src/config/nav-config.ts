export interface NavLink {
    path: string;
    label: string;
    dropdown?: { path: string; label: string }[];
}

export const NAV_LINKS: NavLink[] = [
    { path: "/", label: "Home" },
    { path: "/study-stock", label: "Study Stock" },
    { 
        path: "/resources", 
        label: "Study Material",
        dropdown: [
            { path: "/resources", label: "Browse All" },
            { path: "/study-material/imp-questions", label: "Imp Questions" },
            { path: "/study-material/sample-papers", label: "Sample Question Papers" }
        ]
    },
    { path: "/syllabus", label: "Syllabus" },
];
