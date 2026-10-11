import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckIcon,
  SunIcon,
  MoonIcon,
  DesktopIcon,
  SettingsIcon,
  PlayIcon,
  HeartIcon,
  GridIcon,
  ListIcon,
} from "@/components/icons";
import { Choice, languages, PageHeading } from "@/components/common";
import { api } from "@/lib/api";
import { palette, swatches } from "@/lib/theme";
import { usePreferences, type Preferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

function SettingToggle({
  label,
  description,
  setting,
}: {
  label: string;
  description: string;
  setting: keyof Preferences;
}) {
  const { prefs, update } = usePreferences();
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 border-t py-5 first:border-t-0">
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch
        aria-label={label}
        checked={Boolean(prefs[setting])}
        onCheckedChange={(checked) => update({ [setting]: checked })}
      />
    </label>
  );
}
export function SettingsPage() {
  const { prefs, update, reset, storageError } = usePreferences();
  const [hex, setHex] = useState(prefs.primary);
  const [resetOpen, setResetOpen] = useState(false);
  const orgs = useQuery({
    queryKey: ["orgs"],
    queryFn: ({ signal }) => api.orgs(signal),
    staleTime: 3_600_000,
  });
  const dark =
    prefs.appearance === "dark" ||
    (prefs.appearance === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  const colors = palette(prefs.primary, dark);
  function changeColor(color: string) {
    setHex(color);
    if (/^#[a-f\d]{6}$/i.test(color)) update({ primary: color.toUpperCase() });
  }
  return (
    <>
      <PageHeading
        title="Make Holodex yours"
        description="A comfortable space for the way you watch."
      >
        <span
          role="status"
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <CheckIcon className="size-3.5 text-primary-ink" />
          {storageError
            ? "Changes apply to this visit"
            : "Changes saved automatically"}
        </span>
      </PageHeading>
      <div className="settings-layout grid gap-7 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="space-y-6">
          <section id="appearance" className="settings-section">
            <div className="settings-heading">
              <h2>Appearance</h2>
              <p>
                Set the mood, from morning streams to late-night rabbit holes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", name: "Light", icon: <SunIcon /> },
                { value: "dark", name: "Dark", icon: <MoonIcon /> },
                { value: "system", name: "System", icon: <DesktopIcon /> },
              ].map((mode) => (
                <button
                  key={mode.value}
                  aria-pressed={prefs.appearance === mode.value}
                  onClick={() =>
                    update({
                      appearance: mode.value as Preferences["appearance"],
                    })
                  }
                  className={cn(
                    "appearance-choice rounded-xl border p-3 text-left transition-colors hover:border-primary/50",
                    prefs.appearance === mode.value &&
                      "border-primary bg-accent/30 ring-1 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "mb-3 flex h-[65px] overflow-hidden rounded-md border",
                      mode.value === "dark"
                        ? "border-white/10 bg-[#24262d]"
                        : mode.value === "system"
                          ? "bg-linear-to-r from-[#f6f7f8] from-50% to-[#24262d] to-50%"
                          : "bg-[#f6f7f8]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-1/4 border-r p-1.5",
                        mode.value === "dark"
                          ? "border-white/10 bg-[#1c1d23]"
                          : "bg-white",
                      )}
                    >
                      <span className="mb-2 block h-1 w-3 rounded bg-primary" />
                      <span className="mb-1 block h-1 w-full rounded bg-gray-300/40" />
                      <span className="block h-1 w-3/4 rounded bg-gray-300/40" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-2">
                      <div className="h-1.5 w-1/2 rounded bg-gray-400/30" />
                      <div className="flex flex-1 gap-1.5">
                        <div className="w-1/2 rounded bg-primary/25" />
                        <div className="w-1/2 rounded bg-gray-400/20" />
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {mode.icon}
                    {mode.name}
                    {prefs.appearance === mode.value && (
                      <CheckIcon className="ml-auto text-primary-ink" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 border-t pt-5">
              <h3 className="text-[13px] font-medium">Primary color</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A little color that feels like you. Start with Aqua-iro pink, or
                pick your own.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {swatches.map((swatch) => (
                  <button
                    key={swatch.color}
                    aria-label={swatch.name}
                    aria-pressed={
                      prefs.primary.toLowerCase() === swatch.color.toLowerCase()
                    }
                    title={swatch.name}
                    style={{ backgroundColor: swatch.color }}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-4 border-card outline-offset-2 transition-transform hover:scale-110",
                      prefs.primary.toLowerCase() ===
                        swatch.color.toLowerCase() &&
                        "outline-2 outline-primary",
                    )}
                    onClick={() => changeColor(swatch.color)}
                  >
                    {prefs.primary.toLowerCase() ===
                      swatch.color.toLowerCase() && (
                      <CheckIcon className="size-4 text-[#17151B]" />
                    )}
                  </button>
                ))}
                <span className="mx-1 h-6 border-l" />
                <label
                  className="relative flex size-8 overflow-hidden rounded-full border"
                  title="Choose a custom color"
                >
                  <input
                    type="color"
                    aria-label="Custom primary color"
                    value={prefs.primary}
                    onChange={(e) => changeColor(e.target.value)}
                    className="absolute -inset-2 h-12 w-12 cursor-pointer"
                  />
                </label>
                <Input
                  aria-label="Primary color hex code"
                  value={hex}
                  maxLength={7}
                  onChange={(e) => changeColor(e.target.value)}
                  onBlur={() => setHex(prefs.primary)}
                  aria-invalid={!/^#[a-f\d]{6}$/i.test(hex)}
                  className="h-9 w-28 rounded-lg font-mono text-xs uppercase"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-background p-3">
              <span
                className="size-8 shrink-0 rounded-lg border"
                style={{ backgroundColor: colors["--background"] }}
              />
              <p className="text-[11px] leading-5 text-muted-foreground">
                The background takes a soft tint from your color’s complementary
                hue. Text and controls adjust for contrast.
              </p>
            </div>
          </section>
          <section id="browsing" className="settings-section">
            <div className="settings-heading">
              <h2>Browsing preferences</h2>
              <p>Less searching around. More of what you came for.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium">Default organization</p>
                <Choice
                  label="Default organization"
                  value={prefs.org}
                  onChange={(org) => update({ org })}
                  options={[
                    { value: "all", label: "All organizations" },
                    ...(orgs.data || [{ name: "Hololive" }]).map((o) => ({
                      value: o.name,
                      label: o.name,
                    })),
                  ]}
                  className="w-full rounded-lg bg-background"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium">
                  Video and clip language
                </p>
                <Choice
                  label="Preferred video language"
                  value={prefs.language}
                  onChange={(language) => update({ language })}
                  options={languages}
                  className="w-full rounded-lg bg-background"
                />
              </div>
            </div>
            <div className="mt-5">
              <SettingToggle
                label="Prefer English channel names"
                description="Show English names when a channel provides one."
                setting="englishNames"
              />
              <SettingToggle
                label="Hide free chat waiting rooms"
                description="Keep open-ended chat rooms out of live and upcoming streams."
                setting="hideFreeChat"
              />
              <SettingToggle
                label="Hide members-only streams"
                description="Keep your home focused on streams open to everyone."
                setting="hideMembers"
              />
              <SettingToggle
                label="Automatically refresh schedules"
                description="Check for fresh streams every two minutes while Holodex is visible."
                setting="autoRefresh"
              />
            </div>
          </section>
          <section id="layout" className="settings-section">
            <div className="settings-heading">
              <h2>Layout & accessibility</h2>
              <p>Small adjustments for a more comfortable experience.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium">Default view</p>
                <div className="flex gap-2">
                  <Button
                    variant={prefs.layout === "grid" ? "secondary" : "outline"}
                    aria-pressed={prefs.layout === "grid"}
                    onClick={() => update({ layout: "grid" })}
                    className="flex-1 rounded-lg"
                  >
                    <GridIcon />
                    Grid
                  </Button>
                  <Button
                    variant={prefs.layout === "list" ? "secondary" : "outline"}
                    aria-pressed={prefs.layout === "list"}
                    onClick={() => update({ layout: "list" })}
                    className="flex-1 rounded-lg"
                  >
                    <ListIcon />
                    List
                  </Button>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium">Content density</p>
                <Choice
                  label="Content density"
                  value={prefs.density}
                  onChange={(density) =>
                    update({ density: density as Preferences["density"] })
                  }
                  options={[
                    { value: "comfortable", label: "Comfortable" },
                    { value: "compact", label: "Compact" },
                  ]}
                  className="w-full rounded-lg bg-background"
                />
              </div>
            </div>
            <div className="mt-5">
              <SettingToggle
                label="Use a 12-hour clock"
                description="Show times with AM and PM. Turn off for a 24-hour clock."
                setting="hour12"
              />
              <SettingToggle
                label="Reduce motion"
                description="Limit transitions and animation. Your system preference is also respected."
                setting="reducedMotion"
              />
            </div>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-xs text-muted-foreground">
              Preferences and saved channels stay in this browser.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetOpen(true)}
            >
              Reset preferences
            </Button>
          </div>
        </div>
        <aside className="space-y-5">
          <div className="sticky top-24 space-y-5">
            <section className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold">A little preview</h2>
                <span className="size-2 rounded-full bg-primary" />
              </div>
              <div className="overflow-hidden rounded-xl border bg-background">
                <div className="flex items-center gap-1.5 border-b bg-card p-2.5">
                  <SettingsIcon className="size-3.5 text-primary-ink" />
                  <span className="text-[10px] font-semibold">
                    Your Holodex
                  </span>
                </div>
                <div className="space-y-3 p-3">
                  <div className="flex h-24 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-secondary">
                    <span className="flex size-9 items-center justify-center rounded-full bg-card/90 text-primary-ink">
                      <PlayIcon className="size-4" />
                    </span>
                  </div>
                  <div className="h-1.5 w-4/5 rounded bg-foreground/65" />
                  <div className="h-1 w-3/5 rounded bg-muted-foreground/25" />
                  <div className="flex items-center justify-between pt-1">
                    <span className="rounded-md bg-accent px-2 py-1 text-[9px] text-accent-foreground">
                      Live now
                    </span>
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-primary px-2.5 text-[10px] font-medium text-primary-foreground">
                      <HeartIcon />
                      Favorite
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                Your primary color and its backing palette update across Holodex
                as you change them.
              </p>
            </section>
            <nav
              aria-label="Settings sections"
              className="hidden rounded-2xl border bg-card p-5 xl:block"
            >
              <p className="mb-3 text-xs font-semibold">On this page</p>
              {[
                { id: "appearance", label: "Appearance" },
                { id: "browsing", label: "Browsing preferences" },
                { id: "layout", label: "Layout & accessibility" },
              ].map((item) => (
                <a
                  href={`#${item.id}`}
                  key={item.id}
                  className="block rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your preferences?</DialogTitle>
            <DialogDescription>
              Restore Aqua-iro pink and the default browsing settings. Your
              favorite channels and watch later videos will stay saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Keep my settings
            </Button>
            <Button
              onClick={() => {
                reset();
                setHex(swatches[0].color);
                setResetOpen(false);
              }}
            >
              Reset preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
