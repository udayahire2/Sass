import { ChevronRight, Home, Loader2, } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BranchSemesterSelection } from "@/components/study/BranchSemesterSelection";
import { SubjectDashboard } from "@/components/study/SubjectDashboard";
import { SubjectGrid } from "@/components/study/SubjectGrid";
import { TopicViewer } from "@/components/study/TopicViewer";
import { Badge } from "@/components/ui/badge";
import {
  fetchSubjectUnits,
  fetchSubjectsByBranchSemester,
  fetchTopicById,
  type Subject,
  type Topic,
  type Unit,
} from "@/services/api";
import { cn } from "@/lib/utils";

export default function StudyMaterialsPage() {
  const { branch, semester, subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const [tempBranch, setTempBranch] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectUnits, setSubjectUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);
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
    <div className="w-full space-y-6">
      <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-border/40 bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
