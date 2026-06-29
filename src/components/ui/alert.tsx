import * as React from 'react';

import { cn } from '@/lib/utils';

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-muted/70 p-4 text-sm leading-6 text-foreground', className)} {...props} />;
}
