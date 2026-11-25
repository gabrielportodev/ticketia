import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function NativeSelect({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div data-slot='native-select-wrapper' className='relative w-full'>
      <select
        data-slot='native-select'
        className={cn(
          'h-9 w-full appearance-none rounded-lg border border-border bg-card ps-3 pe-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className='pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2' />
    </div>
  )
}
