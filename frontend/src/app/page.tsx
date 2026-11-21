import { PortalHeader } from '@/components/layout/portal-header'
import { SupportBanner } from '@/components/tickets/support-banner'
import { TicketForm } from '@/components/tickets/ticket-form'
import { TicketGuide } from '@/components/tickets/ticket-guide'

export default function Home() {
  return (
    <>
      <PortalHeader />
      <main className='mx-auto w-9/10 max-w-284 pt-10 pb-18 max-tablet:pt-5.5 max-tablet:pb-9.5'>
        <SupportBanner />
        <div className='mt-7 grid items-start gap-6 desktop:grid-cols-support max-tablet:mt-4 max-tablet:gap-4'>
          <TicketForm />
          <TicketGuide />
        </div>
      </main>
    </>
  )
}
