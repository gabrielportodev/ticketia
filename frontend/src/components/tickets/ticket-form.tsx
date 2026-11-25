'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LoaderCircle, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { Textarea } from '@/components/ui/textarea'
import { useTicketSubmission } from '@/hooks/use-ticket-submission'
import { TicketReceipt } from './ticket-receipt'

export function TicketForm() {
  const [message, setMessage] = useState('')
  const { pending, error, protocol, submit, clearError, reset } = useTicketSubmission()
  const receiptTitle = useRef<HTMLHeadingElement>(null)
  const messageInput = useRef<HTMLTextAreaElement>(null)
  const focusMessage = useRef(false)

  useEffect(() => {
    if (protocol) receiptTitle.current?.focus()
    else if (focusMessage.current) {
      messageInput.current?.focus()
      focusMessage.current = false
    }
  }, [protocol])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(message)
  }

  function handleNewTicket() {
    focusMessage.current = true
    setMessage('')
    reset()
  }

  return (
    <Card id='new-ticket' tabIndex={-1} className='focus-visible:outline-2 focus-visible:outline-ring'>
      {protocol ? (
        <TicketReceipt protocol={protocol} titleRef={receiptTitle} onNewTicket={handleNewTicket} />
      ) : (
        <form onSubmit={handleSubmit} aria-busy={pending}>
          <h2 className='mb-4 text-xl font-semibold tracking-tight'>Nova solicitação</h2>
          <label htmlFor='message' className='text-sm font-semibold'>
            Sua mensagem
          </label>
          <Textarea
            ref={messageInput}
            className='mt-2 block min-h-32 resize-y outline-ring placeholder:text-muted-foreground tablet:min-h-40'
            id='message'
            name='message'
            required
            value={message}
            disabled={pending}
            placeholder='Ex.: Fui cobrado duas vezes pela minha assinatura.'
            onChange={event => {
              setMessage(event.target.value)
              clearError()
            }}
            aria-invalid={error && !message.trim() ? true : undefined}
            aria-describedby={error ? 'message-hint form-error' : 'message-hint'}
          />
          <p id='message-hint' className='mt-3 flex items-start gap-2 text-sm text-muted-foreground'>
            <ShieldCheck aria-hidden className='mt-0.5 size-4 shrink-0' /> Evite incluir senhas ou dados de cartão.
          </p>
          <FormError id='form-error' message={error} className='mt-3' />
          <div className='mt-4 flex border-t border-border pt-4 tablet:justify-end'>
            <Button className='h-11 px-4 max-tablet:w-full' type='submit' disabled={pending}>
              {pending ? <LoaderCircle aria-hidden className='motion-safe:animate-spin' /> : <Send aria-hidden />}
              {pending ? 'Enviando…' : 'Enviar solicitação'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
