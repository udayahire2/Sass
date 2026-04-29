---
title: "API Endpoints"
description: "Complete reference for all UDX REST API endpoints."
---

## Resources

### GET `/api/resources`

Returns all approved study materials.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `branch` | string | No | Filter by branch name |
| `semester` | number | No | Filter by semester (1–8) |
| `subject` | string | No | Filter by subject ID |
| `type` | string | No | Filter by type (`pdf`, `notes`, `video`, `link`) |

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Unit 3 — Linked Lists",
    "type": "notes",
    "subject_id": "uuid",
    "uploaded_by": "faculty-uuid",
    "url": "https://storage.supabase.co/...",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### POST `/api/resources`

Upload a new resource. Requires `faculty` or `admin` role.

**Body:**

```json
{
  "title": "Unit 3 — Linked Lists",
  "description": "Covers singly and doubly linked lists",
  "type": "notes",
  "subject_id": "uuid",
  "url": "https://storage.supabase.co/..."
}
```

### PATCH `/api/resources/:id/approve`

Approve a pending resource. Requires `admin` role.

### PATCH `/api/resources/:id/reject`

Reject a pending resource. Requires `admin` role.

**Body (optional):**

```json
{ "reason": "Incorrect subject mapping" }
```

## Syllabus

### GET `/api/syllabus/:branch/:semester`

Returns the full syllabus tree for a branch and semester.

**Response:**

```json
[
  {
    "code": "CS301",
    "name": "Data Structures",
    "units": [
      {
        "name": "Unit 1",
        "topics": ["Arrays", "Linked Lists", "Stacks", "Queues"]
      }
    ]
  }
]
```

## Users

### GET `/api/users`

Returns all platform users. Requires `admin` role.

### PATCH `/api/users/:id/role`

Update a user's role. Requires `admin` role.

```json
{ "role": "faculty" }
```

### PATCH `/api/users/:id/suspend`

Suspend a user account. Requires `admin` role.
