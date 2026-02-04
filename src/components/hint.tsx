"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"

interface HintProps {
    label: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
};

export const Hint = ({
    label,
    children,
    side ,
    align,
}: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 dark:border-slate-800"
                >
                    <p className="font-medium text-xs">
                        {label}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};