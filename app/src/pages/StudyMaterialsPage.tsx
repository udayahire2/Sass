import {
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { Badge } from "@/components/ui/badge";

import { BranchSemesterSelection } from "@/components/study/BranchSemesterSelection";

import { SubjectDashboard } from "@/components/study/SubjectDashboard";

import { SubjectGrid } from "@/components/study/SubjectGrid";

import { TopicViewer } from "@/components/study/TopicViewer";

import {
  fetchSubjectUnits,
  fetchSubjectsByBranchSemester,
  fetchTopicById,
  type Subject,
  type Topic,
  type Unit,
} from "@/services/api";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function StudyMaterialsPage() {
  const {
    branch,
    semester,
    subjectId,
    topicId,
  } = useParams();

  const navigate =
    useNavigate();

  /* ---------------------------------------------------------------------- */
  /* State                                                                  */
  /* ---------------------------------------------------------------------- */

  const [
    tempBranch,
    setTempBranch,
  ] = useState<
    string | null
  >(null);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [
    loadingSubjects,
    setLoadingSubjects,
  ] = useState(false);

  const [
    subjectUnits,
    setSubjectUnits,
  ] = useState<Unit[]>([]);

  const [
    loadingUnits,
    setLoadingUnits,
  ] = useState(false);

  const [topic, setTopic] =
    useState<Topic | null>(
      null
    );

  const [
    loadingTopic,
    setLoadingTopic,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Fetch Subjects                                                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (
      !branch ||
      !semester
    ) {
      return;
    }

    let mounted = true;

    queueMicrotask(() => {
      if (mounted) {
        setLoadingSubjects(true);
      }
    });

    fetchSubjectsByBranchSemester(
      branch,
      semester
    )
      .then((items) => {
        if (mounted) {
          setSubjects(items);
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching subjects:",
          error
        );

        if (mounted) {
          setSubjects([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSubjects(
            false
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [branch, semester]);

  /* ---------------------------------------------------------------------- */
  /* Fetch Units                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!subjectId) {
      return;
    }

    let mounted = true;

    queueMicrotask(() => {
      if (mounted) {
        setLoadingUnits(true);
      }
    });

    fetchSubjectUnits(
      subjectId
    )
      .then((units) => {
        if (mounted) {
          setSubjectUnits(
            units
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching units:",
          error
        );

        if (mounted) {
          setSubjectUnits(
            []
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingUnits(
            false
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  /* ---------------------------------------------------------------------- */
  /* Fetch Topic                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!topicId) {
      return;
    }

    let mounted = true;

    queueMicrotask(() => {
      if (mounted) {
        setLoadingTopic(true);
      }
    });

    fetchTopicById(topicId)
      .then((item) => {
        if (mounted) {
          setTopic(item);
        }
      })
      .catch((error) => {
        console.error(
          "Error fetching topic:",
          error
        );

        if (mounted) {
          setTopic(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingTopic(
            false
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [topicId]);

  /* ---------------------------------------------------------------------- */
  /* Selection                                                              */
  /* ---------------------------------------------------------------------- */

  const handleBranchSelect = (
    selectedBranch: string
  ) => {
    setTempBranch(
      selectedBranch
    );
  };

  const handleSemesterSelect =
    (
      selectedSemester: string
    ) => {
      if (!tempBranch) return;

      navigate(
        `/resources/${tempBranch}/${selectedSemester}`
      );
    };

  /* ---------------------------------------------------------------------- */
  /* Route States                                                           */
  /* ---------------------------------------------------------------------- */

  const isRoot =
    !branch ||
    !semester;

  const isSubjectList =
    branch &&
    semester &&
    !subjectId;

  const isSubjectDashboard =
    subjectId &&
    !topicId;

  const isTopicView =
    Boolean(topicId);

  /* ---------------------------------------------------------------------- */
  /* Active Subject                                                         */
  /* ---------------------------------------------------------------------- */

  const activeSubject =
    useMemo(() => {
      if (!subjectId)
        return undefined;

      const subject =
        subjects.find(
          (item) =>
            item.id ===
            subjectId
        );

      if (!subject)
        return undefined;

      return {
        ...subject,
        units:
          subjectUnits,
      };
    }, [
      subjectId,
      subjects,
      subjectUnits,
    ]);

  /* ---------------------------------------------------------------------- */
  /* Active Topic                                                           */
  /* ---------------------------------------------------------------------- */

  const activeTopic =
    topic ||
    (activeSubject &&
    topicId
      ? activeSubject.units
          .flatMap(
            (unit) =>
              unit.topics
          )
          .find(
            (item) =>
              item.id ===
              topicId
          )
      : undefined);

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  const loadingAcademicContent =
    (Boolean(
      isSubjectList
    ) &&
      loadingSubjects) ||
    (Boolean(
      isSubjectDashboard
    ) &&
      (loadingSubjects ||
        loadingUnits)) ||
    (Boolean(
      isTopicView
    ) &&
      (loadingTopic ||
        loadingSubjects ||
        loadingUnits));

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        {!isTopicView && (
          <div className="mb-8 border-b border-border/50 pb-6">
            
            {/* Breadcrumb */}
            <nav className="mb-5 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-muted-foreground">
              
              <Link
                to="/resources"
                className="flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Link>

              {branch && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />

                  <button
                    onClick={() =>
                      navigate(
                        "/resources"
                      )
                    }
                    className="rounded-md px-2 py-1 transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {branch}
                  </button>
                </>
              )}

              {semester && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />

                  <button
                    onClick={() =>
                      navigate(
                        `/resources/${branch}/${semester}`
                      )
                    }
                    className="rounded-md px-2 py-1 transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    Semester{" "}
                    {semester}
                  </button>
                </>
              )}

              {activeSubject && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />

                  <span className="px-2 py-1 text-foreground">
                    {
                      activeSubject.code
                    }
                  </span>
                </>
              )}
            </nav>

            {/* Header Content */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              
              {/* Left */}
              <div className="max-w-3xl space-y-3">
                
                {/* Metadata */}
                {!isRoot && (
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {branch && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
                      >
                        {branch}
                      </Badge>
                    )}

                    {semester && (
                      <Badge
                        variant="secondary"
                        className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
                      >
                        Semester{" "}
                        {
                          semester
                        }
                      </Badge>
                    )}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {isRoot
                    ? "Find study materials"
                    : activeSubject
                      ? activeSubject.name
                      : `Semester ${semester} subjects`}
                </h1>

                {/* Description */}
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {isRoot
                    ? "Browse syllabus, notes, previous papers, and academic resources organized by branch and semester."
                    : "Structured study materials designed for focused and distraction-free learning."}
                </p>
              </div>

              {/* Right */}
              {!isRoot && (
                <div className="hidden lg:flex">
                  <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Academic Resources
                    </p>

                    <p className="text-sm font-medium">
                      NMU Study Hub
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="min-h-[50vh]">
          
          {/* Root */}
          {isRoot && (
            <BranchSemesterSelection
              selectedBranch={
                tempBranch
              }
              selectedSemester={
                null
              }
              onBranchSelect={
                handleBranchSelect
              }
              onSemesterSelect={
                handleSemesterSelect
              }
            />
          )}

          {/* Loading */}
          {loadingAcademicContent && (
            <AcademicLoadingState />
          )}

          {/* Subject List */}
          {!loadingAcademicContent &&
            isSubjectList && (
              <SubjectGrid
                subjects={
                  subjects
                }
                branch={
                  branch!
                }
                semester={
                  semester!
                }
              />
            )}

          {/* Subject Dashboard */}
          {!loadingAcademicContent &&
            isSubjectDashboard &&
            activeSubject && (
              <SubjectDashboard
                subject={
                  activeSubject
                }
              />
            )}

          {/* Topic */}
          {!loadingAcademicContent &&
            isTopicView &&
            activeTopic && (
              <TopicViewer
                topic={
                  activeTopic
                }
                subject={
                  activeSubject
                }
              />
            )}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function AcademicLoadingState() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-muted" />

        <div className="h-4 w-96 max-w-full animate-pulse rounded-xl bg-muted/70" />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, i) => (
          <div
            key={i}
            className="flex h-40 items-center justify-center rounded-2xl border border-border/50 bg-muted/20"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}
