# Multiview

Watching several streams and their chats at once, on a 24x24 grid that fills the window. It is a separate top-level route outside the app shell, so the header, sidebar and bottom nav are gone while it is open, and music pauses. The logo menu leads back to the rest of the site.

## Rules that keep playback running

Reloading an iframe restarts its stream, so these are the rules to preserve when changing anything here.

1. **A frame's DOM position never changes.** `FrameLayer` renders frames sorted by cell id (`frameOrder`). Any two ids always compare the same way, so React never has a reason to move an existing node; moving an iframe in the DOM is what reloads it. Do not re-sort by position, and do not wrap frames conditionally.
2. **A cell's id owns the player.** Moving, swapping and resizing change only `rect`. `applyLayout` with `merge` hands an incoming slot the id of the video or chat cell filling it, so changing preset moves players instead of rebuilding them. Only a different stream (the component is keyed on it) or an explicit reload creates a new player.
3. **Layout changes animate by transform.** A frame goes straight to its new rect, so its iframe resizes at most once rather than on every animation frame. `invertedTransform` then draws it where it just was and the transform eases back to nothing (FLIP). It accounts for the current transform, so a new move can start mid-animation or mid-drag with no jump.

## Layers

```
lib/multiview, lib/player, lib/tldex   Rules. No React, no DOM except player adapters
stores/multiview*, stores/tldex        State, built on those rules
components/multiview, pages/multiview  Rendering and input
```

`lib/multiview` uses relative `.ts` imports and no `@/` alias so that `node --test` can load it directly, which also stops it depending on the UI by accident.

| Module | Responsibility |
| --- | --- |
| `types` | The domain model: `Cell`, `CellContent`, `ChatTarget`, `MultiviewVideo` |
| `grid`, `gestures` | Geometry, and what a drag, resize, draw or key press would do. Plans are computed, then rendered, then committed on release |
| `layout` | Every layout change, as a function from cells to cells |
| `codec`, `presets` | The shared link format, and the preset tables |
| `chat` | Which video each chat serves, and embed URLs |
| `sync` | Archive sync decisions, returned as commands for the caller to run |
| `playback` | `PlaybackHub`: owns live players and polls them, so fast-changing values never touch the persisted store |
| `archive-clock` | `ArchiveClock`: the one clock behind archive sync, running while anything on screen shows it |
| `flip` | The transform maths for animations |
| `control` | The control panel's halves, and keeping its window on screen |
| `shortcuts` | The keyboard map as data: commands, bindings, and which key presses count |
| `legacy` | Importing the previous UI's saved layout |
| `lib/player/*` | `PlayerController`, with one adapter per embed |

| Store | Holds | Persisted |
| --- | --- | --- |
| `multiview` | Cells, mute settings, sync offsets, URL history, edit session and undo | Yes, except the edit session; per tab |
| `multiview-presets` | Saved layouts, auto-layout table | Yes; shared between tabs |
| `multiview-ui` | Which panels and dialogs are open, reload counters | No |
| `multiview-shortcuts` | Keys the viewer has changed, whether single-key shortcuts are on | Yes; shared between tabs |
| `multiview-playback` | The `PlaybackHub` instance, wired to the store | No |
| `multiview-sync` | The `ArchiveClock` instance, wired to the store and the hub | No |

## Edit mode

One button (or `E`) puts the whole view into editing mode, replacing the old pause-a-cell-to-edit-it behaviour. Players keep running.

`EditLayer` is a sheet covering every iframe, and it takes all pointer input. The frame layer below becomes `inert` and `pointer-events: none`, and each gesture captures the pointer, so a drag cannot be lost to an iframe it passes over. `CellMotion` values are shared between a frame and its edit chrome, which keeps the two locked together; a drag writes straight to them with no React render per event.

| Gesture | Result |
| --- | --- |
| Drag a cell over free space | Moves it, settling in the nearest position it fits |
| Drag a cell onto another | Swaps them, with the other cell sliding over as a live preview |
| Drag an edge or corner outward | Grows, pushing back any neighbour touching that edge, down to its minimum size |
| Drag an edge or corner inward | Shrinks, leaving free space |
| Drag empty space | Draws a new cell |
| Drag a chat's link icon onto a video | Binds that chat to it |
| Arrow keys / Shift+arrows / Delete | Move / resize / remove the focused cell |
| Ctrl+Z, Ctrl+Shift+Z | Undo and redo, within the edit session |
| Esc | Abandons the gesture in progress, otherwise leaves edit mode |

Handles sit inside their own cell, so neighbours never compete for the same pixels: which side of a shared edge you grab says which cell you mean. Undo restores layout only, keeping stream details and mute state learned since (`restoreLayout`).

## Controls

