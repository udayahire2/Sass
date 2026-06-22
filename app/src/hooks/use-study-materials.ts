import { useState, useEffect, useMemo } from "react";
import {
  fetchSubjectUnits,
  fetchSubjectsByBranchSemester,
  fetchTopicById,
  type Subject,
  type Topic,
  type Unit,
} from "@/services/api";

interface UseStudyMaterialsProps {
  branch?: string;
  semester?: string;
  subjectId?: string;
  topicId?: string;
}

export function useStudyMaterials({
  branch,
  semester,
  subjectId,
  topicId,
}: UseStudyMaterialsProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [subjectUnits, setSubjectUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loadingTopic, setLoadingTopic] = useState(false);

  // Fetch Subjects
  useEffect(() => {
    if (!branch || !semester) return;

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) setLoadingSubjects(true);
    });

    fetchSubjectsByBranchSemester(branch, semester)
      .then((items) => {
        if (mounted) setSubjects(items);
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
        if (mounted) setSubjects([]);
      })
      .finally(() => {
        if (mounted) setLoadingSubjects(false);
      });

    return () => {
      mounted = false;
    };
  }, [branch, semester]);

  // Fetch Units
  useEffect(() => {
    if (!subjectId) return;

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) setLoadingUnits(true);
    });

    fetchSubjectUnits(subjectId)
      .then((units) => {
        if (mounted) setSubjectUnits(units);
      })
      .catch((error) => {
        console.error("Error fetching units:", error);
        if (mounted) setSubjectUnits([]);
      })
      .finally(() => {
        if (mounted) setLoadingUnits(false);
      });

    return () => {
      mounted = false;
    };
  }, [subjectId]);

  // Fetch Topic
  useEffect(() => {
    if (!topicId) return;

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) setLoadingTopic(true);
    });

    fetchTopicById(topicId)
      .then((item) => {
        if (mounted) setTopic(item);
      })
      .catch((error) => {
        console.error("Error fetching topic:", error);
        if (mounted) setTopic(null);
      })
      .finally(() => {
        if (mounted) setLoadingTopic(false);
      });

    return () => {
      mounted = false;
    };
  }, [topicId]);

  // Active Subject Selection
  const activeSubject = useMemo(() => {
    if (!subjectId) return undefined;
    const subject = subjects.find((item) => item.id === subjectId);
    if (!subject) return undefined;
    return {
      ...subject,
      units: subjectUnits,
    };
  }, [subjectId, subjects, subjectUnits]);

  // Active Topic Selection
  const activeTopic = useMemo(() => {
    if (topic) return topic;
    if (activeSubject && topicId) {
      return activeSubject.units
        .flatMap((unit) => unit.topics)
        .find((item) => item.id === topicId);
    }
    return undefined;
  }, [topic, activeSubject, topicId]);

  // Aggregated Loading State
  const isLoading =
    (Boolean(branch && semester && !subjectId) && loadingSubjects) ||
    (Boolean(subjectId && !topicId) && (loadingSubjects || loadingUnits)) ||
    (Boolean(topicId) && (loadingTopic || loadingSubjects || loadingUnits));

  return {
    subjects,
    activeSubject,
    activeTopic,
    isLoading,
    loadingSubjects,
    loadingUnits,
    loadingTopic,
  };
}
