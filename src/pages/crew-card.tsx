import { useState } from "react"
import { toast } from "sonner"

import {
  CrewCard,
  ROLES,
  discord,
  github,
  type CrewMember,
  type Role,
} from "@/components/about/thanks"
import { ChannelPicker } from "@/components/common/channel-picker"
import { CopyIcon, XIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDebounced } from "@/hooks/use-debounced"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"
import { useChannelInfos } from "@/lib/queries"

/**
 * Unlinked page (/about/crew-card) where a crew member fills in their fan
 * profile, previews the card, and copies a CREW entry for thanks.tsx.
 * English only on purpose: it is a tool for the crew, not a public page.
 */

/** The form as typed; `avatar` is a GitHub username or an image link. */
interface Draft {
  name: string
  roles: Role[]
  avatar: string
  oshi: string
  mark: string
  color: string
  line: string
}

const BLANK: Draft = {
  name: "",
  roles: [],
  avatar: "",
  oshi: "",
  mark: "",
  color: "",
  line: "",
}

/** A filled-in card that is nobody in particular; the oshi stays empty. */
const EXAMPLE: Draft = {
  name: "Anon",
  roles: ["editor"],
  // GitHub's placeholder account for deleted users.
  avatar: "ghost",
  oshi: "",
  mark: "⭐",
  color: "#5b8def",
  line: "Thanks for all the clips!",
}

