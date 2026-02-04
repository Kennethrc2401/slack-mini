import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

interface SidebarButtonProps extends ButtonProps {
    icon: LucideIcon | IconType;
    label: string;
    isActive?: boolean;
};

export const SidebarButton = React.forwardRef<HTMLButtonElement, SidebarButtonProps>(
    ({
        icon: Icon,
        label,
        isActive,
        className,
        ...props
    }, ref) => {
        return (
            <Button
                ref={ref}
                type="button"
                variant="transparent"
                className={cn(
                    "h-14 w-14 p-2 flex flex-col items-center justify-center gap-y-1 group",
                    isActive && "bg-accent/20",
                    className
                )}
                {...props}
            >
                <Icon
                    className="size-5 text-white group-hover:scale-110 transition-all"
                />
                <span className="text-[11px] text-white group-hover:text-accent">
                    {label}
                </span>
            </Button>
        );
    }
);

SidebarButton.displayName = "SidebarButton";