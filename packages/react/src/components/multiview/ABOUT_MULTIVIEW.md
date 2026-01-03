# Multiview Design Document

> **Status**: Current implementation uses `react-grid-layout` with **atom-in-atom** architecture and store-based mutators.

## Purpose

Multiview allows users to watch multiple video streams simultaneously with live chat integration. Supports YouTube and Twitch sources.

---

## Architecture Overview

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Cell** | Atomic unit of the grid. Contains content (`video`, `chat`, `empty`) + position (`x`, `y`, `w`, `h`) + `visibility` state. |
| **CellEntry** | Wrapper containing `{ id: string, atom: PrimitiveAtom<Cell> }` for granular subscriptions. |
| **Cell Queue** | Append-only array of `CellEntry[]`. Cells are marked `visibility: 'hidden'` rather than deleted. |
| **LayoutPreset** | Pure positional data encoded as URL-safe string. Defines slot positions and types. |
| **Aspect Class** | Layout adapts to viewport: `horizontal` (12×20), `square` (12×12), `vertical` (20×12). |

### Key Architecture Decisions

1. **Store-centric mutations**: All cell manipulation happens via write-only atoms in the store
2. **LayoutPreset → cellQueue coercion**: `applyLayoutAtom` transforms a preset string into a properly populated cellQueue
3. **Derived atoms for reads**: Components consume `visibleCellsAtom` for rendering, which materializes cell states
4. **Minimal component logic**: Components just wire up store atoms, no complex state management

### Grid Layout

Uses `react-grid-layout` library for:
- Drag-and-drop repositioning
- 8-directional resize handles
- Vertical compaction
- Dynamic row height calculation via `react-use-measure`

---

## State Management (Jotai Atoms)

### Core State Atoms

| Atom | Type | Description |
|------|------|-------------|
| `cellQueueAtom` | `CellEntry[]` | All cell entries (visible + hidden) with inner atoms |
| `aspectClassAtom` | `AspectClass` | Current viewport classification |
| `editModeAtom` | `boolean` | Edit mode toggle |
| `autoLayoutDisabledAtom` | `boolean` | True after manual edits |

### Mutator Atoms (Write-Only)

| Atom | Input | Effect |
|------|-------|--------|
| `applyLayoutAtom` | `layoutString` | Decode preset, redistribute existing videos to new slots |
| `fillCellAtom` | `{ cellId, videoId }` | Fill a specific cell with video content |
| `clearCellAtom` | `cellId` | Clear cell content (→ empty) |
| `hideCellAtom` | `cellId` | Mark cell as hidden |
| `refreshCellAtom` | `cellId` | Regenerate cell ID (forces iframe reload, keeps content/position) |
| `convertToChatAtom` | `cellId` | Hide current cell, create new chat cell at same position |
| `addEmptyCellAtom` | `{ x, y, w, h }` | Add new empty cell at position |
| `clearAllCellsAtom` | - | Reset to empty queue |
| `updateLayoutAtom` | `LayoutItem[]` | Update positions from react-grid-layout |

### Derived Atoms (Read-Only)

| Atom | Type | Description |
|------|------|-------------|
| `contentMapAtom` | `ContentMapping` | videoId → cell index lookup |
| `visibleCellEntriesAtom` | `CellEntry[]` | Entries where visibility='visible' |
| `visibleCellsAtom` | `Cell[]` | Materialized cell states for rendering |
| `activeVideosAtom` | `Cell[]` | Video cells with content |
| `gridDimensionsAtom` | `{ rows, cols }` | From aspect class |

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

**Applying a Preset**: `applyLayoutAtom` handles:
1. Decode preset string → slot positions
2. Gather existing video cells with content
3. Match videos to new slots (preserve content)
4. Create new CellEntry array

---

## Component Hierarchy

```
Multiview (route)
└── AutoLayoutProvider (orchestrates addVideo logic)
    └── MultiviewContent
        ├── Toolbar (uses store atoms directly)
        ├── MultiviewFrames (reads visibleCellsAtom)
        │   └── VideoCell / ChatCell
        ├── MultiviewGrid (uses updateLayoutAtom)
        │   └── MultiviewCell (uses clearCellAtom, hideCellAtom, refreshCellAtom, convertToChatAtom)
        └── SyncToolbar
```

---

## Auto-Layout System

The `useAutoLayout` hook orchestrates video addition:

1. **Add Video**: Check for empty cell → fill it
2. **No empty cell**: Get appropriate preset → apply it → fill new empty slot
3. **Manual edits exist**: Prompt user before overriding

The hook delegates to store atoms:
- `fillCellAtom` for filling slots
- `applyLayoutAtom` for expanding layouts
- `addEmptyCellAtom` for manual cell creation

---

## Key Files

```
src/
├── store/
│   └── multiview.ts           # Core state + mutator atoms
├── lib/
│   └── multiview-utils.ts     # Encoding, presets, helpers
├── components/multiview/
│   ├── MultiviewGrid.tsx      # Uses updateLayoutAtom
│   ├── MultiviewFrames.tsx    # Uses visibleCellsAtom
│   ├── MultiviewCell.tsx      # Uses clearCellAtom, hideCellAtom
│   └── ...
├── hooks/
│   ├── useAutoLayout.tsx      # Orchestrates video addition
│   └── useMultiviewPlayback.ts
└── routes/multiview/
    └── multiview.tsx          # Uses applyLayoutAtom for URL loading
```

---

## Known Constraints

- **Max 63** for any grid coordinate (base64 encoding limit)
- **Iframe DOM order** must be preserved for video continuity
- **Edit overlay** must block pointer events or drag/resize breaks
- **Fullscreen** requires user gesture
