# Application Flow Diagrams

This document provides diagram-first explanations of the main NMU Study Hub flows.

## System Context

```mermaid
flowchart LR
    Student[Student] --> Web[React Web App]
    Faculty[Faculty] --> Web
    Admin[Admin] --> Web
    Web --> API[Express API]
    API --> DB[(SQLite)]
    API --> Files[(Uploads/Object Storage target)]
    API --> Email[Email provider]
    API --> Redis[(Redis optional)]
```

## Role-Based Navigation

```mermaid
flowchart TD
    Start[User opens app] --> HasSession{Stored session?}
    HasSession -->|No| Public[Public routes: Home, Resources, Study Stock, Search, Login, Signup]
    HasSession -->|Yes| Role{Role Guard}
    Role -->|Student| StudentHome[/dashboard/student: Dashboard, Profile, Uploads, Add Content, Bookmarks, Notes]
    Role -->|Faculty| FacultyDash[/dashboard/faculty: Dashboard, Upload, Profile]
    Role -->|Admin| AdminDash[/admin: Dashboard, Syllabus, Resources, IMP Questions, Sample Papers, Users, Approvals, Feedback]
```

Current issue:

- Frontend route guards depend on localStorage and should be replaced with server-verified guard plus refresh-token recovery.

## Signup And OTP Verification

```mermaid
sequenceDiagram
    participant User
    participant SPA as React SPA
    participant API as Express API
    participant DB as SQLite
    participant Worker as Job Worker
    participant Email as Email Provider

    User->>SPA: Submit signup
    SPA->>API: POST /api/v1/auth/register
    API->>DB: Create user
    API->>DB: Store hashed OTP
    API->>DB: Enqueue email.send job
    Worker->>DB: Pick pending job
    Worker->>Email: Send OTP email
    User->>SPA: Submit OTP
    SPA->>API: POST /api/v1/auth/verify-otp
    API->>DB: Mark OTP used and user verified
    API->>DB: Store refresh token hash
    API-->>SPA: Access token + user
```

## Login And Refresh

```mermaid
sequenceDiagram
    participant SPA
    participant API
    participant DB

    SPA->>API: POST /auth/login
    API->>DB: Check user and password hash
    API->>DB: Insert refresh token hash
    API-->>SPA: Access token + user
    API-->>SPA: HTTP-only refresh cookie

    SPA->>API: Protected request with access token
    API-->>SPA: 401 when access token expires
    SPA->>API: POST /auth/refresh
    API->>DB: Rotate refresh token
    API-->>SPA: New access token + user
```

Current issue:

- Backend refresh exists, but frontend needs centralized refresh-on-401 retry.

## Academic Browsing

```mermaid
flowchart TD
    Resources[/resources] --> Select[Select branch and semester]
    Select --> Subjects[GET /subjects]
    Subjects --> SubjectPage[Subject dashboard]
    SubjectPage --> Units[GET /subjects/:id/units]
    Units --> Topic[GET /topics/:id]
    Topic --> Render[Render Markdown topic]
```

## Study Material Upload And Approval

```mermaid
sequenceDiagram
    participant User as Student/Faculty
    participant SPA
    participant API
    participant DB
    participant Admin

    User->>SPA: Select file or URL
    SPA->>API: POST /study-materials
    API->>API: Auth + approved faculty check
    API->>API: Multer file validation
    API->>DB: Insert pending study_materials row
    Admin->>SPA: Open admin approvals
    SPA->>API: GET /study-materials/pending
    Admin->>SPA: Preview file
    SPA->>API: GET /files/:studyMaterialId
    Admin->>SPA: Approve or reject
    SPA->>API: PATCH /study-materials/:id/status
    API->>DB: Update status
```

## Bookmark Flow

```mermaid
flowchart LR
    User[Authenticated user] --> Approved[Approved material card]
    Approved --> Toggle[POST /study-materials/:id/bookmark]
    Toggle --> Existing{Bookmark exists?}
    Existing -->|Yes| Delete[Delete bookmark row]
    Existing -->|No| Insert[Insert bookmark row]
    Insert --> Profile[Visible in profile bookmarks]
    Delete --> Profile
```

## Notes Workspace Flow

```mermaid
flowchart TD
    Notes[/notes] --> Load[GET /notes]
    Load --> Sidebar[Build sidebar tree]
    Sidebar --> Select[Select note]
    Select --> Editor[TipTap editor]
    Editor --> Debounce[Debounced autosave]
    Debounce --> Save[PUT /notes/:id]
    Save --> DB[(student_notes)]
    Sidebar --> Favorite[Toggle favorite]
    Sidebar --> Trash[Move to trash]
    Editor --> Metadata[Icon, cover, font, full width]
    Metadata --> Save
```

Current notes risks:

- No conflict resolution.
- No parent-cycle prevention.
- Note payload validation needs tightening.

## Admin Management Flow

```mermaid
flowchart TD
    Admin[Admin dashboard] --> Stats[GET /admin/stats]
    Admin --> Students[GET /admin/users]
    Admin --> Faculty[GET /admin/faculty/pending or all]
    Admin --> Approvals[GET /study-materials/pending]
    Admin --> Syllabus[Manage /syllabus]
    Admin --> Resources[Manage /resources]
    Admin --> ImpQuestions[Manage /resources category=IMP Questions]
    Admin --> SamplePapers[Manage /resources category=Sample Papers]
    Admin --> Feedback[Manage /feedback]
    Admin --> Topics[Manage /topics/:id/edit]
```

## File Access Flow

```mermaid
flowchart TD
    Request[File request] --> Type{File type}
    Type --> StudyMaterial[/files/:studyMaterialId]
    Type --> Syllabus[/syllabus/:id/file]
    Type --> Resource[/resources/:id/file or static URL]
    StudyMaterial --> Status{Approved?}
    Status -->|Yes| Stream[Stream file]
    Status -->|No| AdminCheck{Admin?}
    AdminCheck -->|Yes| Stream
    AdminCheck -->|No| Forbidden[403]
    Syllabus --> Stream
    Resource --> Stream
```

Production target:

```mermaid
flowchart LR
    API[Express API] --> Storage[(Object storage)]
    Storage --> CDN[CDN for approved public files]
    API --> Signed[Signed URLs for private files]
    Signed --> Browser
    CDN --> Browser
```

## Production Deployment Flow

```mermaid
flowchart TD
    Commit[Code commit] --> CI[CI build and tests]
    CI --> Audit[Lint, test, dependency audit]
    Audit --> Build[Build frontend and backend artifact]
    Build --> Migrate[Run DB migrations]
    Migrate --> Deploy[Deploy API and frontend]
    Deploy --> Health[Health checks]
    Health --> Monitor[Logs, metrics, error tracking]
    Monitor --> Rollback{Issue?}
    Rollback -->|Yes| Previous[Rollback release]
    Rollback -->|No| Live[Keep live]
```

## Launch User Feedback Loop

```mermaid
flowchart LR
    Users[Students and faculty] --> Feedback[Submit platform feedback]
    Feedback --> Admin[Admin feedback manager]
    Admin --> Triage[Bug, feature, general]
    Triage --> Roadmap[Prioritized roadmap]
    Roadmap --> Release[Fix and release]
    Release --> Users
```
