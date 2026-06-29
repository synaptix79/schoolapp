import * as React from 'react';

import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
          variant === 'default' && 'bg-primary text-primary-foreground shadow-soft hover:bg-canaan-celeste',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/75',
          variant === 'outline' && 'border border-border bg-card text-foreground hover:bg-muted',
          variant === 'ghost' && 'text-foreground hover:bg-muted',
          size === 'default' && 'h-11 px-5',
          size === 'sm' && 'h-9 px-3',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
