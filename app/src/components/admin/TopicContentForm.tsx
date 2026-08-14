import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { Plus, Trash2, Save, Loader2, Video, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { updateTopic, type Topic } from '@/services/api';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface TopicContentFormProps {
  topic: Topic;
  onSaved: (updatedTopic: Topic) => void;
  onCancel: () => void;
}

export const TopicContentForm: React.FC<TopicContentFormProps> = ({ topic, onSaved, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic metadata
  const [title, setTitle] = useState(topic.title || '');
  const [description, setDescription] = useState(topic.description || '');
  const [estimatedTime, setEstimatedTime] = useState(topic.estimatedTime || '');
  const [videoUrl, setVideoUrl] = useState(topic.videoUrl || '');
  
  // Summary Points
  const [summaryPoints, setSummaryPoints] = useState<string[]>(topic.summaryPoints || []);
  
  // Try to parse existing content_json
  let initialSections = [];
  let initialIntro = { overview: '', objectives: '', prerequisites: '' };
  try {
    if (topic.contentJson) {
      const parsed = JSON.parse(topic.contentJson);
      initialSections = parsed.sections || [];
      initialIntro = parsed.intro || { overview: '', objectives: '', prerequisites: '' };
    }
  } catch (e) {
    console.error("Failed to parse contentJson", e);
  }

  const [intro, setIntro] = useState(initialIntro);
  const [sections, setSections] = useState<any[]>(initialSections);

  const handleAddSection = () => {
    setSections([...sections, { title: '', content: '' }]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, field: string, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleAddSummaryPoint = () => {
    setSummaryPoints([...summaryPoints, '']);
  };

  const handleUpdateSummaryPoint = (index: number, value: string) => {
    const updated = [...summaryPoints];
    updated[index] = value;
    setSummaryPoints(updated);
  };

  const handleRemoveSummaryPoint = (index: number) => {
    setSummaryPoints(summaryPoints.filter((_, i) => i !== index));
  };

  const generateMarkdown = () => {
    let md = '';
    
    // Introduction
    if (intro.overview) {
      md += `## Overview\n\n${intro.overview}\n\n`;
    }
    if (intro.objectives) {
      md += `## Learning Objectives\n\n${intro.objectives}\n\n`;
    }
    if (intro.prerequisites) {
      md += `## Prerequisites\n\n${intro.prerequisites}\n\n`;
    }

    // Sections
    sections.forEach((sec) => {
      if (sec.title) {
        md += `## ${sec.title}\n\n`;
      }
      if (sec.content) {
        md += `${sec.content}\n\n`;
      }
      if (sec.notes) {
        md += `> **Note:** ${sec.notes}\n\n`;
      }
      if (sec.warning) {
        md += `> **Warning:** ${sec.warning}\n\n`;
      }
      if (sec.tips) {
        md += `> **Tip:** ${sec.tips}\n\n`;
      }
    });

    return md;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const markdown = generateMarkdown();
      const contentJson = JSON.stringify({
        intro,
        sections
      });

      const updated = await updateTopic(topic.id, {
        title,
        description,
        estimated_time: estimatedTime,
        video_url: videoUrl,
        summary_points: summaryPoints.filter(s => s.trim() !== ''),
        content_markdown: markdown,
        content_json: contentJson
      });
      
      toast.success('Topic content saved successfully');
      onSaved(updated);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save topic');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Edit Content</h2>
          <p className="text-sm text-muted-foreground">{topic.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Content
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Basic Settings */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Basic Information</h3>
          
          <Field>
            <FieldLabel>Topic Title</FieldLabel>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </Field>
          
          <Field>
            <FieldLabel>Short Description</FieldLabel>
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief summary of what this topic covers..."
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Estimated Time
              </FieldLabel>
              <Input 
                value={estimatedTime} 
                onChange={e => setEstimatedTime(e.target.value)} 
                placeholder="e.g. 15 mins"
              />
            </Field>
            
            <Field>
              <FieldLabel className="flex items-center gap-2">
                <Video className="w-4 h-4 text-muted-foreground" /> Video URL (Optional)
              </FieldLabel>
              <Input 
                value={videoUrl} 
                onChange={e => setVideoUrl(e.target.value)} 
                placeholder="YouTube URL..."
              />
            </Field>
          </div>
        </section>

        {/* Introduction */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Introduction</h3>
          
          <Field>
            <FieldLabel>Overview</FieldLabel>
            <Textarea 
              value={intro.overview} 
              onChange={e => setIntro({...intro, overview: e.target.value})} 
              placeholder="Topic overview..."
              rows={3}
            />
          </Field>
          
          <Field>
            <FieldLabel>Learning Objectives</FieldLabel>
            <Textarea 
              value={intro.objectives} 
              onChange={e => setIntro({...intro, objectives: e.target.value})} 
              placeholder="What will the student learn? (Markdown supported)"
              rows={3}
            />
          </Field>
          
          <Field>
            <FieldLabel>Prerequisites</FieldLabel>
            <Textarea 
              value={intro.prerequisites} 
              onChange={e => setIntro({...intro, prerequisites: e.target.value})} 
              placeholder="What should they know before this?"
              rows={2}
            />
          </Field>
        </section>

        {/* Sections */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Detailed Sections</h3>
            <Button variant="outline" size="sm" onClick={handleAddSection}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="p-4 border rounded-xl bg-muted/20 space-y-6 relative group">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveSection(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <Field className="pr-12">
                  <FieldLabel>Section Title</FieldLabel>
                  <Input 
                    value={section.title} 
                    onChange={e => handleUpdateSection(index, 'title', e.target.value)} 
                    placeholder="e.g. Setting up the environment"
                  />
                </Field>
                
                <Field>
                  <FieldLabel>Content</FieldLabel>
                  <RichTextEditor 
                    content={section.content}
                    onChange={(val) => handleUpdateSection(index, 'content', val)}
                  />
                </Field>

                {/* Optional Callouts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <Field>
                    <FieldLabel className="text-blue-500">Info Note</FieldLabel>
                    <Textarea 
                      className="text-xs min-h-[60px]"
                      value={section.notes || ''} 
                      onChange={e => handleUpdateSection(index, 'notes', e.target.value)} 
                    />
                  </Field>
                  
                  <Field>
                    <FieldLabel className="text-amber-500">Warning Note</FieldLabel>
                    <Textarea 
                      className="text-xs min-h-[60px]"
                      value={section.warning || ''} 
                      onChange={e => handleUpdateSection(index, 'warning', e.target.value)} 
                    />
                  </Field>
                  
                  <Field>
                    <FieldLabel className="text-emerald-500">Pro Tip</FieldLabel>
                    <Textarea 
                      className="text-xs min-h-[60px]"
                      value={section.tips || ''} 
                      onChange={e => handleUpdateSection(index, 'tips', e.target.value)} 
                    />
                  </Field>
                </div>
              </div>
            ))}
            
            {sections.length === 0 && (
              <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground bg-muted/30">
                No sections added yet. Add sections to build your content.
              </div>
            )}
          </div>
        </section>

        {/* Summary Points */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Takeaways</h3>
            <Button variant="outline" size="sm" onClick={handleAddSummaryPoint}>
              <Plus className="w-4 h-4 mr-2" /> Add Point
            </Button>
          </div>

          <div className="space-y-3">
            {summaryPoints.map((point, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="pt-2.5 px-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /></div>
                <Input 
                  value={point} 
                  onChange={e => handleUpdateSummaryPoint(index, e.target.value)} 
                  placeholder="Key takeaway..."
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSummaryPoint(index)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
            
            {summaryPoints.length === 0 && (
              <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground text-sm bg-muted/30">
                Add key takeaways for students to revise quickly.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
