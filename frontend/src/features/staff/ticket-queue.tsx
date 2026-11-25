import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NativeSelect } from '@/components/ui/native-select'
import {
  departmentLabel,
  departments,
  formatDate,
  priorityLabel,
  statuses,
  statusLabel,
  type QueueMeta,
  type Session,
  type TicketSummary
} from './ticket-data'

export function QueueFilters({
  session,
  department,
  status
}: {
  session: Session
  department: string
  status: string
}) {
  return (
    <Card className='p-4 lg:p-5'>
      <form action='/staff' className='flex flex-wrap items-end gap-3'>
        {session.reviewer && (
          <label className='grid min-w-36 flex-1 gap-1.5 text-sm font-medium tablet:max-w-56'>
            Setor
            <NativeSelect name='department' defaultValue={department}>
              <option value=''>Todos os setores</option>
              {Object.entries(departments).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </label>
        )}
        <label className='grid min-w-36 flex-1 gap-1.5 text-sm font-medium tablet:max-w-56'>
          Status
          <NativeSelect name='status' defaultValue={status}>
            <option value=''>Todos os status</option>
            {Object.entries(statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </label>
        <Button size='lg' type='submit'>
          Filtrar
        </Button>
      </form>
    </Card>
  )
}

export function TicketQueue({
  tickets,
  meta,
  filters
}: {
  tickets: TicketSummary[]
  meta: QueueMeta
  filters: { department: string; status: string }
}) {
  return (
    <Card className='space-y-4 p-4 lg:p-5'>
      <p className='text-sm text-muted-foreground'>
        {meta.total === 1 ? '1 atendimento' : `${meta.total} atendimentos`}
      </p>
      {tickets.length === 0 ? (
        <p className='rounded-lg bg-background p-4 text-sm'>Nenhum atendimento nesta página.</p>
      ) : (
        <ul className='divide-y divide-border'>
          {tickets.map(ticket => (
            <li key={ticket.protocol}>
              <Link
                href={`/staff/${ticket.protocol}`}
                className='grid gap-2 rounded-lg px-3 py-3 hover:bg-background focus-visible:outline-ring tablet:grid-cols-[2fr_1fr_1fr]'
              >
                <div className='min-w-0'>
                  <p className='font-medium break-words'>{ticket.subject ?? 'Atendimento sem assunto'}</p>
                  <p className='text-xs break-all text-muted-foreground'>{ticket.protocol}</p>
                </div>
                <div className='text-sm'>
                  <p>{departmentLabel(ticket.department)}</p>
                  <p className='text-xs text-muted-foreground'>{priorityLabel(ticket.priority)}</p>
                </div>
                <div className='text-sm'>
                  <p>{statusLabel(ticket.status)}</p>
                  <time dateTime={ticket.created_at} className='text-xs text-muted-foreground'>
                    {formatDate(ticket.created_at)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {(meta.current_page > 1 || meta.current_page < meta.last_page) && (
        <nav aria-label='Páginas da fila' className='flex flex-wrap items-center gap-3 border-t border-border pt-3'>
          {meta.current_page > 1 && (
            <Button asChild variant='outline'>
              <Link href={{ pathname: '/staff', query: { ...filters, page: meta.current_page - 1 } }}>Anterior</Link>
            </Button>
          )}
          <span className='text-sm text-muted-foreground'>
            Página {meta.current_page}
            {meta.last_page > 0 ? ` de ${meta.last_page}` : ''}
          </span>
          {meta.current_page < meta.last_page && (
            <Button asChild variant='outline'>
              <Link href={{ pathname: '/staff', query: { ...filters, page: meta.current_page + 1 } }}>Próxima</Link>
            </Button>
          )}
        </nav>
      )}
    </Card>
  )
}
