import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
    Search as SearchIcon,
    FileText,
    BookOpen,
    Loader2,
    ExternalLink,
    Sparkles
} from "lucide-react";

// ============================================================
//  TYPES (local, no external service imports)
// ============================================================
interface SyllabusItem {
    _id?: string;
    code: string;
    title: string;
    branch: string;
    semester: number;
    credits: number;
}

interface StudyMaterial {
    _id?: string;
    id?: string;
    title: string;
    subject: string;
    author: string;
    type: string;
    url?: string;
    filePath?: string;
}

// Mock data for demonstration – replace with real API calls
const MOCK_SYLLABUS: SyllabusItem[] = [
    { _id: "s1", code: "CS-501", title: "Operating Systems", branch: "CSE", semester: 5, credits: 4 },
    { _id: "s2", code: "CS-502", title: "Database Management Systems", branch: "CSE", semester: 5, credits: 4 },
    { _id: "s3", code: "CS-503", title: "Computer Networks", branch: "CSE", semester: 5, credits: 3 },
    { _id: "s4", code: "MA-401", title: "Mathematics III", branch: "CSE", semester: 4, credits: 3 },
    { _id: "s5", code: "CS-601", title: "Machine Learning", branch: "CSE", semester: 6, credits: 4 },
];

const MOCK_MATERIALS: StudyMaterial[] = [
    { _id: "m1", title: "OS Notes – Unit 1", subject: "Operating Systems", author: "Dr. Sharma", type: "notes" },
    { _id: "m2", title: "DBMS Question Bank", subject: "Database Management Systems", author: "Prof. Verma", type: "question-paper" },
    { _id: "m3", title: "CN Lab Manual", subject: "Computer Networks", author: "Dr. Gupta", type: "lab" },
    { _id: "m4", title: "Probability & Statistics", subject: "Mathematics III", author: "Dr. Rao", type: "notes" },
    { _id: "m5", title: "ML Assignment Solutions", subject: "Machine Learning", author: "Prof. Singh", type: "assignment" },
];

// Simple asset URL builder
function buildAssetUrl(filePath: string, _options?: { studyMaterialId?: string }): string {
    return `/assets/${filePath}`;
}

