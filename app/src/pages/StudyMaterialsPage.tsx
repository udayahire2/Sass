import { ChevronRight, ExternalLink, FileText, Ghost, Home, Loader2, Search, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BranchSemesterSelection } from "@/components/study/BranchSemesterSelection";
import { SubjectDashboard } from "@/components/study/SubjectDashboard";
import { SubjectGrid } from "@/components/study/SubjectGrid";
import { TopicViewer } from "@/components/study/TopicViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildAssetUrl,
  fetchSubjectUnits,
  fetchSubjectsByBranchSemester,
  fetchTopicById,
  type Subject,
  type Topic,
  type Unit,
} from "@/services/api";
import { fetchApprovedMaterials, type StudyMaterial } from "@/services/study-service";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";

export default function StudyMaterialsPage() {
  const { branch, semester, subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const [tempBranch, setTempBranch] = useState<string | null>(null);
  const [approvedUploads, setApprovedUploads] = useState<StudyMaterial[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectUnits, setSubjectUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetchApprovedMaterials()
      .then((materials) => {
        if (mounted) {
          setApprovedUploads(materials);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingUploads(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!branch || !semester) {
      setSubjects([]);
      return;
    }

    let mounted = true;
    setLoadingSubjects(true);

    fetchSubjectsByBranchSemester(branch, semester)
      .then((items) => {
        if (mounted) {
          setSubjects(items);
        }
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
        if (mounted) {
          setSubjects([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSubjects(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [branch, semester]);

  useEffect(() => {
    if (!subjectId) {
      setSubjectUnits([]);
      return;
    }

    let mounted = true;
    setLoadingUnits(true);

    fetchSubjectUnits(subjectId)
      .then((units) => {
        if (mounted) {
          setSubjectUnits(units);
        }
      })
      .catch((error) => {
        console.error("Error fetching subject units:", error);
        if (mounted) {
          setSubjectUnits([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingUnits(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  useEffect(() => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    let mounted = true;
    setLoadingTopic(true);

    fetchTopicById(topicId)
      .then((item) => {
        if (mounted) {
          setTopic(item);
        }
      })
      .catch((error) => {
        console.error("Error fetching topic:", error);
        if (mounted) {
          setTopic(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingTopic(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [topicId]);

  const handleBranchSelect = (selectedBranch: string) => {
    setTempBranch(selectedBranch);
  };

  const handleSemesterSelect = (selectedSemester: string) => {
    if (tempBranch) {
      navigate(`/resources/${tempBranch}/${selectedSemester}`);
    }
  };

  const isRoot = !branch || !semester;
  const isSubjectList = branch && semester && !subjectId;
  const isSubjectDashboard = subjectId && !topicId;
  const isTopicView = !!topicId;

  const activeSubject = useMemo(() => {
    if (!subjectId) {
      return undefined;
    }

    const subject = subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return undefined;
    }

    return {
      ...subject,
      units: subjectUnits,
    };
  }, [subjectId, subjects, subjectUnits]);
  const activeTopic =
    topic ||
    (activeSubject && topicId
      ? activeSubject.units.flatMap((unit) => unit.topics).find((item) => item.id === topicId)
      : undefined);
  const loadingAcademicContent =
    (Boolean(isSubjectList) && loadingSubjects) ||
    (Boolean(isSubjectDashboard) && (loadingSubjects || loadingUnits)) ||
    (isTopicView && (loadingTopic || loadingSubjects || loadingUnits));

  return (
    <div className={cn(
      "mx-auto w-full space-y-10 px-4 py-8 sm:px-6 md:py-12",
      isTopicView ? "max-w-270" : "max-w-270"
    )}>
      
      {/* Header — hidden in topic view since TopicViewer renders its own */}
      {!isTopicView && (
        <>
          {/* Minimalistic Header Section */}
          <div className="flex flex-col gap-5">
            
            {/* Notion-style Clean Breadcrumbs */}
            <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[13px] font-medium text-muted-foreground pb-1">
              <Link 
                to="/resources" 
                className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5 opacity-80" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              {branch && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                  <button 
                    onClick={() => navigate("/resources")}
                    className="rounded-[6px] px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    {branch}
                  </button>
                </>
              )}
              
              {branch && semester && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                  <button
                    onClick={() => navigate(`/resources/${branch}/${semester}`)}
                    className="rounded-[6px] px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    Sem {semester}
                  </button>
                </>
              )}
              
              {activeSubject && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                  <span className="rounded-[6px] px-2 py-1 text-foreground bg-secondary/50">
                    {activeSubject.code}
                  </span>
                </>
              )}
            </nav>

            {/* Title & Metadata Setup */}
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {isRoot
                  ? "Find Your Materials"
                  : activeSubject
                    ? activeSubject.name
                    : `Semester ${semester} Subjects`}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[14px] leading-relaxed text-muted-foreground max-w-2xl">
                  {isRoot 
                    ? "Start by selecting your branch and semester. Your customized study material is just a click away." 
                     : "Streamlined and organized to save you time. Dive into your resources below."}
                </p>
                
                {/* Minimal Property Badges */}
                {!isRoot && (
                  <div className="flex flex-wrap items-center gap-2">
                    {branch && (
                      <Badge variant="secondary" className="rounded-[6px] bg-muted/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-foreground">
                        {branch}
                      </Badge>
                    )}
                    {semester && (
                      <Badge variant="secondary" className="rounded-[6px] bg-muted/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-foreground">
                        Sem {semester}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Structural Divider */}
          <div className="h-px w-full bg-border/40" />
        </>
      )}

      {/* Routing Views Container */}
      <div className="min-h-100 w-full">
        {isRoot && (
          <div className="space-y-10">
            <BranchSemesterSelection
              selectedBranch={tempBranch}
              selectedSemester={null}
              onBranchSelect={handleBranchSelect}
              onSemesterSelect={handleSemesterSelect}
            />
            <ApprovedUploadsSection materials={approvedUploads} loading={loadingUploads} />
          </div>
        )}

        {loadingAcademicContent && <AcademicLoadingState />}

        {!loadingAcademicContent && isSubjectList && <SubjectGrid subjects={subjects} branch={branch!} semester={semester!} />}

        {!loadingAcademicContent && isSubjectDashboard && activeSubject && <SubjectDashboard subject={activeSubject} />}

        {!loadingAcademicContent && isTopicView && activeTopic && <TopicViewer topic={activeTopic} subject={activeSubject} />}
      </div>
      
    </div>
  );
}

function AcademicLoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-border/50">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function ApprovedUploadsSection({
  materials,
  loading,
}: {
  materials: StudyMaterial[];
  loading: boolean;
}) {
  const { user } = useLocalAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  // Get unique types for filter pills
  const types = useMemo(() => {
    const set = new Set(materials.map((m) => m.type));
    return Array.from(set);
  }, [materials]);

  // Filter materials based on search + type
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !activeTypeFilter || m.type === activeTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [materials, searchQuery, activeTypeFilter]);

  return (
    <section className="space-y-5 border-t border-border/50 pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit rounded-md">
            Community uploads
          </Badge>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Approved study content</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Student submissions reviewed by admins and shared with proper credit.
            </p>
          </div>
        </div>
        {user && (
          <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
            <Link to="/add-study-content">
              <UploadCloud className="h-4 w-4" />
              Add Your Study Content
            </Link>
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {!loading && materials.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, subject, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/80 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                variant="ghost"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Type Filter Pills */}
          {types.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTypeFilter(null)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  !activeTypeFilter
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                All
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(activeTypeFilter === type ? null : type)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTypeFilter === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="flex min-h-36 items-center justify-center rounded-xl border border-border/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No approved uploads yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to submit useful study material.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No matching results</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search term or remove the filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((material) => {
            const href =
              material.url ||
              (material.filePath
                ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id })
                : "");

            return (
              <article
                key={material._id}
                className="group rounded-xl border border-border/50 bg-background/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-background hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">{material.title}</h3>
                      <p className="text-xs text-muted-foreground">{material.subject}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-lg text-xs shrink-0">
                    {material.type}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/30 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Uploaded by {material.author}</p>
                  {href && (
                    <Button asChild size="sm" className="rounded-xl">
                      <a href={href} target="_blank" rel="noreferrer">
                       <Button variant="outline"> Open
                        <ExternalLink className="h-3.5 w-3.5" /></Button>
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
