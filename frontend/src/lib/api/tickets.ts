import axios from 'axios'
import type { ApiResponse } from '@/types/api'
import type { CreateTicketResponse } from '@/types/ticket'

const ticketErrorMessages = {
  invalidRequest: 'Confira a mensagem e tente novamente.',
  default: 'Não foi possível confirmar o envio. Sua mensagem continua aqui.'
}

export async function createTicket(message: string): Promise<string> {
  const { data, status } = await axios.post<ApiResponse<CreateTicketResponse>>('/api/tickets', { message })

  const protocol = data?.data?.protocol

  if (status !== 201 || data?.success !== true || typeof protocol !== 'string' || !protocol.trim()) {
    throw new Error('Unconfirmed ticket')
  }

  return protocol
}

export function getTicketError(error: unknown): string {
  if (!axios.isAxiosError<{ message?: unknown }>(error)) {
    return ticketErrorMessages.default
  }

  if (error.response?.status !== 400) {
    return ticketErrorMessages.default
  }

  const responseMessage = error.response.data?.message
  return typeof responseMessage === 'string' && responseMessage.trim()
    ? responseMessage
    : ticketErrorMessages.invalidRequest
}
