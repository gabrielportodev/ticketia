import { ArrowDown, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { PortalHeader } from '@/components/layout/portal-header'
import { TicketForm } from '@/components/tickets/ticket-form'
import { TicketGuide } from '@/components/tickets/ticket-guide'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col'>
      <PortalHeader>
        <nav aria-label='Portal do cliente'>
          <Button asChild variant='ghost' className='h-11 px-2 text-muted-foreground'>
            <a href='#ticket-guide'>
              Como funciona <ArrowDown aria-hidden />
            </a>
          </Button>
        </nav>
      </PortalHeader>
      <main id='main-content' tabIndex={-1} className='mx-auto w-9/10 max-w-264 flex-1 py-7 tablet:py-10 lg:py-14'>
        <header className='mb-6 tablet:mb-8'>
          <h1 className='text-3xl leading-tight font-bold tracking-tight text-balance tablet:text-4xl'>
            Central de atendimento
          </h1>
          <p className='mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground tablet:text-base'>
            Conte o que aconteceu. Vamos encaminhar sua solicitação à equipe responsável.
          </p>
        </header>
        <div className='grid items-start gap-8 desktop:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] lg:gap-12'>
          <TicketForm />
          <TicketGuide />
        </div>
      </main>
      <footer className='border-t border-border bg-card'>
        <div className='mx-auto flex w-9/10 max-w-264 flex-wrap items-center justify-between gap-x-4 py-2 text-sm text-muted-foreground'>
          <span>TicketIA · Portal do cliente</span>
          <Button asChild variant='ghost' size='sm' className='h-11 px-2 text-muted-foreground'>
            <Link href='/staff/login'>
              <LockKeyhole aria-hidden /> Área do atendente
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}
