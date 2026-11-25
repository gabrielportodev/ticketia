import Link from 'next/link'
import { PortalHeader } from '@/components/layout/portal-header'
import { SupportBanner } from '@/components/tickets/support-banner'
import { TicketForm } from '@/components/tickets/ticket-form'
import { TicketGuide } from '@/components/tickets/ticket-guide'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <>
      <PortalHeader />
      <main className='mx-auto w-9/10 max-w-284 pt-10 pb-6 max-tablet:pt-5.5'>
        <SupportBanner />
        <div className='mt-7 grid items-start gap-6 desktop:grid-cols-support max-tablet:mt-4 max-tablet:gap-4'>
          <TicketForm />
          <TicketGuide />
        </div>
      </main>
      <footer className='mx-auto flex w-9/10 max-w-284 justify-end pb-8'>
        <Button asChild variant='link' size='sm' className='px-0 text-muted-foreground hover:text-foreground'>
          <Link href='/staff/login'>Área do atendente</Link>
        </Button>
      </footer>
    </>
  )
}
