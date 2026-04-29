---
title: "Syllabus"
description: "How the academic curriculum is structured and managed in UDX."
---

## Overview

The Syllabus module provides a structured view of the academic curriculum for each branch and semester. It helps students understand what topics are covered and track their progress.

## Structure

```
Branch
└── Semester
    └── Subject (Code + Name)
        └── Unit
            └── Topic
```

Each **subject** has a unique subject code (e.g. `CS301`) and belongs to a specific branch and semester.

## Accessing the Syllabus

Navigate to **Syllabus** from the top navigation. Select your branch and semester to view the full subject list with topic breakdowns.

## Subject Data

| Field | Description |
|-------|-------------|
| `code` | Unique subject code (e.g. `CS301`) |
| `name` | Subject display name |
| `branch` | Associated branch |
| `semester` | Semester number (1–8) |
| `units` | Array of units, each with a list of topics |

## Admin: Managing Syllabus

Admins can manage syllabus content at `/admin/syllabus`:

- Add or remove subjects
- Edit unit names and topic lists
- Reorder units within a subject

Changes are reflected immediately in the student-facing syllabus view.
