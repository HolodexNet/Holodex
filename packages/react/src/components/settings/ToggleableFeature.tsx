import { cn } from "@/lib/utils";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import React from "react";

interface BaseToggleableFeatureProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

interface IconToggleableFeatureProps extends BaseToggleableFeatureProps {
  variant: "icon";
  icon: string;
}

interface BasicToggleableFeatureProps extends BaseToggleableFeatureProps {
  variant: "basic";
}

type ToggleableFeatureProps =
  | IconToggleableFeatureProps
  | BasicToggleableFeatureProps;

interface ToggleableFeatureGroupProps {
  features: ToggleableFeatureProps[];
  showDividers?: boolean;
}

// Individual feature toggle component
const ToggleableFeatureSetting = (props: ToggleableFeatureProps) => {
  if (props.variant === "icon") {
    const { id, checked, onCheckedChange, label, icon } = props;
    return (
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            checked ? "bg-primary-4" : "bg-base-4",
          )}
        >
          <div
            className={cn(
              icon,
              "h-5 w-5",
              checked ? "text-primary-11" : "text-base-11",
            )}
          />
        </div>
        <Label
          htmlFor={id}
          className={cn(
            "flex grow cursor-pointer items-center gap-1 self-stretch",
            {
              "text-primary-11": checked,
              "text-base-11": !checked,
            },
          )}
        >
          {label}
        </Label>
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={() => onCheckedChange(!checked)}
          className="h-6 w-6"
        />
      </div>
    );
  }

  const { id, checked, onCheckedChange, label } = props;
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={() => onCheckedChange(!checked)}
      />
      <Label
        htmlFor={id}
        className={cn("cursor-pointer", {
          "opacity-70": !checked,
        })}
      >
        {label}
      </Label>
    </div>
  );
};

// Group component to handle multiple toggles
// Group component to handle multiple toggles
export const ToggleableFeatureGroup = ({
  features,
  showDividers = false,
}: ToggleableFeatureGroupProps) => {
  return (
    <div className={"flex flex-col  " + (showDividers ? "gap-2" : "gap-4")}>
      {features.map((feature, index) => (
        <React.Fragment key={feature.id}>
          <ToggleableFeatureSetting {...feature} />
          {showDividers && index < features.length - 1 && (
            <div className="-mb-px h-px bg-base-6" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ToggleableFeatureGroup;
