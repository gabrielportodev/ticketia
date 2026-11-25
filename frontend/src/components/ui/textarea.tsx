import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'w-full rounded-lg border border-field-border bg-card hover:border-muted-foreground p-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
}
