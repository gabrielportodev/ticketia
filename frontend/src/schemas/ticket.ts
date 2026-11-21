import { z } from 'zod'

export const createTicketSchema = z.object({
  message: z.string().trim().min(1, 'Escreva sua mensagem antes de enviar.')
})
