import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { queueFilters, queueHref, type QueueParams } from '@/features/staff/queue-navigation'
import { readStaff } from '@/features/staff/staff-api'
import { StaffNotice } from '@/features/staff/staff-notice'
import { isTicketProtocol, type TicketDetail } from '@/features/staff/ticket-data'
import { StaffTicketDetail } from '@/features/staff/ticket-detail'

export const metadata: Metadata = { title: 'Detalhe do atendimento | TicketIA' }

export default async function TicketDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ protocol: string }>
  searchParams: Promise<QueueParams>
}) {
  const { protocol } = await params
  if (!isTicketProtocol(protocol)) notFound()

  const [query, detail] = await Promise.all([searchParams, readStaff<TicketDetail>(`/tickets/${protocol}`)])
  if (!detail.ok && detail.status === 401) redirect('/staff/login')
  if (!detail.ok && (detail.status === 404 || detail.status === 400)) notFound()

  const filters = queueFilters(query)
  return (
    <div className='space-y-4'>
      <Button asChild variant='ghost' className='h-10 px-3 text-muted-foreground'>
        <Link href={queueHref(filters)}>
          <ArrowLeft aria-hidden /> Voltar à fila
        </Link>
      </Button>
      {detail.ok ? (
        <StaffTicketDetail {...detail.value.data} filters={filters} />
      ) : (
        <StaffNotice title='Não foi possível carregar o atendimento' retry>
          O atendimento está indisponível no momento.
        </StaffNotice>
      )}
    </div>
  )
}
