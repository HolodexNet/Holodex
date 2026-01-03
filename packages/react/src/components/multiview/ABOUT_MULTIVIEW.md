# Multiview Design Document

> **Status**: Current implementation uses `react-grid-layout` with **atom-in-atom** architecture and store-based mutators.

## Purpose

Multiview allows users to watch multiple video streams simultaneously with live chat integration. Supports YouTube and Twitch sources.

---

## Architecture Overview

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Cell** | Atomic unit of the grid. Contains content (`video`, `chat`) + position (`x`, `y`, `w`, `h`) + `visibility` state. Empty state is indicated by `videoId === undefined`. |
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
- `content`: Empty (video slot), `chat`, or 11-char video ID

**Examples**:
- `AACC` → Video cell at (0,0) with size 2×2 (empty, no content)
- `AACCchat{videoIdOptional}` → Chat cell, will find a video ID to attach to, if not provisioned at apply-time.
- `AACC{videoId}` → Video cell with YouTube ID

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
│   ├── SyncToolbar.tsx        # Archive video synchronization
│   └── ...
├── hooks/
│   ├── useAutoLayout.tsx      # Orchestrates video addition
│   └── useMultiviewPlayback.ts
└── routes/multiview/
    └── multiview.tsx          # Uses applyLayoutAtom for URL loading
```

---

## Sync System

The SyncToolbar enables synchronized playback of archived (past) videos based on their original stream times.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Overlapping Videos** | Videos whose streams occurred within 1 hour of each other. Only these are synced. |
| **Timeline** | Unified timeline spanning `minTs` to `maxTs` across all overlapping videos. |
| **Offset** | Per-video adjustment (in seconds) to fine-tune sync. Persisted in localStorage. |

### State & Atoms

| Atom/State | Location | Purpose |
|------------|----------|---------|
| `syncToolbarOpenAtom` | `store/multiview.ts` | Controls visibility of SyncToolbar |
| `syncOffsetsAtom` | `SyncToolbar.tsx` | Per-video sync offsets (localStorage) |
| `videoStatusAtomFamily` | `store/player.ts` | Provides current playback position per video |
| `videoPlayerRefAtomFamily` | `store/player.ts` | Imperative player control (seek, play, pause) |

### Integration Points

- **Reads `activeVideosAtom`** to discover which videos are currently in the multiview
- **Fetches video metadata** via `/api/v2/videos/:id` to get `start_actual`/`available_at` and `duration`
- **Controls players imperatively** via `videoPlayerRefAtomFamily` for seeking and play/pause
- **Reads playback state** via `videoStatusAtomFamily` to detect desync

### URL Parameters (Optional)

| Param | Format | Description |
|-------|--------|-------------|
| `t` | Unix timestamp | Initial sync position |
| `offsets` | Comma-separated numbers | Per-video offsets in same order as overlapping videos |

### Behavior Notes

- Only YouTube archives are synced (Twitch filtered out via `tw:` prefix check)
- Sync loop runs every 500ms, adjusting videos that drift > 1.5s from expected time
- Videos outside their timeline window are paused automatically

---

## Known Constraints

- **Max 63** for any grid coordinate (base64 encoding limit)
- **Iframe DOM order** must be preserved for video continuity
- **Edit overlay** must block pointer events or drag/resize breaks
- **Fullscreen** requires user gesture
- **Sync only works for archived videos** with valid `start_actual` or `available_at` timestamps

