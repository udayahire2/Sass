import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BranchSemesterSelection } from "@/components/study/BranchSemesterSelection";
import { SubjectDashboard } from "@/components/study/SubjectDashboard";
import { SubjectGrid } from "@/components/study/SubjectGrid";
import { TopicViewer } from "@/components/study/TopicViewer";
import { useStudyMaterials } from "@/hooks/use-study-materials";
import { AcademicLoadingState } from "@/components/study-materials/layout/AcademicLoadingState";
import { PageContainer } from "@/components/study-materials/layout/PageContainer";

export default function StudyMaterialsPage() {
  const { branch, semester, subjectId, topicId } = useParams();
  const navigate = useNavigate();

  const [tempBranch, setTempBranch] = useState<string | null>(null);

  const {
    subjects,
    activeSubject,
    activeTopic,
    isLoading: loadingAcademicContent,
  } = useStudyMaterials({ branch, semester, subjectId, topicId });

  const handleBranchSelect = (selectedBranch: string) => {
    setTempBranch(selectedBranch);
  };

  const handleSemesterSelect = (selectedSemester: string) => {
    if (!tempBranch) return;
    navigate(`/resources/${tempBranch}/${selectedSemester}`);
  };

  const isRoot = !branch || !semester;
  const isSubjectList = branch && semester && !subjectId;
  const isSubjectDashboard = subjectId && !topicId;
  const isTopicView = Boolean(topicId);

  return (
    <PageContainer maxWidth="wide" className="py-6 sm:py-8">
      {/* Header */}
      {!isTopicView && (
        <div className="mb-8 border-b border-border/50 pb-6">
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
                  onClick={() => navigate("/resources")}
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
                  onClick={() => navigate(`/resources/${branch}/${semester}`)}
                  className="rounded-md px-2 py-1 transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  Semester {semester}
                </button>
              </>
            )}

            {activeSubject && (
              <>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <span className="px-2 py-1 text-foreground">
                  {activeSubject.code}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {!isRoot && (
                <div className="flex flex-wrap items-center gap-2">
                  {branch && (
                    <Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-medium">
                      {branch}
                    </Badge>
                  )}
                  {semester && (
                    <Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-medium">
                      Semester {semester}
                    </Badge>
                  )}
                </div>
              )}

              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {isRoot
                  ? "Find study materials"
                  : activeSubject
                    ? activeSubject.name
                    : `Semester ${semester} subjects`}
              </h1>

              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {isRoot
                  ? "Browse syllabus, notes, previous papers, and academic resources organized by branch and semester."
                  : "Structured study materials designed for focused and distraction-free learning."}
              </p>
            </div>

            {!isRoot && (
              <div className="hidden lg:flex">
                <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                  <p className="text-xs text-muted-foreground">Academic Resources</p>
                  <p className="text-sm font-medium">NMU Study Hub</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[50vh]">
        {isRoot && (
          <BranchSemesterSelection
            selectedBranch={tempBranch}
            selectedSemester={null}
            onBranchSelect={handleBranchSelect}
            onSemesterSelect={handleSemesterSelect}
          />
        )}

        {loadingAcademicContent && <AcademicLoadingState />}

        {!loadingAcademicContent && isSubjectList && (
          <SubjectGrid subjects={subjects} branch={branch!} semester={semester!} />
        )}

        {!loadingAcademicContent && isSubjectDashboard && activeSubject && (
          <SubjectDashboard subject={activeSubject} />
        )}

        {!loadingAcademicContent && isTopicView && activeTopic && (
          <TopicViewer topic={activeTopic} subject={activeSubject!} />
        )}
      </div>
    </PageContainer>
  );
}
