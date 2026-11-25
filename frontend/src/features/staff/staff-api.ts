import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { fetchBackend } from '@/lib/api/backend'
import type { ApiResponse } from '@/types/api'
import type { QueueMeta, Session } from './ticket-data'

const sessionCookie = 'ticketia_staff_session'
const sessionPattern = /^[A-Za-z0-9._-]+$/

type StaffResponse<T> = ApiResponse<T> & { meta?: QueueMeta }
type StaffResult<T> = { ok: true; value: StaffResponse<T> } | { ok: false; status: number }

export async function readStaff<T>(path: string): Promise<StaffResult<T>> {
  const session = await requestSession()
  if (!session) return { ok: false, status: 401 }

  try {
    const response = await staffRequest(path, session)
    if (response.ok) {
      return { ok: true, value: (await response.json()) as StaffResponse<T> }
    }
    return { ok: false, status: response.status }
  } catch {
    return { ok: false, status: 502 }
  }
}

export const readStaffSession = cache(() => readStaff<Session>('/session'))

export async function mutateStaff(path: string, options: RequestInit) {
  const session = await requestSession()
  const csrfResponse = await staffRequest('/csrf', session)
  if (!csrfResponse.ok) return csrfResponse

  const { data } = (await csrfResponse.json()) as StaffResponse<{ header: string; token: string }>
  const requestHeaders = new Headers(options.headers)
  requestHeaders.set(data.header, data.token)

  return staffRequest(path, responseSession(csrfResponse) ?? session, {
    ...options,
    headers: requestHeaders
  })
}

export async function saveStaffSession(response: Response) {
  const session = responseSession(response)
  if (!session) return false

  const protocol = (await headers()).get('x-forwarded-proto')
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: protocol === 'https',
    path: '/staff'
  })
  return true
}

export async function clearStaffSession() {
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie, '', { path: '/staff', maxAge: 0 })
}

async function requestSession() {
  const value = (await cookies()).get(sessionCookie)?.value
  return value && sessionPattern.test(value) ? value : undefined
}

function responseSession(response: Response) {
  for (const cookie of response.headers.getSetCookie()) {
    const value = /^JSESSIONID=([^;]+)(?:;|$)/.exec(cookie)?.[1]
    if (value && sessionPattern.test(value)) return value
  }
}

function staffRequest(path: string, session?: string, options: RequestInit = {}) {
  const requestHeaders = new Headers(options.headers)
  if (session) requestHeaders.set('Cookie', `JSESSIONID=${session}`)

  return fetchBackend(`/staff${path}`, { ...options, headers: requestHeaders, cache: 'no-store' })
}
