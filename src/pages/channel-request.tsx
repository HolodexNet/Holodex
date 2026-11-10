import { useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Link, useSearchParams } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { cn } from "cn"

import { RichText } from "@/components/about/shared"
import {
  ChannelFinder,
  useChannelLookup,
  type ChannelLookup,
} from "@/components/channel-request/channel-finder"
import {
  BroadcastIcon,
  CheckCircleIcon,
  FilmStripIcon,
  HouseLineIcon,
  InfoIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/components/icons"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { cardVariants } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api, ApiError } from "@/lib/api"
import {
  buildChannelRequest,
  CHANNEL_LANGS,
  COMMENT_MAX,
  detailIssues,
  EMPTY_DETAILS,
  isAddKind,
  isDuplicateRequest,
  listedChannelInput,
  parseRequestKind,
  REQUEST_KINDS,
  requestFields,
  SHORT_MAX,
  type ChannelRequestBody,
  type DetailField,
  type DetailIssue,
  type RequestDetails,
  type RequestKind,
} from "@/lib/channel-request"
import { useT, type Translator } from "@/lib/i18n"

const SEND_TIMEOUT_MS = 20_000

type T = Translator["t"]

interface KindCopy {
  title: string
  hint: string
  icon: ReactNode
  /** Rich text: the requirements carry a little HTML. */
  requirements?: string
}

/** Literal keys throughout, so the i18n checker sees them in use. */
function kindCopy(t: T, kind: RequestKind): KindCopy {
  switch (kind) {
    case "vtuber":
      return {
        title: t("channelRequest.Types.AddVtuber"),
        hint: t("channelRequest.typeHints.AddVtuber"),
        icon: <BroadcastIcon />,
        requirements: t("channelRequest.VtuberRequirementText"),
      }
    case "clipper":
      return {
        title: t("channelRequest.Types.AddClipper"),
        hint: t("channelRequest.typeHints.AddClipper"),
        icon: <FilmStripIcon />,
        requirements: t("channelRequest.ClipperRequirementText"),
      }
    case "update":
      return {
        title: t("channelRequest.Types.ModifyExistingInfo"),
        hint: t("channelRequest.typeHints.ModifyExistingInfo"),
        icon: <PencilSimpleIcon />,
      }
    case "remove":
      return {
        title: t("channelRequest.Types.DeleteChannel"),
        hint: t("channelRequest.typeHints.DeleteChannel"),
        icon: <TrashIcon />,
        requirements: t("channelRequest.DeletionRequirementText"),
      }
  }
}

function issueText(t: T, issue: DetailIssue): string {
  switch (issue) {
    case "langMissing":
      return t("channelRequest.errors.langMissing")
    case "twitterInvalid":
      return t("channelRequest.errors.twitterInvalid")
    case "contactMissing":
      return t("channelRequest.errors.contactMissing")
    case "nothingToChange":
      return t("channelRequest.errors.nothingToChange")
    case "commentsLong":
      return t("channelRequest.errors.commentsLong", { max: COMMENT_MAX })
  }
}

/**
 * Add, fix or remove a channel. Finding the channel comes first, and says at
 * once whether Holodex already lists it; the details only open up once the
 * request makes sense. `?type=` preselects the kind, for links from the FAQ.
 */
export default function ChannelRequestPage() {
  const { t } = useT()
  const [params] = useSearchParams()
  const [kind, setKind] = useState(() => parseRequestKind(params.get("type")))
  const [channelText, setChannelText] = useState("")
  const [details, setDetails] = useState<RequestDetails>(EMPTY_DETAILS)
  const [sent, setSent] = useState(false)
  const lookup = useChannelLookup(channelText)
  useDocumentTitle(t("channelRequest.PageTitle"))

  const send = useMutation({
    mutationFn: (body: ChannelRequestBody) =>
      api.requestChannel(body, AbortSignal.timeout(SEND_TIMEOUT_MS)),
    onSuccess: () => {
      setSent(true)
      window.scrollTo({ top: 0 })
    },
  })

  // A failed send's message is about what was sent, so editing clears it; one
  // still in flight is left to land.
  const clearSendError = () => {
    if (!send.isPending) send.reset()
  }
  const chooseKind = (next: RequestKind) => {
    setKind(next)
    clearSendError()
  }
  const changeChannel = (text: string) => {
    setChannelText(text)
    clearSendError()
  }
  const startOver = () => {
    setChannelText("")
    setDetails(EMPTY_DETAILS)
    setSent(false)
    send.reset()
  }

  return (
    <PageShell width="3xl">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
          {t("channelRequest.PageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          {t("channelRequest.intro")}
        </p>
      </header>

      {sent ? (
        <SentPanel onAnother={startOver} />
      ) : (
        <div className="flex flex-col gap-6 md:gap-8">
          <KindPicker value={kind} onChange={chooseKind} />
          {kind && (
            // Keyed so that switching kinds starts validation afresh, while
            // the channel and anything typed carry over.
            <RequestForm
              key={kind}
              kind={kind}
              channelText={channelText}
              onChannelChange={changeChannel}
              onKindChange={chooseKind}
              lookup={lookup}
              details={details}
              onDetailsChange={setDetails}
              onSend={(body) => {
                if (!send.isPending) send.mutate(body)
              }}
              sending={send.isPending}
              sendError={send.error}
            />
          )}
        </div>
      )}
    </PageShell>
  )
}

function focusFirstProblem(form: HTMLFormElement | null) {
  requestAnimationFrame(() => {
    const field = form?.querySelector<HTMLElement>('[data-invalid="true"]')
    if (!field) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    field.scrollIntoView({
      block: "center",
      behavior: reduced ? "auto" : "smooth",
    })
    field
      .querySelector<HTMLElement>("input, textarea, button")
      ?.focus({ preventScroll: true })
  })
}

function KindPicker({
  value,
  onChange,
}: {
  value: RequestKind | null
  onChange: (kind: RequestKind) => void
}) {
  const { t } = useT()

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">
        {t("channelRequest.RequestType")}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {REQUEST_KINDS.map((kind) => {
          const copy = kindCopy(t, kind)
          const checked = value === kind
          return (
            <label
              key={kind}
              data-selected={checked || undefined}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border selectable bg-card p-3 transition-colors hover:bg-muted/40 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 md:p-4"
            >
              <input
                type="radio"
                name="request-kind"
                value={kind}
                checked={checked}
                onChange={() => onChange(kind)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors [&_svg]:size-5",
                  checked
                    ? "bg-primary/12 text-brand"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {copy.icon}
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="text-sm leading-snug font-semibold">
                  {copy.title}
                </span>
                <span className="text-xs text-pretty text-muted-foreground">
                  {copy.hint}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function RequestForm({
  kind,
  channelText,
  onChannelChange,
  onKindChange,
  lookup,
  details,
  onDetailsChange,
  onSend,
  sending,
  sendError,
}: {
  kind: RequestKind
  channelText: string
  onChannelChange: (text: string) => void
  onKindChange: (kind: RequestKind) => void
  lookup: ChannelLookup
  details: RequestDetails
  onDetailsChange: (details: RequestDetails) => void
  onSend: (body: ChannelRequestBody) => void
  sending: boolean
  sendError: Error | null
}) {
  const { t } = useT()
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [touched, setTouched] = useState(false)
  const add = isAddKind(kind)
  const copy = kindCopy(t, kind)
  const { input, status } = lookup
  const listed = status === "listed" ? lookup.channel : undefined
  const channelType = kind === "update" ? listed?.type : undefined

  // What stands between the channel box and a request that makes sense.
  const channelProblem =
    input.kind === "empty" || (input.kind === "name" && add)
      ? "missing"
      : input.kind === "name"
        ? "pick"
        : input.kind !== "id" && input.kind !== "handle"
          ? "format"
          : status === "checking"
            ? "checking"
            : add && status === "listed"
              ? "listed"
              : !add && status === "unlisted"
                ? "unlisted"
                : null

  // Details open once the channel checks out, and stay open while an edited
  // link is re-checked, so the form doesn't flicker.
  const [detailsOpen, setDetailsOpen] = useState(false)
  if (channelProblem === null && !detailsOpen) setDetailsOpen(true)
  if (channelProblem && channelProblem !== "checking" && detailsOpen)
    setDetailsOpen(false)
  const showDetails = channelProblem === null || detailsOpen

  const fields = requestFields(kind, channelType)
  const issues = detailIssues(kind, details, channelType)
  const has = (field: DetailField) => fields.includes(field)
  const set = (field: DetailField, value: string) =>
    onDetailsChange({ ...details, [field]: value })
  const issue = (field: DetailField) => {
    const found = issues[field]
    if (!found || (!touched && found !== "commentsLong")) return undefined
    return issueText(t, found)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (channelProblem || Object.keys(issues).length > 0) {
      focusFirstProblem(formRef.current)
      return
    }
    if (input.kind !== "id" && input.kind !== "handle") return
    onSend(
      buildChannelRequest({
        kind,
        link: !add && listed ? listedChannelInput(listed.id) : input.link,
        currentName: !add ? listed?.name : undefined,
        channelType,
        details,
      })
    )
  }

  const duplicate =
    sendError instanceof ApiError &&
    isDuplicateRequest(sendError.status, sendError.message)
  // The update fields hint at what's there now.
  const current = (value?: string | null) =>
    kind === "update" && value ? value : undefined

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      className={cn(
        cardVariants({ radius: "3xl" }),
        "flex flex-col gap-6 p-4 md:p-6"
      )}
    >
      {copy.requirements && (
        <Callout>
          <InfoIcon />
          <p className="min-w-0 flex-1 text-pretty">
            <RichText html={copy.requirements} />
          </p>
        </Callout>
      )}

      <ChannelFinder
        id={`${id}-channel`}
        kind={kind}
        value={channelText}
        onChange={onChannelChange}
        onKindChange={onKindChange}
        lookup={lookup}
        error={
          touched && channelProblem === "missing"
            ? t("channelRequest.errors.channelMissing")
            : touched && channelProblem === "pick"
              ? t("channelRequest.errors.channelPick")
              : undefined
        }
      />

      {showDetails && (
        <>
          {has("englishName") && (
            <TextField
              id={`${id}-english`}
              label={t("channelRequest.EnglishNameLabel")}
              hint={t("channelRequest.EnglishNameHint")}
              value={details.englishName}
              onChange={(value) => set("englishName", value)}
              placeholder={current(listed?.english_name)}
            />
          )}
          {has("lang") && (
            <LanguageField
              id={`${id}-lang`}
              value={details.lang}
              onChange={(value) => set("lang", value)}
              error={issue("lang")}
            />
          )}
          {has("org") && (
            <TextField
              id={`${id}-org`}
              label={t("channelRequest.VtuberGroupLabel")}
              hint={t("channelRequest.VtuberGroupHint")}
              value={details.org}
              onChange={(value) => set("org", value)}
              placeholder={current(listed?.org) ?? "Hololive, Nijisanji, …"}
            />
          )}
          {has("twitter") && (
            <TextField
              id={`${id}-twitter`}
              label={t("channelRequest.TwitterHandle")}
              value={details.twitter}
              onChange={(value) => set("twitter", value)}
              placeholder={
                current(listed?.twitter && `@${listed.twitter}`) ?? "@handle"
              }
              error={issue("twitter")}
              autoCapitalize="none"
            />
          )}
          {has("contact") && (
            <TextField
              id={`${id}-contact`}
              label={
                kind === "remove"
                  ? t("channelRequest.DirectContactRequiredLabel")
                  : t("channelRequest.DirectContactLabel")
              }
              hint={t("channelRequest.DirectContactDisclaimer")}
              value={details.contact}
              onChange={(value) => set("contact", value)}
              placeholder="@name, name@example.com"
              error={issue("contact")}
              autoCapitalize="none"
            />
          )}
          {has("comments") && (
            <CommentsField
              id={`${id}-comments`}
              hint={
                kind === "update"
                  ? t("channelRequest.UpdateCommentsHint")
                  : t("channelRequest.CommentsHint")
              }
              value={details.comments}
              onChange={(value) => set("comments", value)}
              error={issue("comments")}
              onSubmitShortcut={() => formRef.current?.requestSubmit()}
            />
          )}

          {sendError &&
            (duplicate ? (
              <Callout>
                <InfoIcon />
                <p className="min-w-0 flex-1">
                  {t("channelRequest.errors.duplicate")}
                </p>
              </Callout>
            ) : (
              <p role="alert" className="text-sm text-destructive">
                {sendError instanceof ApiError && sendError.status === 429
                  ? t("component.apiError.rateLimited")
                  : t("channelRequest.errors.failed")}
              </p>
            ))}
        </>
      )}

      {(showDetails || touched) && (
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={sending}
          >
            {sending && <Spinner />}
            {t("channelRequest.send")}
          </Button>
        </div>
      )}
    </form>
  )
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  error,
  autoCapitalize,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  autoCapitalize?: string
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ")
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={SHORT_MAX}
        autoComplete="off"
        autoCapitalize={autoCapitalize}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy || undefined}
      />
      {hint && <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}

/** Every option in view, which beats a dropdown with a thumb. */
function LanguageField({
  id,
  value,
  onChange,
  error,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const { t } = useT()
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldTitle id={`${id}-label`}>
        {t("channelRequest.ChannelLanguageLabel")}
      </FieldTitle>
      <ToggleGroup
        variant="outline"
        size="sm"
        className="flex-wrap"
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        value={value ? [value] : []}
        onValueChange={(next) => onChange(next[0] ?? "")}
      >
        {CHANNEL_LANGS.map((lang) => (
          <ToggleGroupItem key={lang.value} value={lang.value}>
            {lang.text}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}

function CommentsField({
  id,
  hint,
  value,
  onChange,
  error,
  onSubmitShortcut,
}: {
  id: string
  hint: string
  value: string
  onChange: (value: string) => void
  error?: string
  onSubmitShortcut: () => void
}) {
  const { t } = useT()
  const length = value.trim().length
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{t("channelRequest.Comments")}</FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
            onSubmitShortcut()
        }}
        rows={4}
        className="max-h-72"
        aria-invalid={!!error || undefined}
        aria-describedby={`${id}-hint`}
      />
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <FieldError id={`${id}-hint`}>{error}</FieldError>
        ) : (
          <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription>
        )}
        {length > COMMENT_MAX * 0.8 && (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              length > COMMENT_MAX
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {length}/{COMMENT_MAX}
          </span>
        )}
      </div>
    </Field>
  )
}

function SentPanel({ onAnother }: { onAnother: () => void }) {
  const { t } = useT()
  return (
    <div
      role="status"
      className={cn(
        cardVariants({ radius: "3xl" }),
        "flex flex-col items-center px-4 py-10 text-center md:px-10 md:py-14"
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-brand [&_svg]:size-8"
      >
        <CheckCircleIcon />
      </span>
      <h2 className="mt-4 text-xl font-bold">
        {t("channelRequest.sent.title")}
      </h2>
      <p className="mt-2 max-w-md text-pretty text-muted-foreground">
        {t("channelRequest.sent.body")}
      </p>
      <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          <HouseLineIcon data-icon="inline-start" />
          {t("views.notFound.back")}
        </Button>
        <Button onClick={onAnother}>{t("channelRequest.sent.another")}</Button>
      </div>
    </div>
  )
}
