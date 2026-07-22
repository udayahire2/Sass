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
            <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2">
                    <LayoutList className="w-4 h-4 text-muted-foreground" />
                    Topics {selectedSubject && <span className="text-muted-foreground font-normal ml-1 truncate max-w-[200px]">/ {selectedSubject.title}</span>}
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs shadow-sm" disabled={!selectedSubject} onClick={onCreateTopic}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Topic
                </Button>
            </div>
            
            <div className="flex-1 overflow-hidden flex relative">
                <div className="flex flex-col h-full overflow-y-auto px-6 py-4 space-y-3 transition-all w-full">
                    {!selectedSubject ? (
                        <Empty className="my-auto">
                            <EmptyHeader>
                                <EmptyTitle className="text-sm font-medium">No Subject Selected</EmptyTitle>
                                <EmptyDescription className="text-xs">Select a subject to view its topics.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : loadingTopics ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-5 h-5" /></div>
                    ) : allTopics.length === 0 ? (
                        <Empty className="my-auto">
                            <EmptyHeader>
                                <EmptyTitle className="text-sm font-medium">No Topics Yet</EmptyTitle>
                                <EmptyDescription className="text-xs">Click the button above to add the first topic.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : allTopics.map((t, idx) => (
                        <div 
                            key={t.id} 
                            onClick={() => setSelectedTopic(t)}
                            className={cn(
                                "flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all group",
                                selectedTopic?.id === t.id 
                                    ? "border-border shadow-sm bg-accent/20" 
                                    : "border-border/40 hover:border-border/80 hover:bg-accent/10"
                            )}
                        >
                            <div className="flex flex-col min-w-0 flex-1 pr-4">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Topic {idx + 1}</span>
                                <span className="font-semibold text-sm leading-tight text-foreground mb-1.5">{t.title}</span>
                                {t.description && <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</span>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground border border-transparent hover:border-border shadow-sm transition-all" onClick={(e) => { e.stopPropagation(); onEditTopic(t); }}>
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-200 dark:hover:border-red-900 shadow-sm transition-all" onClick={(e) => handleDelete(t.id, e)}>
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
