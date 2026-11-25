import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { readStaff } from '@/features/staff/staff-api'
import { StaffTicketDetail } from '@/features/staff/ticket-detail'
import { isTicketProtocol, type TicketDetail } from '@/features/staff/ticket-data'

export default async function TicketDetailPage({ params }: { params: Promise<{ protocol: string }> }) {
  const { protocol } = await params
  if (!isTicketProtocol(protocol)) notFound()

  const detail = await readStaff<TicketDetail>(`/tickets/${protocol}`)
  if (!detail.ok && detail.status === 401) redirect('/staff/login')
  if (!detail.ok && (detail.status === 404 || detail.status === 400)) notFound()

  return (
    <>
      <Button asChild variant='outline'>
        <Link href='/staff'>Voltar à fila</Link>
      </Button>
      {detail.ok ? (
        <StaffTicketDetail {...detail.value.data} />
      ) : (
        <Card>
          <p role='alert' className='text-sm text-destructive'>
            Não foi possível carregar o atendimento. Recarregue a página para tentar novamente.
          </p>
        </Card>
      )}
    </>
  )
}
