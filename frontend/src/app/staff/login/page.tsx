import { ArrowLeft, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortalHeader } from '@/components/layout/portal-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StaffLoginForm } from '@/features/staff/staff-forms'

export const metadata: Metadata = { title: 'Entrar | TicketIA' }

export default function StaffLoginPage() {
  return (
    <>
      <PortalHeader>
        <Button asChild variant='ghost' className='h-11 px-2 text-muted-foreground'>
          <Link href='/'>
            <ArrowLeft aria-hidden /> Portal do cliente
          </Link>
        </Button>
      </PortalHeader>
      <main id='main-content' tabIndex={-1} className='mx-auto w-9/10 max-w-md py-10 tablet:py-18'>
        <Card className='p-0 tablet:p-0'>
          <header className='rounded-t-[inherit] bg-ink p-5 text-white tablet:p-7'>
            <h1 className='flex items-center gap-2.5 text-2xl font-semibold tracking-tight'>
              <LockKeyhole aria-hidden className='size-5 shrink-0 text-on-ink' /> Área do atendente
            </h1>
            <p className='mt-2 text-sm leading-relaxed text-on-ink'>
              Entre com as credenciais fornecidas pela sua equipe.
            </p>
          </header>
          <div className='p-5 tablet:p-7'>
            <StaffLoginForm />
          </div>
        </Card>
      </main>
    </>
  )
}
