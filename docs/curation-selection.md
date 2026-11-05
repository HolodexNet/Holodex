# In-place video selection

Home, Favorites, and Search opt in through `VideoList scope="..."`. The list registers its displayed order after collaboration grouping. A shared scope store makes the active list available to the tray; focus and pointer interaction choose the active list. Cards outside a scope keep their usual behavior.

Selection is an explicit mode. Choose **Select videos** in the feed's view menu, or **Select video** in a card's menu to start with that card selected. Browsing normally shows no selection checkboxes, selected styling, or tray, including on touch devices. Long presses and keyboard shortcuts do not enter selection mode.

In selection mode, click checkboxes, titles, or thumbnails to toggle videos. Shift-click extends the range within the current list. Collaboration cards offer group selection and individual perspective checkboxes. Channel links and menus remain usable. Ctrl/Cmd+A selects the active list's loaded videos, and Space/X on a video title toggles it. Clear and deselecting the last video keep the mode active. **Done selecting** or Escape clears the basket and exits the mode. Inputs and dialogs retain their shortcuts.

The basket holds at most 200 videos in session storage and survives navigation and reloads. Selection mode survives navigation but resets to normal browsing on reload; explicitly entering it again restores the saved basket. It contains public video snapshots for display, not mutation preconditions. Each selection gets a token so a completed action cannot remove a video that was deselected and selected again during execution.

## Editing actions

Copy links is available to everyone. Logged-in contributors can add mentions and set topics from the tray's **Edit videos** menu or an individual video's menu. Editors and admins also see all six smart actions and can clear topics. Disabled actions explain their count/type requirements. Ordinary-user mention removal, undo, and command-palette integration are deferred.

Editor copy describes the user's action and result: **Add mentions**, **Save changes**, **Updated**, and **Not updated**. Results use short counts, with reasons beside affected items. Keep request, verification, cache, and selection-cleanup mechanics in developer documentation. Only show explanations that help the user choose an action or resolve a problem; successful edits need no instructional footer.

Mention runs accept at most 50 videos, five participants, and 100 actual additions. Preparation fetches canonical mentions for the preview, skipping existing mentions, uploaders, and placeholders. Applying freezes the planned video-channel pairs and reads current mentions again. It skips additions that appeared since preview; a removed preview skip requires a new review.

Writes run sequentially and are never automatically replayed. A failed or ambiguous write stops the remaining queue. Read-back can confirm a write even if its response was lost. Unconfirmed outcomes remain selected. Stop aborts the active request and prevents further writes, then attempts a separate read-back for up to 15 seconds; it does not roll back server changes. Account changes abort the run. A 403 attempts one session refresh without retrying the mutation. **Edit remaining videos** prepares a new preview from current data.

All versioned API requests share a conservative local budget of 70 requests per 120 seconds. Response rate-limit headers and Retry-After constrain subsequent requests, including reads. Other tabs and clients still share the server budget, so a 429 stops the mutation run.

Verified changes patch existing live, paginated video, search, and detail caches. A five-minute in-memory overlay applies confirmed additions, targeted removals, and topic assignments (including clearing) so stale responses do not immediately undo the display; lists are invalidated again after three minutes. Later local edits supersede earlier edits to the same field. Unrelated participants and relationships are preserved. This is bounded reconciliation, not a guarantee of search-index freshness or correct result membership. Reloads discard the overlay.

## Bulk topic edits

**Set topic…** loads the current topic catalog from `GET /v2/topics` and offers a searchable picker. Contributors may set a non-null topic on videos with no topic or their own assignment; editors/admins can replace any assignment and choose **Clear topic**. The preview freezes the exact selected IDs and target topic; eligibility is decided by the server when applying, rather than inferred from saved selection snapshots.

Apply sends one authenticated `POST /v2/topics/videos` with `{videoIds, topicId}`. The endpoint allows at most 2000 distinct IDs; the basket's existing 200-video limit still applies. `skipped_video_ids` are shown individually as missing or not permitted and remain selected, even if their current topic matches the target. Updated IDs, including already-matching assignments, are verified through `GET /v2/videos/:id/topic`. Only verified IDs patch caches and leave the basket, using selection tokens to protect videos reselected during the run.

Results show a short count (for example, “Topic updated on 2 of 3 videos”) and label each video **Updated**, **Not updated**, or **Couldn't confirm**. Reasons appear beside affected videos; successful edits need no explanatory paragraph.

Writes have a 30-second timeout and are never replayed automatically. A 403 refreshes the session once without retrying the write. A lost response or Stop triggers a separate read-back lasting up to 20 seconds; account changes stop further verification. Missing topic rows and mismatched or unreadable topics remain unverified. **Check again** reads only unresolved IDs, with at most three concurrent reads and the shared request budget; large selections may need repeated checks. **Edit remaining videos** creates a fresh preview for unresolved/skipped IDs before another explicit write. Stop does not roll back server changes.

## Smart group edits

| Action | Limits | Effect |
| --- | --- | --- |
| Merge participants | 2–12 videos; at most 500 missing mentions | Union talent mentions and talent uploaders across the group; uploader mentions are included, unlike ordinary mention-add skip rules. |
| Group as simulcast | 2–12 streams | Link every pair symmetrically; the cap bounds quadratic backend work. |
| Add references | 2–4 non-placeholder videos | Create directed references in both directions for every pair. |
| Unlink from video | 1–20 edited videos | Remove downstream source/reference/simulcast links to the chosen target, plus reverse simulcasts; preserve reverse references. A selected target is excluded from edited IDs. |
| Remove participant | 1–50 videos | Remove one participant chosen from the canonical union of mentions. Uploaders are preserved. |
| Remove all mentions | 1–50 videos | Remove all participant mentions, preserving uploader and relationships; more than ten videos requires typing the edited count. |

Each smart edit freezes a preview and sends exactly one group mutation. Relevant destructive/merge inputs are checked again before sending; changes require another preview. Page context is captured when opening the dialog. Page IDs are never implicitly included in the group; an explicit form option includes a page video. Target fields default from page context where available.

Mention verification reads the database-backed mention routes. Relationship verification reads full v2 details using a unique query to avoid URL-cache reuse, but the materialized catalog can still lag. Omitted relationship arrays are unknown, not empty. Unverified group members stay selected even after a successful server response. **Check again** only reads; it never repeats the mutation. Ambiguous failures can leave partial group effects, so **Edit videos again** always previews the entire original group, not an automatically reduced retry group. Stop cannot roll back server changes and performs a separate read-back for up to 20 seconds. A smart mutation has a 30-second client timeout and a 403 refreshes the session once without retrying the edit.

## Verification

Use Node 22.18+ or Node 24 for the built-in TypeScript stripping used by the tests:

```sh
npm test
npm run lint
npm run build
```

For an authenticated UI smoke test with an in-memory API and no staging writes:

```sh
node tests/curation-fixture.mjs
```

Open `http://localhost:8091`, choose Select videos in the view menu, select fixture videos, and open Edit videos. The fixture implements mentions, topic catalog/read-back/bulk edits, full details, and all six smart routes without forwarding API requests to staging. Reloading restores the fixture session; its fake token belongs only to this local fixture origin. Restarting the server resets mentions, topics, and relationships. Optional `CURATION_FIXTURE_ROLE`, `CURATION_FIXTURE_VIDEOS` (3–15), and `CURATION_FIXTURE_PORT` environment variables support testing role visibility and typed confirmations. For topic editing, the second fixture video starts with another contributor's assignment: a `user` run skips it, while an `editor` or `admin` can replace or clear it.