type FilterTab = "all" | "syllabus" | "materials";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "");
    const [activeTab, setActiveTab] = useState<FilterTab>("all");

    const [loading, setLoading] = useState(false);
    const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    // Simulate data fetch
    useEffect(() => {
        let mounted = true;
        setLoading(true);

        setTimeout(() => {
            if (mounted) {
                setSyllabus(MOCK_SYLLABUS);
                setMaterials(MOCK_MATERIALS);
                setLoading(false);
            }
        }, 600);

        return () => {
            mounted = false;
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
            setActiveQuery(query.trim());
        } else {
            setSearchParams({});
            setActiveQuery("");
        }
    };

    const handleSuggestionClick = (term: string) => {
        setQuery(term);
        setSearchParams({ q: term });
        setActiveQuery(term);
    };

    const filteredSyllabus = useMemo(() => {
        if (!activeQuery) return [];
        const lowerQuery = activeQuery.toLowerCase();
        return syllabus.filter(
            (item) =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.code.toLowerCase().includes(lowerQuery) ||
                item.branch.toLowerCase().includes(lowerQuery)
        );
    }, [activeQuery, syllabus]);

    const filteredMaterials = useMemo(() => {
        if (!activeQuery) return [];
        const lowerQuery = activeQuery.toLowerCase();
        return materials.filter(
            (m) =>
                m.title.toLowerCase().includes(lowerQuery) ||
                m.subject.toLowerCase().includes(lowerQuery) ||
                m.author.toLowerCase().includes(lowerQuery)
        );
    }, [activeQuery, materials]);

    const hasResults = filteredSyllabus.length > 0 || filteredMaterials.length > 0;
    const suggestions = ["Operating Systems", "Mathematics", "Question Papers", "CS-501"];

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
            {/* ===== HEADER ===== */}
            <header className="space-y-3 text-center sm:space-y-4">
                <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Global Search</h1>
                <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-base">
                    Find syllabus, notes, question papers, and resources across all departments.
                </p>

                <form onSubmit={handleSearch} className="mx-auto max-w-2xl pt-2 sm:pt-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex flex-1 items-center">
                            <span className="absolute left-3 text-muted-foreground">
                                <SearchIcon size={18} />
                            </span>
                            <input
                                type="text"
                                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Search by subject, code, or title..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Suggestions */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <Sparkles size={14} className="text-amber-500" />
                        Popular:
                    </span>
                    {suggestions.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => handleSuggestionClick(item)}
                            className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </header>

            {/* ===== BODY ===== */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                    <Loader2 size={36} className="animate-spin text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">Searching study materials...</p>
                </div>
            ) : !activeQuery ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 py-12 text-center sm:py-16">
                    <div className="rounded-full bg-muted p-4 sm:p-5">
                        <SearchIcon size={40} className="text-muted-foreground/50" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">Start searching</h2>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        Type subject names, course codes, or paper titles in the search bar above.
                    </p>
                </div>
            ) : !hasResults ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 py-12 text-center sm:py-16">
                    <div className="rounded-full bg-muted p-4 sm:p-5">
                        <SearchIcon size={40} className="text-muted-foreground/50" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">No results found</h2>
                    <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        We couldn't find any materials matching "{activeQuery}". Try another keyword or subject code.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/40 pb-2">
                        <button
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                activeTab === "all"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Results ({filteredSyllabus.length + filteredMaterials.length})
                        </button>
                        <button
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                activeTab === "syllabus"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                            onClick={() => setActiveTab("syllabus")}
                        >
                            Syllabus ({filteredSyllabus.length})
                        </button>
                        <button
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                activeTab === "materials"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                            onClick={() => setActiveTab("materials")}
                        >
                            Materials ({filteredMaterials.length})
                        </button>
                    </div>

                    {/* Results Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Syllabus Section */}
                        {(activeTab === "all" || activeTab === "syllabus") && (
                            <section className={`space-y-3 ${activeTab === "syllabus" ? "md:col-span-2" : ""}`}>
                                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                                    <FileText size={20} className="text-primary" />
                                    <h2 className="text-lg font-semibold">Syllabus ({filteredSyllabus.length})</h2>
                                </div>

                                {filteredSyllabus.length === 0 ? (
                                    <p className="py-4 text-sm text-muted-foreground">No syllabus items matched.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {filteredSyllabus.map((item) => (
                                            <div
                                                key={item._id || item.code}
                                                className="overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50 hover:shadow-sm"
                                            >
                                                <div className="p-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold">
                                                                {item.code}
                                                            </span>
                                                            <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                                                                {item.branch}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-semibold leading-snug sm:text-base">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Semester {item.semester} • {item.credits} Credits
                                                        </p>
                                                        <Link
                                                            to={`/syllabus?search=${encodeURIComponent(item.code)}`}
                                                            className="mt-1.5 inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-background text-xs font-medium hover:bg-accent hover:text-accent-foreground sm:w-fit sm:px-3"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Materials Section */}
                        {(activeTab === "all" || activeTab === "materials") && (
                            <section className={`space-y-3 ${activeTab === "materials" ? "md:col-span-2" : ""}`}>
                                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                                    <BookOpen size={20} className="text-primary" />
                                    <h2 className="text-lg font-semibold">Study Materials ({filteredMaterials.length})</h2>
                                </div>

                                {filteredMaterials.length === 0 ? (
                                    <p className="py-4 text-sm text-muted-foreground">No study materials matched.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {filteredMaterials.map((material) => {
                                            const href = material.url ||
                                                (material.filePath ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id }) : "");

                                            return (
                                                <div
                                                    key={material._id}
                                                    className="overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50 hover:shadow-sm"
                                                >
                                                    <div className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] capitalize text-secondary-foreground">
                                                                    {material.type}
                                                                </span>
                                                                <span className="truncate text-[11px] text-muted-foreground">
                                                                    By {material.author}
                                                                </span>
                                                            </div>
                                                            <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                                                                {material.title}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground">{material.subject}</p>
                                                            {href && (
                                                                <a
                                                                    href={href}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="mt-1.5 inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:w-fit"
                                                                >
                                                                    Open Resource
                                                                    <ExternalLink size={14} className="ml-1.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}