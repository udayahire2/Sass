import ResourceCollectionPage from "@/components/study-materials/ResourceCollectionPage";

export default function SamplePapersPage() {
  return (
    <ResourceCollectionPage
      category="Sample Paper"
      title="Sample Question Papers"
      description="Sample, model, and practice question papers to help you prepare with an exam-style format."
      emptyTitle="No sample papers published yet"
      emptyDescription="Admin-published sample question papers will appear here as soon as they are available."
    />
  );
}
