import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon as CircleCheckIcon, InfoIcon, WarningIcon as TriangleAlertIcon, XCircleIcon as OctagonXIcon, CircleNotchIcon as Loader2Icon } from "@/components/icons"
import { useResolvedMode } from "@/lib/theme/use-theme"

const Toaster = ({ ...props }: ToasterProps) => {
  const mode = useResolvedMode()

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
