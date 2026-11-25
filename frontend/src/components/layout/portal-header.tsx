import { Ticket } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PortalHeader({ children }: { children?: ReactNode }) {
  return (
    <header className='border-b border-border bg-card'>
      <SkipToContent />
      <div className='mx-auto flex min-h-16 w-9/10 max-w-264 items-center justify-between gap-4'>
        <BrandLink />
        {children}
      </div>
    </header>
  )
}

export function BrandLink({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-11 w-fit shrink-0 items-center gap-2.5 rounded-lg text-xl font-bold tracking-tight',
        className
      )}
    >
      <span className='grid size-8 place-items-center rounded-lg bg-primary text-white'>
        <Ticket aria-hidden className='size-5 -rotate-15' />
      </span>
      TicketIA
    </Link>
  )
}

export function SkipToContent() {
  return (
    <a
      href='#main-content'
      className='sr-only focus:not-sr-only focus:absolute focus:z-20 focus:m-2 focus:rounded-lg focus:bg-card focus:p-3'
    >
      Ir para o conteúdo
    </a>
  )
}
