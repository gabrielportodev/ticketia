import { fetchBackend } from '@/lib/api/backend'

export async function POST(request: Request) {
  try {
    const response = await fetchBackend('/tickets', {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('Content-Type') ?? 'application/json' },
      body: await request.text()
    })

    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' }
    })
  } catch {
    return Response.json(
      { success: false, message: 'Não foi possível conectar à API de atendimento.' },
      { status: 502 }
    )
  }
}
