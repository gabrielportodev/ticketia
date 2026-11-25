import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import type { NextConfig } from 'next'

const envFile = '../.env'
if (!process.env.TICKETIA_API_URL && existsSync(envFile)) {
  const { TICKETIA_API_URL } = parseEnv(readFileSync(envFile, 'utf8'))
  if (TICKETIA_API_URL) process.env.TICKETIA_API_URL = TICKETIA_API_URL
}

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      }
    }
  }
}

export default nextConfig
