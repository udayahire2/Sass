import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, LayoutList } from "lucide-react";
import { Empty, EmptyTitle, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { Topic } from "@/services/api";
import type { SubjectManagerContext } from "../../hooks/use-subject-manager";
import TopicEditorPage from "../../TopicEditorPage";
import {
    Drawer,
    DrawerPopup,
    DrawerPanel,
} from "@/components/ui/drawer";

interface TopicListColumnProps {
    manager: SubjectManagerContext;
    onEditTopic: (topic: Topic) => void;
    onCreateTopic: () => void;
}

export function TopicListColumn({ manager, onEditTopic, onCreateTopic }: TopicListColumnProps) {
    const { allTopics, selectedSubject, selectedTopic, loadingTopics, setSelectedTopic, handleDeleteTopic, reloadTopics } = manager;

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this topic?')) {
            await handleDeleteTopic(id);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background">
            <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-muted-foreground" />
                    Topics {selectedSubject && <span className="text-muted-foreground font-normal ml-2">in {selectedSubject.title}</span>}
                </div>
                <Button size="sm" disabled={!selectedSubject} onClick={onCreateTopic}>
                    <Plus className="w-4 h-4 mr-2" /> Add Topic
                </Button>
            </div>
            
            <div className="flex-1 overflow-hidden flex relative">
                <div className="flex flex-col h-full overflow-y-auto p-4 space-y-2 transition-all w-full">
                    {!selectedSubject ? (
                        <Empty className="my-auto">
                            <EmptyHeader>
                                <EmptyTitle>No Subject Selected</EmptyTitle>
                                <EmptyDescription>Select a subject to view its topics.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : loadingTopics ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
                    ) : allTopics.length === 0 ? (
                        <Empty className="my-auto">
                            <EmptyHeader>
                                <EmptyTitle>No Topics Yet</EmptyTitle>
                                <EmptyDescription>Click the button above to add the first topic.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : allTopics.map((t, idx) => (
                        <div 
                            key={t.id} 
                            className={cn(
                                "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                                selectedTopic?.id === t.id ? "ring-2 ring-primary border-transparent bg-primary/5" : "bg-card"
                            )}
                        >
                            <div className="flex flex-col min-w-0 flex-1 pr-3" onClick={() => setSelectedTopic(t)}>
                                <span className="text-xs font-semibold text-primary mb-1">Topic {idx + 1}</span>
                                <span className="font-medium text-sm leading-tight mb-1">{t.title}</span>
                                {t.description && <span className="text-xs text-muted-foreground line-clamp-2">{t.description}</span>}
                            </div>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onEditTopic(t); }}>
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-red-500" onClick={(e) => handleDelete(t.id, e)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Drawer open={!!selectedTopic} onOpenChange={(open) => {
                if (!open) setSelectedTopic(null);
            }}>
                <DrawerPopup showBar className="h-[95vh]">
                    <DrawerPanel className="p-0 overflow-y-auto">
                        {selectedTopic && (
                            <TopicEditorPage 
                                topicId={selectedTopic.id} 
                                isEmbedded={true}
                                onSaved={() => {
                                    reloadTopics();
                                    setSelectedTopic(null);
                                }}
                                onCancel={() => setSelectedTopic(null)}
                            />
                        )}
                    </DrawerPanel>
                </DrawerPopup>
            </Drawer>
        </div>
    );
}
