# Multiview Design Document

> **Status**: Current implementation uses `react-grid-layout` after refactor from custom drag-and-drop.

## Purpose

Multiview allows users to watch multiple video streams simultaneously with live chat integration. Supports YouTube and Twitch sources.

---

## Architecture Overview

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Cell** | Atomic unit of the grid. Contains content (`video`, `chat`, `empty`) + position (`x`, `y`, `w`, `h`). |
| **Cell Queue** | Append-only array. Cells are *hidden* (`w=0, h=0`) rather than deleted to preserve iframe DOM order. |
| **Aspect Class** | Layout adapts to viewport: `horizontal` (12×20), `square` (12×12), `vertical` (20×12). |
| **Content Map** | O(1) lookup: `videoId → cellIndex`. |

### Grid Layout

Uses `react-grid-layout` library for:
- Drag-and-drop repositioning
- 8-directional resize handles (`se`, `sw`, `ne`, `nw`, `s`, `n`, `e`, `w`)
- Vertical compaction
- Dynamic row height calculation via `react-use-measure`

**Key Design Decision**: The grid fills 100% of available space. Row height = `containerHeight / rows`.

---

## State Management (Jotai Atoms)

| Atom | Type | Description |
|------|------|-------------|
| `cellQueueAtom` | `Cell[]` | All cells (visible + hidden) |
| `contentMapAtom` | `ContentMapping` | videoId → cell index lookup |
| `aspectClassAtom` | `AspectClass` | Current viewport classification |
| `editModeAtom` | `boolean` | Edit mode toggle |
| `autoLayoutDisabledAtom` | `boolean` | True after manual edits; disables auto-layout |
| `userPresetsAtom` | Persisted | Custom presets per aspect class |
| `persistedLayoutAtom` | Persisted | Saved layout state |

### Derived Atoms
- `activeCellsAtom`: Visible cells only (`w > 0 && h > 0`)
- `activeVideosAtom`: Video cells with content
- `gridDimensionsAtom`: `{ rows, cols }` from aspect class

---

## Layout Encoding System

Compact URL-safe string format: `xywh[content],xywh[content],...`

- `x, y, w, h`: Base64 encoded (single char each, max 63)
- `content`: Empty, `chat{tab}`, or 11-char video ID

**Examples**:
- `AACC` → Cell at (0,0) with size 2×2
- `AACCchat0` → Chat cell, tab 0
- `AACCdQw4w9WgXcQ` → Video cell with YouTube ID

---

## Layout Presets

Presets define cell arrangements for common use cases:

| Aspect | Grid | Example Presets |
|--------|------|-----------------|
| Horizontal | 20×12 | 1🎞️, Side Chat, 2×2🎞️, 3×3🎞️ |
| Square | 12×12 | 1🎞️, 2🎞️ Side, 2🎞️ Stacked |
| Vertical | 12×20 | Mobile 1-4 (optimized for portrait) |

**Default Selection Logic**: Match video count → fallback to next larger preset.

---

## Component Hierarchy

```
Multiview (route)
└── AutoLayoutProvider
    └── MultiviewContent
        ├── Toolbar
        │   ├── Selector (video picker)
        │   ├── Edit Button
        │   ├── Presets Dropdown
        │   └── Clear/Fullscreen
        ├── MultiviewFrames (CSS Grid - stable iframe layer)
        │   └── All cells in queue order (preserves DOM order)
        │       ├── VideoCell | ChatCell (content cells)
        │       └── Blank iframe (empty cells)
        ├── MultiviewGrid (React-Grid-Layout Grid - edit controls layer)
        │   ├── GridBackground & GridCornerDots (visual guides)
        │   └── react-grid-layout (drag/resize)
        │       └── MultiviewCell (per visible cell)
        └── Auto-Layout Dialog
```

**Key Architecture Decision**: All iframes are rendered via `MultiviewFrames` in **queue order** using pure CSS Grid positioning. This is completely independent of `react-grid-layout` DOM, preventing iframe reloading when the grid is edited. Empty cells render blank iframes to preserve queue slots for future content.

---

## Auto-Layout System

Managed by `useAutoLayout` hook with React Context.

### Behaviors

1. **Add Video**: Find empty cell → fill it. No empty cell → expand to appropriate preset.
2. **Manual Edit**: Marks `autoLayoutDisabled=true`. Future video adds prompt user to confirm auto-layout.
3. **Apply Preset**: Merges existing videos into new layout shape.
4. **Clear All**: Resets to empty state.

### Video Placement Priority
1. Fill existing empty cells
2. Expand layout if needed (prompt if manual edits exist)

---

## Edit Mode

When `editMode=true`:
- `MultiviewCell` renders over each cell
- Overlay blocks iframe pointer events (critical for drag/resize to work)
- Exposes Clear/Delete buttons per cell
- Enhanced grid background visibility

---

## Video Sizing (Historical Issues Addressed)

**Problem**: Videos didn't size correctly within cells.

**Solution**:
- Cells use `h-full w-full` with `overflow-hidden`
- `PlayerWrapper` fills container absolutely
- Hidden cells rendered with `h-0 w-0 overflow-hidden` to preserve iframe order

---

## Cell Types

| Type | Content | Notes |
|------|---------|-------|
| `video` | YouTube/Twitch embed | `videoId` property; YouTube uses 11-char ID directly, Twitch uses `tw:{channel}:{id}` format |
| `chat` | Chat panel | `chatTab` selects which video's chat to display |
| `empty` | Placeholder | Drop target for new videos |

---

## Key Files

```
src/
├── components/multiview/
│   ├── MultiviewGrid.tsx      # Main grid, react-grid-layout integration
│   ├── MultiviewFrames.tsx    # CSS Grid iframe layer (prevents reload)
│   ├── MultiviewCell.tsx      # Individual cell edit controls
│   ├── VideoCell.tsx          # Video player wrapper
│   ├── ChatCell.tsx           # Chat embed
│   ├── Toolbar.tsx            # Top toolbar
│   ├── Selector.tsx           # Org picker + live channel list
│   ├── SelectorLiveItem.tsx   # Live channel item with hover VideoCard
│   └── PresetPreview.tsx      # Preset thumbnail
├── hooks/
│   └── useAutoLayout.tsx      # Auto-layout context & logic
├── lib/
│   └── multiview-utils.ts     # Encoding, presets, helpers
├── store/
│   └── multiview.ts           # Jotai atoms & types
└── routes/multiview/
    └── multiview.tsx          # Route entry point
```

---

## Known Constraints

- **Max 63** for any grid coordinate (base64 encoding limit)
- **Iframe DOM order** must be preserved for video continuity
- **Edit overlay** must block pointer events or drag/resize breaks
- **Fullscreen** requires user gesture
