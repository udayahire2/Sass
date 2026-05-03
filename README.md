# NMU Study Hub

NMU Study Hub is a modern, full-stack academic resource platform designed to connect students, faculty, and administrators. It facilitates the uploading, reviewing, and consumption of study materials such as PDFs, videos, and Markdown notes, organized strictly by university branches, semesters, and subjects.

## 🚀 Tech Stack

**Frontend:**
- React 19 + TypeScript
- React Router DOM (v7)
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- Lucide React (Icons)
- Custom hooks for JWT-based Local Authentication

**Backend:**
- Node.js + Express 5
- SQLite (using `better-sqlite3`)
- JWT (JSON Web Tokens) for Stateless Auth
- Multer for File & Avatar Uploads
- Custom Database Migrations

## ✨ Key Features

1. **Role-Based Access Control (RBAC):**
   - **Admin:** Manages syllabus, approves faculty registrations, reviews/approves uploaded study materials, and manages the student user base.
   - **Faculty:** Uploads new study materials, tracks approval status of their uploads, and leaves structured peer-review feedback (ratings & comments) on existing study materials.
   - **Student:** Browses approved study materials, views topics, reads content using a Notion-style centered viewer, and downloads files.

2. **Advanced Authentication Flow:**
   - Secure login/signup with OTP verification.
   - RoleGuard implementation automatically redirecting authenticated users to their respective dashboards (`/admin/dashboard` or `/dashboard/faculty`) to prevent unauthorized access to restricted interfaces.

3. **Faculty Feedback & Review System:**
   - Faculty members can provide 5-star ratings and textual feedback on study materials.
   - Powered by a `material_feedback` table with unique composite constraints to ensure one review per faculty per material.

4. **Dynamic Avatar System:**
   - Support for custom profile picture uploads (`.jpeg`, `.png`, `.webp`, `.gif`) with automatic server-side cleanup of old avatar files.
   - Highly reactive frontend state that updates user avatars globally without page reloads.
   - **Default SVG Avatars:** A deterministic, SVG-based default avatar generator that parses user initials and computes a consistent, aesthetic background color using a character-code hashing algorithm for users without custom profile pictures.

5. **Study Material Viewer:**
   - A Notion-inspired, distraction-free reader interface.
   - Sticky table of contents and reading progress tracking.
   - Markdown rendering for rich text notes and integrated file proxying for secure PDF/Asset delivery.

## 📦 Local Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm run migrate:up
npm run dev
```
*Note: Ensure you have an `.env` file in the backend directory containing your secret keys (e.g., `JWT_SECRET`, `PORT=5000`).*

### 2. Frontend Setup
```bash
cd app
npm install
npm run dev
```
*Note: Ensure your `.env` file points to the backend API (`VITE_API_URL=http://localhost:5000/api/v1`).*

## 📚 Documentation
Detailed documentation regarding system architecture, database schema, API endpoints, and design decisions can be found in the `/docs` directory.

For future implementation plans, please refer to [ROADMAP.md](./ROADMAP.md).
