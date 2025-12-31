# Agent Instructions & Memory

This file serves as a persistent memory for AI agents working on this codebase.

### Notes
- You can use `GEMINI.md` to remember important procedures.
- When developing, check `http://localhost:8080/` using browser testing features, as `npm run dev` is typically running with hot reload.

### Color System (shadcn/Tailwind)
**DO NOT use Radix color classes** like `base-4`, `base-6`, `base-11`, `red-10`, etc.

This project uses **shadcn's semantic color system** defined in `src/pure.css`. Use these Tailwind classes:

| Purpose | Background | Text | Border |
|---------|-----------|------|--------|
| Base background | `bg-background` | `text-foreground` | `border-border` |
| Cards/containers | `bg-card` | `text-card-foreground` | `border-border` |
| Primary actions | `bg-primary` | `text-primary-foreground` | - |
| Secondary | `bg-secondary` | `text-secondary-foreground` | - |
| Muted/subtle | `bg-muted` | `text-muted-foreground` | - |
| Accent/hover | `bg-accent` | `text-accent-foreground` | - |
| Destructive | `bg-destructive` | `text-destructive-foreground` | - |
| Inputs | `bg-input` | - | `border-input` |
| Popovers | `bg-popover` | `text-popover-foreground` | - |

For opacity variants, use Tailwind's opacity modifiers: `bg-primary/50`, `border-border/50`, etc.

### Iconography (Iconify)
Follow these preferences for icon packs based on functional grouping. Use the `i-<pack>:<icon>` class format.

| Grouping | Preferred Pack | Rationale / Examples |
|----------|----------------|----------------------|
| **Multiview / Dense UI** | `i-heroicons` + `i-tabler` | Clean, sharp, consistent with shadcn style. |
| **Video Authoring** | `i-lucide` + `i-fluent` | `lucide` for basic actions; `fluent` for specialized/admin sub-tools. |
| **Navigation & Sidebar** | `i-heroicons` | Primary pack for site-wide navigation (e.g. `cog-6-tooth`, `home`, `heart`). |
| **Player Controls** | `i-heroicons` | Traditional player UI (e.g. `play`, `pause`, `chat-bubble`). |
| **Video Cards & Status** | `i-tabler` | Excellent for dense status icons (e.g. `calendar`, `clock`, `brand-twitch`). |
| **Granular Controls** | `i-mdi` | Good for specialized technical icons (e.g. `chevron-double`, `drag`). |
| **Social Logos** | `i-logos` | Use for colored brand identities (Discord, Google, etc.). | 
