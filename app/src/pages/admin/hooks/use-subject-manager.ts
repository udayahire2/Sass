import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
    fetchBranches,
    createBranchData,
    updateBranchData,
    deleteBranchData,
    fetchSubjectsByBranchSemester,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjectUnits,
    createUnit,
    createTopic,
    updateTopic,
    deleteTopic,
    type BranchData,
    type Subject,
    type Topic,
    type Unit,
} from "@/services/api";

export function useSubjectManager() {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    
    const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<string>("3");
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);

    const loadBranches = useCallback(async () => {
        setLoadingBranches(true);
        try {
            const data = await fetchBranches(true);
            setBranches(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load branches");
        } finally {
            setLoadingBranches(false);
        }
    }, []);

    const loadSubjects = useCallback(async (branchName: string, semester: string) => {
        setLoadingSubjects(true);
        try {
            const data = await fetchSubjectsByBranchSemester(branchName, semester);
            setSubjects(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load subjects");
        } finally {
            setLoadingSubjects(false);
        }
    }, []);

    const loadTopics = useCallback(async (subjectId: string) => {
        setLoadingTopics(true);
        try {
            const data = await fetchSubjectUnits(subjectId);
            setUnits(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load topics");
        } finally {
            setLoadingTopics(false);
        }
    }, []);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    useEffect(() => {
        if (selectedBranch) {
            loadSubjects(selectedBranch.name, selectedSemester);
            setSelectedSubject(null);
            setUnits([]);
        } else {
            setSubjects([]);
            setSelectedSubject(null);
            setUnits([]);
        }
    }, [selectedBranch, selectedSemester, loadSubjects]);

    useEffect(() => {
        if (selectedSubject) {
            loadTopics(selectedSubject.id);
        } else {
            setUnits([]);
        }
    }, [selectedSubject, loadTopics]);

    const handleSaveBranch = async (branchForm: Partial<BranchData>) => {
        if (branchForm.id) {
            await updateBranchData(branchForm.id, branchForm);
            toast.success("Branch updated");
        } else {
            await createBranchData(branchForm);
            toast.success("Branch created");
        }
        await loadBranches();
    };

    const handleDeleteBranch = async (id: string) => {
        await deleteBranchData(id);
        toast.success("Branch deleted");
        if (selectedBranch?.id === id) setSelectedBranch(null);
        await loadBranches();
    };

    const handleSaveSubject = async (subjectForm: Partial<Subject>) => {
        if (!selectedBranch) return;
        if (subjectForm.id) {
            await updateSubject(subjectForm.id, subjectForm);
            toast.success("Subject updated");
        } else {
            await createSubject({
                ...subjectForm,
                branch: selectedBranch.name,
                semester: Number(selectedSemester)
            });
            toast.success("Subject created");
        }
        await loadSubjects(selectedBranch.name, selectedSemester);
    };

    const handleDeleteSubject = async (id: string) => {
        if (!selectedBranch) return;
        await deleteSubject(id);
        toast.success("Subject deleted");
        if (selectedSubject?.id === id) setSelectedSubject(null);
        await loadSubjects(selectedBranch.name, selectedSemester);
    };

    const handleSaveTopic = async (topicForm: Partial<Topic>) => {
        if (!selectedSubject) return;
        if (topicForm.id) {
            await updateTopic(topicForm.id, topicForm);
            toast.success("Topic updated");
        } else {
            let targetUnitId = units.length > 0 ? units[0].id : null;
            if (!targetUnitId) {
                const newUnit = await createUnit(selectedSubject.id, { title: "Unit 1", unit_number: 1 });
                targetUnitId = newUnit.id;
            }
            await createTopic(targetUnitId, topicForm);
            toast.success("Topic created");
        }
        await loadTopics(selectedSubject.id);
    };

    const handleDeleteTopic = async (id: string) => {
        if (!selectedSubject) return;
        await deleteTopic(id);
        toast.success("Topic deleted");
        await loadTopics(selectedSubject.id);
    };

    return {
        // State
        branches,
        subjects,
        units,
        allTopics: units.flatMap(u => u.topics),
        selectedBranch,
        selectedSemester,
        selectedSubject,
        selectedTopic,
        loadingBranches,
        loadingSubjects,
        loadingTopics,
        // Setters
        setSelectedBranch,
        setSelectedSemester,
        setSelectedSubject,
        setSelectedTopic,
        // Actions
        handleSaveBranch,
        handleDeleteBranch,
        handleSaveSubject,
        handleDeleteSubject,
        handleSaveTopic,
        handleDeleteTopic,
        reloadTopics: () => selectedSubject && loadTopics(selectedSubject.id)
    };
}

export type SubjectManagerContext = ReturnType<typeof useSubjectManager>;
