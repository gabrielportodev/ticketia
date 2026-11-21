'use client'

import { useState, type FormEvent } from 'react'
import { Check, LoaderCircle, MessageSquareText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useTicketSubmission } from '@/hooks/use-ticket-submission'
import { TicketReceipt } from './ticket-receipt'

export function TicketForm() {
  const [message, setMessage] = useState('')
  const { pending, error, protocol, submit, clearError, reset } = useTicketSubmission()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(message, () => setMessage(''))
  }

  function handleMessageChange(value: string) {
    setMessage(value)
    clearError()
  }

  function handleNewTicket() {
    reset()
  }

  if (protocol) {
    return (
      <Card>
        <TicketReceipt protocol={protocol} onNewTicket={handleNewTicket} />
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} aria-busy={pending}>
        <div className='mb-6 flex items-center gap-3'>
          <span className='grid size-10 place-items-center rounded-xl bg-[#eaf2ff] text-primary'>
            <MessageSquareText />
          </span>
          <h2 className='text-[1.4rem] font-bold tracking-[-0.044em]'>Nova solicitação</h2>
        </div>
        <label htmlFor='message' className='text-[0.97rem] font-[650]'>
          Sua mensagem
        </label>
        <Textarea
          className='mt-2.25 block min-h-36.25 resize-y border-[#c4d1e1] bg-[#fcfdff] outline-ring placeholder:text-[#68798b]'
          id='message'
          name='message'
          required
          value={message}
          disabled={pending}
          placeholder='Ex.: Fui cobrado duas vezes pela minha assinatura.'
          onChange={event => handleMessageChange(event.target.value)}
          aria-describedby={error ? 'form-error message-hint' : 'message-hint'}
        />
        <p id='message-hint' className='mt-2 text-[0.83rem] text-muted-foreground'>
          Inclua os detalhes que ajudem a entender o que aconteceu.
        </p>
        {error && (
          <p id='form-error' role='alert' className='mt-3 text-destructive'>
            {error}
          </p>
        )}
        <div className='mt-6.5 flex items-center justify-between gap-3.5 border-t border-[#e2e9f1] pt-5 max-tablet:flex-wrap'>
          <span className='flex items-center gap-1.75 text-[0.83rem] text-muted-foreground'>
            <Check className='size-4' /> Um protocolo por solicitação
          </span>
          <Button className='min-h-10.5 px-4.5 max-tablet:w-full' type='submit' disabled={pending}>
            {pending ? <LoaderCircle className='animate-spin' /> : <Send />}
            {pending ? 'Enviando…' : 'Enviar solicitação'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
