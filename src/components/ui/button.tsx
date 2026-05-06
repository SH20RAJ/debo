import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-2xl border-2 border-transparent bg-clip-padding text-sm font-extrabold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:brightness-105 active:translate-y-[2px]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-muted hover:text-foreground border-transparent",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-105",
        link: "text-primary underline-offset-4 hover:underline",
        duolingo: "btn-3d btn-3d-green bg-duo-green text-white uppercase tracking-wider",
        "duolingo-outline": "btn-3d btn-3d-white bg-background text-duo-eel border-duo-swan uppercase tracking-wider hover:bg-duo-polar",
        "duolingo-blue": "btn-3d btn-3d-blue bg-duo-blue text-white uppercase tracking-wider",
      },
      size: {
        default: "h-12 px-6",
        xs: "h-8 px-3 text-xs rounded-xl",
        sm: "h-10 px-4 text-sm rounded-xl",
        lg: "h-14 px-8 text-base",
        icon: "size-12",
        "icon-xs": "size-8 rounded-lg",
        "icon-sm": "size-10 rounded-xl",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
