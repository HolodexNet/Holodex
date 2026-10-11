import type { ReactNode } from "react"

import { ArrowClockwiseIcon, WarningIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ApiError } from "@/lib/api"
import { useT } from "@/lib/i18n"

interface StateMessageProps {
  icon?: ReactNode
  title: string
  description?: ReactNode
  children?: ReactNode
}

export function StateMessage({
  icon,
  title,
  description,
  children,
}: StateMessageProps) {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}

/** Explains a failed request and offers the one thing that helps: retrying. */
export function ErrorMessage({
  error,
  onRetry,
}: {
  error: unknown
  onRetry?: () => void
}) {
  const { t } = useT()
  const rateLimited = error instanceof ApiError && error.status === 429

  return (
    <StateMessage
      icon={<WarningIcon />}
      title={t("component.apiError.title")}
      description={
        rateLimited
          ? t("component.apiError.rateLimited")
          : t("component.apiError.generic")
      }
    >
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <ArrowClockwiseIcon data-icon="inline-start" />
          {t("component.apiError.retry")}
        </Button>
      )}
    </StateMessage>
  )
}