const LINE_MAX = 120
const GITHUB_USER = /^@?([A-Za-z0-9][A-Za-z0-9-]{0,38})$/
/** A GitHub profile or avatar link. */
const GITHUB_LINK =
  /^https?:\/\/github\.com\/([A-Za-z0-9-]+)(?:\.png)?(?:[/?#].*)?$/
/** What `github()` returns, to turn back into a call. */
const GITHUB_AVATAR = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\.png\?size=128$/
const DISCORD_AVATAR =
  /^https?:\/\/cdn\.discordapp\.com\/avatars\/(\d+)\/(\w+)\.\w+(?:\?.*)?$/

/** The avatar URL for what was typed, or undefined if it is neither form. */
function avatarUrl(input: string): string | undefined {
  const value = input.trim()
  if (!value) return undefined
  if (/^https?:\/\//.test(value)) {
    const gh = value.match(GITHUB_LINK)
    if (gh) return github(gh[1])
    const dc = value.match(DISCORD_AVATAR)
    if (dc) return discord(dc[1], dc[2])
    return value
  }
  const user = value.match(GITHUB_USER)
  return user ? github(user[1]) : undefined
}

function isColor(value: string) {
  return CSS.supports("color", value)
}

function toMember(draft: Draft, avatar = avatarUrl(draft.avatar)): CrewMember {
  const member: CrewMember = {
    name: draft.name.trim(),
    // In the canonical order, whatever order they were clicked in.
    roles: ROLES.filter((role) => draft.roles.includes(role)),
  }
  if (avatar) member.avatar = avatar
  if (draft.oshi) member.oshi = draft.oshi
  if (draft.mark.trim()) member.mark = draft.mark.trim()
  if (draft.color.trim() && isColor(draft.color.trim()))
    member.color = draft.color.trim()
  if (draft.line.trim()) member.line = draft.line.trim()
  return member
}

const str = (value: string) => JSON.stringify(value)

function avatarSource(url: string) {
  const gh = url.match(GITHUB_AVATAR)
  if (gh) return `github(${str(gh[1])})`
  const dc = url.match(DISCORD_AVATAR)
  if (dc) return `discord(${str(dc[1])}, ${str(dc[2])})`
  return str(url)
}

/** The member as a CREW entry, ready to paste into thanks.tsx. */
function snippet(member: CrewMember, oshiName?: string) {
  const fields = [
    `name: ${str(member.name)},`,
    `roles: [${member.roles.map(str).join(", ")}],`,
  ]
  if (member.avatar) fields.push(`avatar: ${avatarSource(member.avatar)},`)
  if (member.oshi)
    fields.push(
      `oshi: ${str(member.oshi)},${oshiName ? ` // ${oshiName}` : ""}`
    )
  if (member.mark) fields.push(`mark: ${str(member.mark)},`)
  if (member.color) fields.push(`color: ${str(member.color)},`)
  if (member.line) fields.push(`line: ${str(member.line)},`)
  return `{\n${fields.map((field) => `  ${field}`).join("\n")}\n},`
}

export default function CrewCardPage() {
  const { t } = useT()
  useDocumentTitle("Crew card maker")
  const [draft, setDraft] = useState<Draft>(BLANK)
  const set = (patch: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...patch }))

  // Wait for a pause in typing so a half-typed username doesn't fetch.
  const typedAvatar = useDebounced(draft.avatar, 400)
  const member = toMember(draft)
  const preview = toMember(draft, avatarUrl(typedAvatar))
  const oshi = useChannelInfos(draft.oshi ? [draft.oshi] : []).get(draft.oshi)

  const avatarInvalid = draft.avatar.trim() !== "" && !member.avatar
  const colorInvalid = draft.color.trim() !== "" && !member.color
  const missing = [
    !member.name && "your name",
    !member.roles.length && "a role",
  ].filter(Boolean)
  const code = snippet(
    member,
    oshi ? oshi.english_name || oshi.name : undefined
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Copied! Send it to an admin on Discord.")
    } catch {
      toast.error("Couldn't copy. Select the text and copy it by hand.")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-4 pb-16 md:px-8 md:pt-6">
      <h1 className="text-2xl font-bold tracking-tight">Crew card maker</h1>
      <p className="mt-1 text-pretty text-muted-foreground">
        Fill in your card for the crew section of the About page, check the
        preview, then copy the snippet and send it to an admin.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Start from</span>
        <Button variant="outline" size="sm" onClick={() => setDraft(BLANK)}>
          Blank card
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDraft(EXAMPLE)}>
          Example
        </Button>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_13rem]">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="crew-name">Name</FieldLabel>
            <Input
              id="crew-name"
              value={draft.name}
              maxLength={32}
              autoComplete="off"
              onChange={(event) => set({ name: event.target.value })}
            />
          </Field>

          <Field>
            <FieldTitle id="crew-roles">Roles</FieldTitle>
            <ToggleGroup
              multiple
              variant="outline"
              size="sm"
              className="flex-wrap"
              aria-labelledby="crew-roles"
              value={draft.roles}
              onValueChange={(next) => set({ roles: next as Role[] })}
            >
              {ROLES.map((role) => (
                <ToggleGroupItem key={role} value={role}>
                  {t(`about.roles.${role}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>

          <Field data-invalid={avatarInvalid || undefined}>
            <FieldLabel htmlFor="crew-avatar">Avatar</FieldLabel>
            <Input
              id="crew-avatar"
              value={draft.avatar}
              placeholder="GitHub username or image link"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={avatarInvalid || undefined}
              onChange={(event) => set({ avatar: event.target.value })}
            />
            <FieldDescription>
              {avatarInvalid
                ? "That isn't a GitHub username or a link."
                : "Your GitHub username, or a link to any square image. A Discord avatar link works too."}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="crew-oshi">Oshi</FieldLabel>
            <ChannelPicker
              id="crew-oshi"
              placeholder="Search for a talent"
              value={draft.oshi ? [draft.oshi] : []}
              // One oshi per card; a new pick replaces the old one.
              onChange={(ids) => set({ oshi: ids.at(-1) ?? "" })}
            />
            <FieldDescription>
              Their banner becomes your card's header, and their name links to
              their channel.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="crew-mark">Oshi mark</FieldLabel>
            <Input
              id="crew-mark"
              value={draft.mark}
              placeholder="🌸"
              maxLength={16}
              autoComplete="off"
              className="w-28"
              onChange={(event) => set({ mark: event.target.value })}
            />
            <FieldDescription>Goes after your name.</FieldDescription>
          </Field>

          <Field data-invalid={colorInvalid || undefined}>
            <FieldLabel htmlFor="crew-color">Header colour</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Pick a header colour"
                value={
                  /^#[0-9a-f]{6}$/i.test(draft.color) ? draft.color : "#808080"
                }
                onChange={(event) => set({ color: event.target.value })}
                className="size-9 shrink-0 cursor-pointer rounded-full border border-input bg-transparent p-1 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
              />
              <Input
                id="crew-color"
                value={draft.color}
                placeholder="#f13da3"
                spellCheck={false}
                autoComplete="off"
                aria-invalid={colorInvalid || undefined}
                className="w-36 font-mono"
                onChange={(event) => set({ color: event.target.value })}
              />
              {draft.color && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear the header colour"
                  onClick={() => set({ color: "" })}
                >
                  <XIcon />
                </Button>
              )}
            </div>
            <FieldDescription>
              {colorInvalid
                ? "That isn't a CSS colour."
                : "Fills the header when there's no oshi banner. Any CSS colour works."}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="crew-line">Your line</FieldLabel>
            <Input
              id="crew-line"
              value={draft.line}
              placeholder="A greeting, a catchphrase, a favourite clip"
              maxLength={LINE_MAX}
              autoComplete="off"
              onChange={(event) => set({ line: event.target.value })}
            />
            <FieldDescription>
              Keep it short; the card is narrow. {draft.line.length}/{LINE_MAX}
            </FieldDescription>
          </Field>
        </FieldGroup>

        <div>
          <p className="mb-2 text-sm font-medium">Preview</p>
          {/* The width a card gets in the About page's five-column grid. */}
          <ul className="w-52 max-w-full">
            <CrewCard
              member={{ ...preview, name: preview.name || "Your name" }}
              oshi={oshi}
            />
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold tracking-tight">Your snippet</h2>
          <Button
            size="sm"
            className="ml-auto"
            disabled={missing.length > 0}
            onClick={copy}
          >
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {missing.length
            ? `Add ${missing.join(" and ")} to finish your card.`
            : "It goes in CREW in src/components/about/thanks.tsx."}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl border bg-card p-4 font-mono text-sm">
          {code}
        </pre>
      </div>
    </div>
  )
}
