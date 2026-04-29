---
title: "Content Types"
description: "Reference for all supported resource types in UDX."
---

## Supported Types

UDX supports four resource types, each rendered differently in the student view.

| Type | Icon | Description |
|------|------|-------------|
| **Notes** | 📝 | Text-based study notes (Markdown or plain text) |
| **PDF** | 📄 | Lecture slides, handouts, question papers |
| **Video** | 🎬 | Recorded lectures, tutorials |
| **Link** | 🔗 | External references, YouTube, GitHub repos |

## Notes (Markdown)

Notes are stored as Markdown and rendered natively in the browser. They support:

- Headings, lists, bold, italics
- Code blocks with syntax highlighting
- Tables
- Blockquotes

```md
## Unit 2 — Stacks

A **stack** is a linear data structure that follows LIFO order.

\`\`\`python
stack = []
stack.append(1)
stack.pop()
\`\`\`
```

## PDF

PDFs are stored in Supabase Storage and displayed in an embedded viewer. Students can also download them directly.

## Video

Videos are embedded using the built-in video player. Supported sources:

- Direct `.mp4` uploaded files
- YouTube URLs (embed format)

## Link

External links open in a new tab. Useful for referencing official documentation, GitHub repositories, or online courses.
