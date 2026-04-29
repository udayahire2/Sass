---
title: "Configuration"
description: "Customize the platform to fit your institution."
---

## Theme

The app supports light, dark, and system themes. The preference is stored in `localStorage` under the key `vite-ui-theme`.

You can customize colors by editing `src/index.css`. The design system uses CSS custom properties:

```css
:root {
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --radius: 0.75rem;
}
```

## Branches & Semesters

Branches and semesters are defined in `src/data/study-data.ts`. To add a new branch, update that file:

```ts
export const BRANCHES = ['Computer', 'IT', 'Mechanical', 'Civil', 'Electrical'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
```

For database-backed branches, insert a row into the Supabase `branches` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | e.g. `"Computer Science"` |
| `short` | text | e.g. `"CS"` |

## Adding a New Docs Page

Drop a `.md` file into `src/content/docs/` (or a subdirectory), add it to the sidebar tree in `src/lib/docs-source.ts`, and it will appear automatically in the docs sidebar.

```md
---
title: "My New Page"
description: "Short description shown in the sidebar."
---

## First Section
...
```
