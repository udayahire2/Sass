import ResourceCollectionPage from "@/components/study-materials/ResourceCollectionPage";

export default function ImpQuestionsPage() {
  return (
    <ResourceCollectionPage
      category="IMP Questions"
      title="Important Questions"
      description="Curated important questions for exam preparation, organized by subject, branch, and semester."
      emptyTitle="No important questions published yet"
      emptyDescription="Admin-published important questions will appear here as soon as they are available."
    />
  );
}
