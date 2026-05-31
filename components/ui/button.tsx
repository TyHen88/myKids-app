import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-romduol-50 text-romduol-900 border-romduol-200 border-2 border-b-4 active:border-b-2 hover:bg-romduol-100 text-romduol-700",

        // custom
        locked:
          "bg-romduol-200 text-primary-foreground hover:bg-romduol-200/90 border-romduol-300 border-b-4 active:border-b-0",

        primary:
          "bg-romduol-400 text-white hover:bg-romduol-400/90 border-romduol-500 border-b-4 active:border-b-0",
        primaryOutline: "bg-romduol-50 text-romduol-600 hover:bg-romduol-100 border-romduol-300 border-2",

        secondary:
          "bg-romduol-500 text-white hover:bg-romduol-500/90 border-romduol-600 border-b-4 active:border-b-0",
        secondaryOutline: "bg-romduol-50 text-romduol-600 hover:bg-romduol-100",

        danger:
          "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0",
        dangerOutline: "bg-romduol-50 text-rose-500 hover:bg-romduol-100",

        super:
          "bg-amber-600 text-white hover:bg-amber-600/90 border-amber-700 border-b-4 active:border-b-0",
        superOutline: "bg-romduol-50 text-amber-600 hover:bg-romduol-100",

        ghost:
          "bg-transparent text-romduol-700 border-transparent border-0 hover:bg-romduol-50",

        sidebar:
          "bg-transparent text-romduol-700 border-2 border-transparent hover:bg-romduol-100 transition-none",
        sidebarOutline:
          "bg-romduol-400/15 text-romduol-700 border-romduol-300 border-2 hover:bg-romduol-400/25 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",

        // custom
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
