import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TicketNotFound() {
  return (
    <Card className='space-y-3'>
      <h1 className='text-xl font-semibold'>Atendimento não encontrado</h1>
      <Button asChild variant='outline'>
        <Link href='/staff'>Voltar à fila</Link>
      </Button>
    </Card>
  )
}
