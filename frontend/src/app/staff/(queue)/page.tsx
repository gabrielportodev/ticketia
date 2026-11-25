import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { readStaff, readStaffSession } from '@/features/staff/staff-api'
import { departments, statuses, type TicketSummary } from '@/features/staff/ticket-data'
import { QueueFilters, TicketQueue } from '@/features/staff/ticket-queue'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function StaffQueuePage({ searchParams }: { searchParams: SearchParams }) {
  const [params, session] = await Promise.all([searchParams, readStaffSession()])
  if (!session.ok) return null

  const department = session.value.data.reviewer ? filterValue(params.department, departments) : ''
  const status = filterValue(params.status, statuses)
  const page = typeof params.page === 'string' && /^[1-9]\d{0,7}$/.test(params.page) ? params.page : '1'
  const search = new URLSearchParams({ department, status, page })
  const queue = await readStaff<TicketSummary[]>(`/tickets?${search}`)
  if (!queue.ok && queue.status === 401) redirect('/staff/login')

  return (
    <section className='space-y-4'>
      <h1 className='text-3xl font-semibold tracking-tight'>Fila de atendimentos</h1>
      {params.updated === '1' && (
        <p role='status' className='rounded-lg border border-border bg-secondary p-3 text-sm'>
          Atendimento encaminhado.
        </p>
      )}
      <QueueFilters session={session.value.data} department={department} status={status} />
      {queue.ok && queue.value.meta ? (
        <TicketQueue tickets={queue.value.data} meta={queue.value.meta} filters={{ department, status }} />
      ) : (
        <Card>
          <p role='alert' className='text-sm text-destructive'>
            Não foi possível carregar a fila. Recarregue a página para tentar novamente.
          </p>
        </Card>
      )}
    </section>
  )
}

function filterValue(value: string | string[] | undefined, options: Record<string, string>) {
  return typeof value === 'string' && Object.hasOwn(options, value) ? value : ''
}
