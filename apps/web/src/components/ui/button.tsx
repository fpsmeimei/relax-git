import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold font-sans ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-success text-success-foreground hover:bg-success/90',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
        info: 'bg-info text-info-foreground hover:bg-info/90',
        soft: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 shadow-sm',
        'success-soft': 'bg-success/12 text-success hover:bg-success/20',
        'warning-soft': 'bg-warning/12 text-warning hover:bg-warning/20',
        'info-soft': 'bg-info/12 text-info hover:bg-info/20',
        outline:
          'border border-primary/40 text-primary bg-transparent hover:bg-primary/10 hover:text-primary shadow-sm',
        'outline-subtle':
          'border border-border/40 bg-background hover:bg-accent/20',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'text-primary hover:bg-primary/10 hover:text-primary',
        glow: 'relative border border-[var(--brand-green)]/55 bg-transparent text-foreground shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-spotify-glow before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-gradient-to-r before:from-[var(--brand-green)]/20 before:via-[var(--brand-blue)]/14 before:to-[var(--brand-purple)]/10 before:opacity-80 before:blur-xl',
        link: 'text-[var(--brand-green)] smooth-underline',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3',
        lg: 'h-12 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle
                className="opacity-20"
                cx="10"
                cy="10"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                className="opacity-90"
                d="M10 1a9 9 0 0 1 9 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
