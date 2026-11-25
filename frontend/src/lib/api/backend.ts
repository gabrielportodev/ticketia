export function fetchBackend(path: string, options: RequestInit = {}) {
  const baseUrl = (process.env.TICKETIA_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')

  return fetch(`${baseUrl}${path}`, {
    ...options,
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000)
  })
}
