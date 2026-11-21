import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the public support page renders a labeled message form in Brazilian Portuguese', async () => {
  const page = await readFile(new URL('../.next/server/app/index.html', import.meta.url), 'utf8')

  assert.match(page, /<html\b[^>]*\blang="pt-BR"/)
  assert.match(page, /<h1\b[^>]*>Central de atendimento<\/h1>/)
  assert.match(page, /<label\b[^>]*for="message"/)
  assert.match(page, /<textarea\b[^>]*name="message"/)
  assert.match(page, /Enviar solicitação/)
})
