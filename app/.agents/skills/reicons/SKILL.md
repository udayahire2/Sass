---
name: reicons
description: Migrate a React/Next.js codebase's icon imports to Reicon (the reicon-react package, reicon.dev) — replacing libraries like lucide-react, react-icons, @heroicons/react, phosphor-react, @tabler/icons-react, react-feather, @radix-ui/react-icons, or @mui/icons-material with equivalent reicon-react icon components. Use this whenever the user asks to "replace icons with reicon(s)", "migrate to reicon", "switch icon library to reicon", "swap out lucide/heroicons/react-icons for reicon", or mentions reicon.dev / reicon-react alongside an existing codebase. Also use for auditing which icons are currently imported before doing the swap, or for adding reicon-react to a project that has no icon library yet.
---

# Reicon Migration

Replace an existing React icon library with [Reicon](https://reicon.dev) (`reicon-react` npm package — 2674+ hand-crafted icons, Outline/Filled weights, tree-shakeable, zero deps).

Read `references/reicon-react-api.md` first — it has the full prop API, import patterns, and gotchas (capitalization, prop names, size units). Do not guess the API from memory; the exact prop names (`weight`, not `variant`; PascalCase `"Filled"`/`"Outline"`, not lowercase) trip people up.

## Workflow

### 1. Detect the current icon library

Search the codebase for the common suspects rather than assuming one:

```bash
grep -rlE "from ['\"](lucide-react|react-icons|@heroicons/react|phosphor-react|@phosphor-icons/react|@tabler/icons-react|react-feather|@radix-ui/react-icons|@mui/icons-material)" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" .
```

Also check `package.json` dependencies for any of these. If several are present, confirm with the user which one(s) to migrate (a codebase sometimes has more than one, e.g. leftover from a previous partial migration).

### 2. Inventory every icon actually used

For each matched file, extract the imported icon names (not just the import statement — icons are frequently re-exported/aliased through a local `icons.ts` barrel file, so check for that pattern too). Build a list of `{ file, originalName, importSource, usedProps }` for every icon usage — the props matter for step 4 (e.g. `size`, `className`, `color`, `strokeWidth`, `weight`/`variant`, `onClick`).

### 3. Install reicon-react and resolve exact icon names

```bash
npm install reicon-react   # or pnpm/yarn/bun equivalent — match the project's package manager
```

Reicon icon names are PascalCase derived from kebab-case source names (`arrow-left` → `ArrowLeft`, `shield-check` → `ShieldCheck`). Old-library names don't always match 1:1 (naming conventions differ across libraries), so **never guess a Reicon name from the old name alone** — verify it exists. Two reliable ways, in order of preference:

**a) Introspect the installed package** (fastest, no network needed once installed):
```bash
node -e "const r = require('reicon-react'); console.log(Object.keys(r).filter(k => /home|arrow/i.test(k)))"
```
Swap the regex for keywords from the old icon name (e.g. an old `ChevronDownIcon` → search `/chevron.*down/i`).

**b) Search reicon.dev** when the introspection turns up nothing obvious — web_search or web_fetch `https://reicon.dev/icons?q=<keyword>` to browse the catalog and confirm the closest match. If no equivalent icon exists, flag it to the user rather than silently picking the nearest visual guess — ask whether to leave that one icon on the old library, use a close-but-imperfect Reicon match, or drop it.

Keep a running mapping table (`OldName -> ReiconName`) as you go so replacements are consistent across the whole codebase.

### 4. Rewrite imports and usage

For each file:
- Replace the import line(s). Prefer per-icon deep imports for the smallest bundle (`import Home from 'reicon-react/icons/Home'`) if the project already deep-imports from its old library; otherwise use the named barrel import (`import { Home, Bell } from 'reicon-react'`) matching the project's existing style.
- Rename the JSX tag to the resolved Reicon name.
- Translate props per the table in `references/reicon-react-api.md` — the most common translations:
  - variant/weight strings like `"solid"`, `"fill"`, `"filled"` → `weight="Filled"`; `"outline"`, `"line"`, `"regular"` → `weight="Outline"` (Reicon's default, can often be omitted)
  - `size="24px"` or `size="1.5rem"` → `size={24}` (number only, no units)
  - libraries that use `stroke`/`fill` for color → `color`
  - `strokeWidth` carries over as-is if the old library had it; otherwise omit (Reicon defaults to 1.5)
  - anything else (`className`, `onClick`, `style`, `aria-*`) passes through unchanged — Reicon forwards standard SVG attributes
- Leave a `// TODO(reicon):` comment on any icon you couldn't confidently map, instead of silently substituting a lookalike.

### 5. Clean up

- Remove the old package from `package.json` / lockfile once no imports reference it (`grep` again to confirm zero remaining hits before uninstalling).
- If there was a local icon barrel file (e.g. `src/components/icons.ts`) re-exporting the old library, update it to re-export from `reicon-react` instead so downstream imports don't need touching.
- Run the project's type-check/build if available to catch prop mismatches (e.g. a prop the old icon accepted that Reicon doesn't, like MUI's `fontSize="small"`).

## Reference

See `references/reicon-react-api.md` for the full Reicon React API (props, weights, CDN/other-framework notes) before writing replacement code.