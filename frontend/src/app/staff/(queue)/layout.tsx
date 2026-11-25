import { ArrowUpRight, Inbox, UserRound } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { BrandLink, SkipToContent } from '@/components/layout/portal-header'
import { Button } from '@/components/ui/button'
import { readStaffSession } from '@/features/staff/staff-api'
import { StaffLogoutForm } from '@/features/staff/staff-forms'
import { StaffNotice } from '@/features/staff/staff-notice'
import { departmentLabel } from '@/features/staff/ticket-data'

export default async function QueueLayout({ children }: { children: ReactNode }) {
  const session = await readStaffSession()
  if (!session.ok && session.status === 401) redirect('/staff/login')
  const account = session.ok ? session.value.data : null

  return (
    <div className='min-h-screen lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <SkipToContent />
      <aside className='bg-ink text-white lg:sticky lg:top-0 lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto]'>
        <div className='mx-auto flex w-9/10 flex-wrap items-center justify-between gap-x-4 py-2 lg:w-full lg:flex-col lg:items-start lg:border-b lg:border-white/15 lg:px-5 lg:py-5'>
          <BrandLink href='/staff' className='focus-visible:outline-white' />
          <p className='text-sm text-on-ink lg:mt-1'>Área do atendente</p>
        </div>
        <nav
          aria-label='Área do atendente'
          className='mx-auto flex w-9/10 flex-wrap gap-2 pb-2 lg:w-full lg:content-start lg:px-4 lg:py-4'
        >
          <Button
            asChild
            className='h-11 justify-start gap-2 bg-white/12 px-3 text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/70 lg:w-full'
            variant='ghost'
          >
            <Link href='/staff'>
              <Inbox aria-hidden />
              <span className='lg:hidden'>Fila</span>
              <span className='hidden lg:inline'>Fila de atendimentos</span>
            </Link>
          </Button>
          <Button
            asChild
            className='h-11 justify-start gap-2 px-3 text-on-ink hover:bg-white/12 hover:text-white focus-visible:ring-white/70 lg:w-full'
            variant='ghost'
          >
            <Link href='/'>
              Portal do cliente <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </nav>
        {account && (
          <div className='border-t border-border bg-card text-foreground lg:border-white/15 lg:bg-ink lg:text-white'>
            <div className='mx-auto flex w-9/10 flex-wrap items-center justify-between gap-x-3 py-2 lg:w-full lg:items-start lg:gap-y-2 lg:px-4 lg:py-4'>
              <div className='flex min-w-0 flex-1 items-center gap-2.5 lg:basis-full'>
                <span className='grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground lg:bg-white/12 lg:text-on-ink'>
                  <UserRound aria-hidden className='size-4' />
                </span>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold wrap-anywhere'>{account.username}</p>
                  <p className='text-sm text-muted-foreground lg:text-on-ink'>
                    {account.reviewer ? 'Equipe de revisão' : departmentLabel(account.department)}
                  </p>
                </div>
              </div>
              <StaffLogoutForm />
            </div>
          </div>
        )}
      </aside>
      <main id='main-content' tabIndex={-1} className='mx-auto w-9/10 max-w-300 min-w-0 py-5 tablet:py-8 lg:py-10'>
        {account ? (
          children
        ) : (
          <StaffNotice title='Fila indisponível' retry>
            Não foi possível consultar a sessão.
          </StaffNotice>
        )}
      </main>
    </div>
  )
}
