// ─────────────────────────────────────────────────────────────────────────────
// SyncToolbar - Bottom toolbar for video synchronization controls
// ─────────────────────────────────────────────────────────────────────────────

export function SyncToolbar() {
  return (
    <div className="w-full border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="i-tabler:keyframe-align-vertical h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Sync Controls</span>
          <span className="text-xs text-muted-foreground">(Coming Soon)</span>
        </div>

        {/* Placeholder for future sync controls */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Synchronization controls will appear here
        </div>
      </div>
    </div>
  );
}
