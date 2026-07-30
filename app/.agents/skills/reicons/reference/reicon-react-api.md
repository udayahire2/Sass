# Reicon React API Reference

Source: https://reicon.dev/docs/react, https://reicon.dev/usage/react, npm `reicon-react`.

## Install

```bash
npm install reicon-react
# or: pnpm add reicon-react / yarn add reicon-react / bun add reicon-react
```
- Requires `react >= 16.8.0`.
- Zero runtime dependencies. Ships its own TypeScript types (no `@types/` package needed).
- `"sideEffects": false` — safe for tree-shaking with any modern bundler.

## Basic usage

```tsx
import { Home, ShieldCheck, AltArrowDown } from 'reicon-react';

function App() {
  return (
    <div>
      <Home />
      <ShieldCheck size={32} color="#d97757" />
      <AltArrowDown weight="Filled" />
    </div>
  );
}
```

## Smallest-bundle usage (deep import, skips the barrel file)

```tsx
import Home from 'reicon-react/icons/Home';
import Bell from 'reicon-react/icons/Bell';
```
Avoid wildcard imports — they defeat tree-shaking:
```tsx
// ❌ Don't do this
import * as Icons from 'reicon-react';
export * from 'reicon-react';
```

## Icon naming

Icon names are **PascalCase**, derived from the kebab-case source name shown on reicon.dev. Examples: `arrow-left` → `ArrowLeft`, `shield-check` → `ShieldCheck`. Browse/search the full catalog of 2674+ icons at https://reicon.dev/icons — don't assume an icon exists under a guessed name; confirm it (see SKILL.md step 3 for how to verify programmatically).

## Props

```ts
interface IconProps {
  size?: number;            // pixels, NUMBER ONLY — no "24px" or "1.5rem"
  color?: string;           // any CSS color, defaults to currentColor
  weight?: 'Outline' | 'Filled';  // PascalCase, case-sensitive. Default: 'Outline'
  strokeWidth?: number;     // only affects Outline weight; default 1.5
  className?: string;
  style?: React.CSSProperties;
  // ...plus all standard SVG element attributes (onClick, aria-*, etc.) — forwarded as-is
}
```

### Weight

Every icon ships in two weights:
```tsx
<Home />                 {/* Outline (default) */}
<Home weight="Filled" />
```
**Case matters.** `weight="filled"` (lowercase) is wrong in React — that lowercase form is only for the CDN web-component (`<re-icon weight="filled">`). In React/Vue it must be `"Outline"` or `"Filled"`.

### Size

```tsx
<Home size={32} />         {/* ✅ */}
<Home size="32px" />       {/* ❌ don't include units */}
```

### Color

Icons render as inline SVG and inherit `currentColor` by default — so with no `color` prop they follow the parent's CSS text color, same as normal text:
```tsx
<div style={{ color: '#6C5CE7' }}>
  <Home size={20} />   {/* purple, inherited */}
</div>
<Heart size={20} color="#ef4444" />  {/* explicit red, overrides inheritance */}
```

### Stroke width (Outline weight only)

```tsx
<Home strokeWidth={1} />    // thin
<Home strokeWidth={1.5} />  // default
<Home strokeWidth={2.5} />  // bold
```
Has no effect on `weight="Filled"` icons (they're solid paths, not stroked).

## TypeScript

```tsx
import { Home, type IconProps, type IconWeight } from 'reicon-react';

const weight: IconWeight = 'Filled';
const props: IconProps = { size: 32, color: '#d97757', weight };
<Home {...props} />
```

## Common migration gotchas (old library → Reicon)

| Old library pattern | Reicon equivalent |
|---|---|
| `variant="solid" \| "outline"` (Heroicons) | `weight="Filled" \| "Outline"` |
| `weight="fill" \| "regular" \| "bold" \| "thin"` (Phosphor) | `weight="Filled" \| "Outline"` (Reicon only has 2 weights — Phosphor's `bold`/`thin` map to `strokeWidth` on Outline instead) |
| `size="1.5rem"` / `size="24px"` (string with units) | `size={24}` (number, no units) |
| `stroke="red"` (Feather / Tabler use `stroke` for outline color) | `color="red"` |
| `fontSize="small" \| "medium" \| "large"` (MUI icons) | `size={20}` / `size={24}` / `size={32}` (pick numeric equivalents) |
| Default import per icon, e.g. `import { MdHome } from 'react-icons/md'` (prefixed names) | Un-prefixed PascalCase, e.g. `import { Home } from 'reicon-react'` — strip the library prefix (`Md`, `Fa`, `Bi`, etc.) when searching for the Reicon equivalent |
| `className="w-6 h-6"` (Tailwind sizing instead of a size prop) | Works unchanged — Reicon forwards `className`; Tailwind width/height utilities still apply since it's a real inline SVG. Can also switch to the `size` prop for consistency. |

## Other frameworks (only relevant if the project also has non-React surfaces, e.g. a Vue admin panel or vanilla-JS marketing site sharing the same monorepo)

```tsx
// Vue
import { Heart } from 'reicon-vue';
// <Heart :size="24" weight="Filled" color="#000000" />

// Svelte
import { Heart } from 'reicon-svelte';
// <Heart size={24} weight="Outline" color="#000000" />

// CDN / vanilla JS (note: lowercase weight values here, unlike React/Vue)
// <script src="https://unpkg.com/reicon/cdn/reicon.min.js"></script>
// <re-icon icon="heart" weight="outline" size="24"></re-icon>
```

## MCP server (for AI-agent-driven icon search, optional)

```json
{
  "mcpServers": {
    "reicon": { "command": "npx", "args": ["reicon-mcp"] }
  }
}
```
Lets an agent search icons, preview SVG markup, and generate framework-specific snippets directly — useful if doing a very large migration and you want to set this up rather than relying on the introspection/web-search approach in SKILL.md.