'use server'

import { redirect } from 'next/navigation'
import { queueHref, type QueueSelection } from './queue-navigation'
import { clearStaffSession, mutateStaff, saveStaffSession } from './staff-api'
import { isTicketProtocol } from './ticket-data'

const unavailable = 'Não foi possível conectar à API de atendimento. Tente novamente.'

export async function signIn(_previous: string | null, formData: FormData) {
  const username = formData.get('username')
  const password = formData.get('password')
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return 'Informe o usuário e a senha.'
  }

  try {
    const response = await mutateStaff('/login', {
      method: 'POST',
      body: new URLSearchParams({ username, password })
    })
    if (response.status === 401) return 'Usuário ou senha inválidos.'
    if (!response.ok || !(await saveStaffSession(response))) return unavailable
  } catch {
    return unavailable
  }

  redirect('/staff')
}

export async function signOut() {
  try {
    const response = await mutateStaff('/logout', { method: 'POST' })
    if (!response.ok && response.status !== 401) return 'Não foi possível sair. Tente novamente.'
    await clearStaffSession()
  } catch {
    return unavailable
  }

  redirect('/staff/login')
}

export async function routeTicket(
  protocol: string,
  filters: QueueSelection,
  _previous: string | null,
  formData: FormData
) {
  if (!isTicketProtocol(protocol)) return 'Atendimento não encontrado.'

  let response: Response
  try {
    response = await mutateStaff(`/tickets/${protocol}/routing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: formData.get('department') })
    })
  } catch {
    return unavailable
  }

  if (response.status === 401 || response.status === 403) redirect('/staff/login')
  if (response.status === 404) return 'Este atendimento não está mais disponível para você.'
  if (response.status === 400) return 'Informe um setor de destino válido.'
  if (!response.ok) return 'Não foi possível encaminhar o atendimento. Tente novamente.'

  redirect(queueHref(filters, { updated: true }))
}
