"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(undefined)

const usePopover = () => {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error("Popover components must be used within Popover")
  }
  return context
}

type PopoverProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Popover = ({ open: openProp, defaultOpen, onOpenChange, children }: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen
  const triggerRef = React.useRef<HTMLElement>(null)

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

type PopoverTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ asChild, onClick, className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover()

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(!open)
      }
    }

    const setRefs = (node: HTMLElement | null) => {
      triggerRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        className: cn((children as any).props?.className, className),
        onClick: handleClick,
        ref: setRefs,
        "data-state": open ? "open" : "closed",
        "data-popover-trigger": "",
        "aria-expanded": open,
      })
    }

    return (
      <button
        type="button"
        ref={setRefs as React.Ref<HTMLButtonElement>}
        className={className}
        onClick={handleClick}
        data-state={open ? "open" : "closed"}
        data-popover-trigger=""
        aria-expanded={open}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement>

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopover()
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node
        const triggerEl = triggerRef.current
        const contentEl = contentRef.current

        if (triggerEl?.contains(target) || contentEl?.contains(target)) {
          return
        }

        setOpen(false)
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }, [open, setOpen, triggerRef])

    if (!open) {
      return null
    }

    const setRefs = (node: HTMLDivElement | null) => {
      contentRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    return (
      <div
        ref={setRefs}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className
        )}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

const PopoverAnchor = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={className} {...props} />
  )
)
PopoverAnchor.displayName = "PopoverAnchor"

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent }