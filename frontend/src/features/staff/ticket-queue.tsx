import { ArrowLeft, ArrowRight, ChevronRight, CircleCheck, Clock3, Inbox, ListFilter, ScanSearch } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { queueHref, type QueueSelection } from './queue-navigation'
import { StaffNotice } from './staff-notice'
import { departmentLabel, departments, formatDate, statuses, type QueueMeta, type TicketSummary } from './ticket-data'
import { PriorityLabel, StatusLabel } from './ticket-labels'

const views = [
  { value: '', label: 'Todos', icon: Inbox },
  { value: 'PENDING_TRIAGE', label: statuses.PENDING_TRIAGE, icon: Clock3 },
  { value: 'NEEDS_REVIEW', label: statuses.NEEDS_REVIEW, icon: ScanSearch },
  { value: 'ROUTED', label: statuses.ROUTED, icon: CircleCheck }
]

export function QueueFilters({ reviewer, filters }: { reviewer: boolean; filters: QueueSelection }) {
  return (
    <div className='grid gap-3 border-b border-border px-4 py-3 tablet:px-5 xl:flex xl:flex-wrap xl:items-center xl:justify-between'>
      <nav aria-label='Status dos atendimentos' className='flex flex-wrap gap-1'>
        {views.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            asChild
            className='h-11 gap-2 px-2.5 tablet:px-3'
            variant={value === filters.status ? 'secondary' : 'ghost'}
          >
            <Link
              href={queueHref({ ...filters, status: value, page: '1' })}
              aria-current={value === filters.status ? 'page' : undefined}
            >
              <Icon aria-hidden className='hidden tablet:block' /> {label}
            </Link>
          </Button>
        ))}
      </nav>
      {reviewer && (
        <form key={filters.department} action='/staff' className='flex flex-wrap items-end gap-2'>
          {filters.status && <input type='hidden' name='status' value={filters.status} />}
          <label className='flex min-w-36 flex-1 items-center gap-2 text-sm font-semibold tablet:max-w-64'>
            Setor
            <NativeSelect className='h-11 font-normal' name='department' defaultValue={filters.department}>
              <option value=''>Todos os setores</option>
              {Object.entries(departments).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </label>
          <Button type='submit' variant='outline' className='h-11 px-3'>
            <ListFilter aria-hidden /> Filtrar
          </Button>
        </form>
      )}
    </div>
  )
}

export function TicketQueue({
  tickets,
  meta,
  filters
}: {
  tickets: TicketSummary[]
  meta: QueueMeta
  filters: QueueSelection
}) {
  if (tickets.length === 0) {
    return <EmptyQueue filters={filters} outOfRange={meta.current_page > Math.max(1, meta.last_page)} />
  }

  return (
    <div>
      <div className='px-4 py-3 text-sm text-muted-foreground tabular-nums tablet:px-5'>
        {meta.total} {meta.total === 1 ? 'atendimento' : 'atendimentos'}
      </div>
      <table className='w-full table-fixed border-collapse text-left'>
        <caption className='sr-only'>Atendimentos na fila</caption>
        <thead className='border-y border-border bg-background text-sm text-muted-foreground'>
          <tr>
            <th scope='col' className='px-4 py-3 lg:w-[34%] lg:px-5'>
              Solicitação
            </th>
            <th scope='col' className='hidden px-2 py-3 lg:table-cell lg:w-[14%]'>
              Setor
            </th>
            <th scope='col' className='hidden px-2 py-3 lg:table-cell lg:w-[22%]'>
              Status
            </th>
            <th scope='col' className='hidden px-2 py-3 lg:table-cell lg:w-[14%]'>
              Prioridade
            </th>
            <th scope='col' className='hidden px-2 py-3 lg:table-cell lg:w-[16%]'>
              Entrada
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {tickets.map(ticket => (
            <tr key={ticket.protocol} className='transition-colors hover:bg-background focus-within:bg-background'>
              <td className='p-0'>
                <Link
                  href={queueHref(filters, { protocol: ticket.protocol })}
                  className='group block rounded-sm px-4 py-3.5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring tablet:px-5'
                >
                  <span className='flex items-start justify-between gap-2'>
                    <span className='min-w-0 text-sm font-semibold wrap-anywhere group-hover:text-primary group-hover:underline'>
                      {ticket.subject ?? 'Atendimento sem assunto'}
                    </span>
                    <ChevronRight aria-hidden className='size-4 shrink-0 text-primary' />
                  </span>
                  <span className='mt-1 block font-mono text-xs wrap-anywhere text-muted-foreground'>
                    {ticket.protocol}
                  </span>
                  <span className='mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 lg:hidden'>
                    <StatusLabel value={ticket.status} />
                    <span className='text-xs'>{departmentLabel(ticket.department)}</span>
                    {ticket.priority && (
                      <span className='text-xs'>
                        Prioridade <PriorityLabel value={ticket.priority} />
                      </span>
                    )}
                    <time className='text-xs text-muted-foreground tabular-nums' dateTime={ticket.created_at}>
                      {formatDate(ticket.created_at)}
                    </time>
                  </span>
                </Link>
              </td>
              <td className='hidden px-2 text-sm wrap-anywhere lg:table-cell'>{departmentLabel(ticket.department)}</td>
              <td className='hidden px-2 lg:table-cell'>
                <StatusLabel value={ticket.status} />
              </td>
              <td className='hidden px-2 lg:table-cell'>
                <PriorityLabel value={ticket.priority} />
              </td>
              <td className='hidden px-2 text-xs text-muted-foreground tabular-nums lg:table-cell'>
                <time dateTime={ticket.created_at}>{formatDate(ticket.created_at)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <QueuePagination filters={filters} currentPage={meta.current_page} lastPage={meta.last_page} />
    </div>
  )
}

function EmptyQueue({ filters, outOfRange }: { filters: QueueSelection; outOfRange: boolean }) {
  const filtered = Boolean(filters.department || filters.status)
  const title = filtered ? 'Nenhum atendimento com esses filtros' : 'Nenhum atendimento nesta página'
  if (!outOfRange && !filtered) {
    return <StaffNotice title={title}>Os atendimentos disponíveis para você aparecem aqui.</StaffNotice>
  }

  const href = outOfRange ? queueHref({ ...filters, page: '1' }) : '/staff'

  return (
    <StaffNotice
      title={title}
      action={
        <Button asChild variant='outline' className='h-11 px-3'>
          <Link href={href}>{outOfRange ? 'Voltar à primeira página' : 'Limpar filtros'}</Link>
        </Button>
      }
    >
      {outOfRange
        ? 'Esta página não tem mais resultados.'
        : 'Mude o status ou limpe os filtros para ver outros atendimentos.'}
    </StaffNotice>
  )
}

function QueuePagination({
  filters,
  currentPage,
  lastPage
}: {
  filters: QueueSelection
  currentPage: number
  lastPage: number
}) {
  if (lastPage <= 1) return null

  return (
    <nav
      aria-label='Páginas da fila'
      className='flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 lg:px-5'
    >
      <span className='text-sm text-muted-foreground'>
        Página {currentPage} de {lastPage}
      </span>
      <div className='flex gap-2'>
        {currentPage > 1 && (
          <Button asChild variant='outline' className='h-10'>
            <Link href={queueHref({ ...filters, page: String(currentPage - 1) })}>
              <ArrowLeft aria-hidden /> Anterior
            </Link>
          </Button>
        )}
        {currentPage < lastPage && (
          <Button asChild variant='outline' className='h-10'>
            <Link href={queueHref({ ...filters, page: String(currentPage + 1) })}>
              Próxima <ArrowRight aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
