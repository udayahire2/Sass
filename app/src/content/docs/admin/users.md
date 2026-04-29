---
title: "User Management"
description: "Managing student and faculty accounts, roles, and access."
---

## User Roles

| Role | Access Level |
|------|-------------|
| `student` | Read-only access to approved content |
| `faculty` | Upload resources, manage own submissions |
| `admin` | Full platform access |

## Managing Students

Navigate to `/admin/students` to:

- View all registered students
- Filter by branch or registration date
- Suspend or reactivate accounts
- Export the student list as CSV

## Managing Faculty

Navigate to `/admin/faculty` to:

- View all faculty accounts
- Assign or revoke the `faculty` role
- View a faculty member's uploaded resources
- Suspend access if needed

## Assigning Roles

To promote a student to faculty:

1. Go to `/admin/students`
2. Find the user
3. Click **Edit Role**
4. Select `faculty` from the dropdown
5. Save — the user immediately gains faculty permissions

## Suspending an Account

Suspended users cannot log in or access any platform content. To suspend:

1. Find the user in `/admin/students` or `/admin/faculty`
2. Click **Suspend**
3. Confirm the action

The user will see a "Account suspended" message on login until reactivated.
