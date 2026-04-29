---
title: "Getting Started"
description: "Set up the project and run it locally in minutes."
---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/udx.git
cd udx/app
npm install
```

## Environment Variables

Create a `.env` file in the `app/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your [Supabase project settings](https://supabase.com/dashboard).

## Running Locally

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
udx/
├── app/          ← Vite + React frontend
│   ├── src/
│   │   ├── content/docs/   ← Markdown documentation files
│   │   ├── components/     ← Reusable UI components
│   │   ├── pages/          ← Route-level page components
│   │   ├── lib/            ← Utilities and data sources
│   │   └── router.tsx      ← React Router configuration
├── backend/      ← Node.js / Express API
└── docs/         ← Legacy design documentation
```
