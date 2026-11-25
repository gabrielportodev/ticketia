export async function POST(request: Request) {
  const apiUrl = (process.env.TICKETIA_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')

  try {
    const response = await fetch(`${apiUrl}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': request.headers.get('Content-Type') ?? 'application/json' },
      body: await request.text(),
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000)
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
