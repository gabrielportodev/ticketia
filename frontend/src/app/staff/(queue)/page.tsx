import { CircleCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { queueFilters, type QueueParams } from '@/features/staff/queue-navigation'
import { readStaff, readStaffSession } from '@/features/staff/staff-api'
import { StaffNotice } from '@/features/staff/staff-notice'
import type { TicketSummary } from '@/features/staff/ticket-data'
import { QueueFilters, TicketQueue } from '@/features/staff/ticket-queue'

export default async function StaffQueuePage({ searchParams }: { searchParams: Promise<QueueParams> }) {
  const [params, session] = await Promise.all([searchParams, readStaffSession()])
  if (!session.ok) return null

  const { reviewer } = session.value.data
  const filters = queueFilters(params, reviewer)
  const search = new URLSearchParams(filters)
  const queue = await readStaff<TicketSummary[]>(`/tickets?${search}`)
  if (!queue.ok && queue.status === 401) redirect('/staff/login')

  return (
    <section aria-labelledby='queue-title' className='space-y-5'>
      <header>
        <h1 id='queue-title' className='text-3xl leading-tight font-bold tracking-tight'>
          Fila de atendimentos
        </h1>
        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
          {reviewer
            ? 'Consulte solicitações e revise o encaminhamento entre setores.'
            : 'Consulte e encaminhe as solicitações do seu setor.'}
        </p>
      </header>
      {params.updated === '1' && (
        <p
          role='status'
          className='flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground'
        >
          <CircleCheck aria-hidden className='size-4 shrink-0' /> Atendimento encaminhado.
        </p>
      )}
      <Card className='p-0 tablet:p-0'>
        <QueueFilters reviewer={reviewer} filters={filters} />
        {queue.ok && queue.value.meta ? (
          <TicketQueue tickets={queue.value.data} meta={queue.value.meta} filters={filters} />
        ) : (
          <StaffNotice title='Não foi possível carregar a fila' retry>
            A fila está indisponível no momento.
          </StaffNotice>
        )}
      </Card>
    </section>
  )
}