`ControlPanel` holds audio, playback and archive sync in one place, and does not mind where it is put. `ControlWindow` floats it above the stage, draggable by its header. Unlike the sheet it replaced it covers neither the view nor the keyboard, so streams can be watched and worked at the same time. The sync half is off until asked for, because showing it starts the clock, which moves every archive onto the shared timeline.

The sync bar along the bottom is the same controls again, and any number of them can be up at once: they all show one `ArchiveClock`.

## Keyboard

`?` lists every shortcut, grouped by playback, audio, layout and archive sync, and is where they get changed. Clicking a key and pressing another rebinds it, taking the key from whatever had it and saying so; Delete clears one. Only differences from the defaults are stored, so a new default reaches everyone who has not changed that key.

Commands live in `SHORTCUTS`, with what each one does in `use-shortcuts` and the actions themselves in `media-actions`, which the mixer shares. To add a shortcut, add it to the table and to the two records keyed by it: the compiler insists on both. Show it beside its action with `ShortcutBadge` on an icon button or `ShortcutKeys` where there is room, so that hints follow any rebinding.

Keys stay out of the way when they would get in someone's way (`targetOwnsKey`):

- Typing, sliders, menus and other widgets that use plain keys keep every key.
- A focused button keeps Space and Enter, but letters still work from one, because a button clicked with the mouse stays focused and that should not switch the keyboard off.
- Nothing runs while a dialog or menu is open.
- Single-key shortcuts can be turned off as a group, as WCAG 2.1.4 asks, for people whose screen reader or voice control would set them off by accident. Combinations with Ctrl, Alt or Command keep working.

Keys are read by what they type, except that on a layout that does not type Latin letters the key in M's position counts as M, so the defaults work on Russian and Korean keyboards.

Keys pressed while a player has focus go to the player, and the page is not told. Clicking a video is the usual way to get there, so `KeyboardFocusTab` watches for an iframe becoming the active element and hangs a tab from the top of the stage, which works with the toolbar hidden and in fullscreen, and clicking it takes focus back. The first time this happens each local day, it also explains itself for a few seconds.

Fullscreen here means the multiview's own, on the whole page. A player's own fullscreen button shows nothing but that player, and no page can draw over it.

## Chat

A chat's `ChatTarget` says which video it serves:

- `cell` follows a video cell, whatever that cell shows.
- `video` is a fixed stream, which need not be on the grid.
- `auto` takes the first video no other chat serves, preferring a specific one if asked.

`resolveChats` turns these into what each chat actually shows. Each video has an accent colour, shared by the chats serving it. The chip at the top of a chat shows and changes its target, and pointing at it outlines the video it serves. Edit mode also draws a line between them.

## Audio Focus

The setting the old UI called Mute Others: one stream has sound at a time, and unmuting another moves the sound to it. The toolbar toggles it directly, and turning it on keeps what is being heard rather than jumping to the first video. In code it is still `muteOthers`, since that is the persisted name and legacy state reads it too.

The sound can move for many reasons (a mixer button, a new stream starting, the player's own mute button), so `multiview-playback` watches the store for it rather than each caller announcing it. `AudioFocusLayer` then shows "Unmuting…" until `PlaybackHub.isMuteSettling` says the player has obeyed, followed by who is now heard. It sits above the frames and takes no pointer input, and a small speaker stays on whichever stream has the sound.

## Dropping videos

A drag that crosses an iframe disappears into it, so `DropShield` raises a transparent sheet over the stage for as long as a drag is under way. A drop on a video or empty cell shows that stream there, a drop on a chat points the chat at it, and a drop on free space uses auto-layout. A drag from another window that goes straight onto an iframe, without first crossing the page, cannot be seen by the page at all.

## Shared links

Links from the previous UI still work. The format is documented in `codec.ts`, and the server also parses it to render layout images, so `decodeLayout` sorting its parts is part of the format: the number in `chat2` counts through videos in that order. The one addition is `chat-<stream>` for a chat on a stream that is not in the layout, which older clients read as an unbound chat.

## Compared with the previous UI

Reorder Layout's separate dialog is gone, because edit mode swaps cells directly with the real videos in place. The Media Controls sheet became a window that leaves the view uncovered. Other changes in behaviour:

- A cell can no longer be placed off the bottom of the grid to scroll to; the stage does not scroll, and Add Cell shrinks the new cell or reports that there is no room.
- Toggling a chat panel off keeps the chat loaded, so turning it back on does not reload it.
- Clicking an archive TL line seeks the video, which the old multiview never wired up.
- Analytics events (`share-link-copied`, `created-preset`) are dropped, as the rewrite has no analytics.

## Testing

`tests/multiview-*.test.mjs` cover everything in `lib`. They cannot cover whether iframes actually survive, which takes a real browser: count frame navigations and check that `video.currentTime` keeps advancing through a drag, a swap, a resize and a preset change.
