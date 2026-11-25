import { useState, type Ref } from 'react'
import { Check, CircleCheck, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TicketReceiptProps = {
  protocol: string
  titleRef: Ref<HTMLHeadingElement>
  onNewTicket: () => void
}

export function TicketReceipt({ protocol, titleRef, onNewTicket }: TicketReceiptProps) {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null)

  async function copyProtocol() {
    try {
      await navigator.clipboard.writeText(protocol)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <section>
      <h2 ref={titleRef} tabIndex={-1} className='flex items-center gap-2.5 text-xl font-semibold tracking-tight'>
        <CircleCheck aria-hidden className='size-5 shrink-0 text-primary' /> Atendimento recebido
      </h2>
      <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
        Sua solicitação foi registrada e segue para triagem.
      </p>
      <div className='my-4 rounded-lg bg-secondary p-4'>
        <p className='text-xs font-semibold text-muted-foreground'>Protocolo do atendimento</p>
        <strong className='mt-1 block font-mono text-sm wrap-anywhere text-secondary-foreground'>{protocol}</strong>
      </div>
      <div className='flex flex-wrap gap-2'>
        <Button className='h-11 px-4' onClick={copyProtocol}>
          {copyStatus === 'copied' ? <Check aria-hidden /> : <Copy aria-hidden />} Copiar protocolo
        </Button>
        <Button className='h-11 px-4' variant='outline' onClick={onNewTicket}>
          <Plus aria-hidden /> Novo atendimento
        </Button>
      </div>
      <p role='status' className='text-sm text-muted-foreground not-empty:mt-3'>
        {copyStatus === 'copied' && 'Protocolo copiado.'}
        {copyStatus === 'failed' && 'Selecione e copie o protocolo acima.'}
      </p>
    </section>
  )
}
