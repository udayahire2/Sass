export interface NavLink {
    path: string
    label: string
}

export const NAV_LINKS: NavLink[] = [
    { path: "/", label: "Home" },
    { path: "/resources", label: "Study Materials" },
    { path: "/syllabus", label: "Syllabus" },
]
