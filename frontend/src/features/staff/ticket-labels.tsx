import { cn } from '@/lib/utils'
import { priorityLabel, statusLabel, type TicketSummary } from './ticket-data'

const statusStyles = {
  PENDENTE_TRIAGEM: 'bg-slate-100 text-slate-700',
  EM_REVISAO: 'bg-amber-100 text-amber-900',
  ENCAMINHADO: 'bg-secondary text-secondary-foreground'
}

const priorityStyles = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-900',
  HIGH: 'bg-red-100 text-red-800'
}

export function StatusLabel({ value }: { value: TicketSummary['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        statusStyles[value]
      )}
    >
      <span aria-hidden className='size-1.5 shrink-0 rounded-full bg-current' />
      {statusLabel(value)}
    </span>
  )
}

export function PriorityLabel({ value }: { value: TicketSummary['priority'] }) {
  if (!value) return <span className='text-sm text-muted-foreground'>{priorityLabel(value)}</span>

  return (
    <span className={cn('inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold', priorityStyles[value])}>
      {priorityLabel(value)}
    </span>
  )
}
