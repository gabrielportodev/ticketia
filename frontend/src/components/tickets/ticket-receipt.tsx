import { useState } from 'react'
import { CheckCheck, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TicketReceiptProps = {
  protocol: string
  onNewTicket: () => void
}

export function TicketReceipt({ protocol, onNewTicket }: TicketReceiptProps) {
  const [copyStatus, setCopyStatus] = useState('')

  async function copyProtocol() {
    try {
      await navigator.clipboard.writeText(protocol)
      setCopyStatus('Protocolo copiado.')
    } catch {
      setCopyStatus('Selecione e copie o protocolo acima.')
    }
  }

  return (
    <section aria-live='polite'>
      <span className='grid size-10 place-items-center rounded-xl bg-[#eaf2ff] text-primary'>
        <CheckCheck />
      </span>
      <h2 className='mt-4 mb-1.5 text-[1.4rem] font-bold tracking-[-0.044em]'>Atendimento recebido</h2>
      <p className='text-muted-foreground'>Guarde o protocolo que identifica sua solicitação.</p>
      <strong className='my-5.5 block rounded-lg bg-muted p-4 font-mono wrap-anywhere'>{protocol}</strong>
      <div className='mb-2.5 flex flex-wrap items-center gap-1.75'>
        <Button className='min-h-10.5 px-4.5' onClick={copyProtocol}>
          <Copy /> Copiar protocolo
        </Button>
        <Button variant='outline' onClick={onNewTicket}>
          Novo atendimento
        </Button>
      </div>
      <p role='status' className='text-muted-foreground'>
        {copyStatus}
      </p>
    </section>
  )
}
