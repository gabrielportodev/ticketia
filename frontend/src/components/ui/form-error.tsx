import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormError({ message, id, className }: { message: string | null; id?: string; className?: string }) {
  if (!message) return null

  return (
    <p
      id={id}
      role='alert'
      className={cn('flex items-start gap-2 rounded-lg bg-error-surface p-3 text-sm text-destructive', className)}
    >
      <CircleAlert aria-hidden className='mt-0.5 size-4 shrink-0' /> {message}
    </p>
  )
}
