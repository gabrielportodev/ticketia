import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StaffNotice } from '@/features/staff/staff-notice'

export default function TicketNotFound() {
  return (
    <StaffNotice
      title='Atendimento não encontrado'
      action={
        <Button asChild variant='outline' className='h-10'>
          <Link href='/staff'>
            <ArrowLeft aria-hidden /> Voltar à fila
          </Link>
        </Button>
      }
    >
      Este atendimento está indisponível. Consulte os atendimentos acessíveis na sua fila.
    </StaffNotice>
  )
}
