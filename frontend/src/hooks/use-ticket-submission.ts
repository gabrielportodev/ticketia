import { useState } from 'react'
import { getTicketError, createTicket } from '@/lib/api/tickets'
import { createTicketSchema } from '@/schemas/ticket'

export function useTicketSubmission() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [protocol, setProtocol] = useState('')

  async function submit(message: string, onSuccess: () => void) {
    if (pending) return

    const validation = createTicketSchema.safeParse({ message })
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Confira a mensagem e tente novamente.')
      return
    }

    setPending(true)
    setError('')

    try {
      setProtocol(await createTicket(validation.data.message))
      onSuccess()
    } catch (submissionError) {
      setError(getTicketError(submissionError))
    } finally {
      setPending(false)
    }
  }

  function clearError() {
    setError('')
  }

  function reset() {
    setProtocol('')
    clearError()
  }

  return { pending, error, protocol, submit, clearError, reset }
}
