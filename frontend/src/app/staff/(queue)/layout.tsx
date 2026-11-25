import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { PortalHeader } from '@/components/layout/portal-header'
import { Card } from '@/components/ui/card'
import { readStaffSession } from '@/features/staff/staff-api'
import { StaffLogoutForm } from '@/features/staff/staff-forms'
import { departmentLabel } from '@/features/staff/ticket-data'

export default async function QueueLayout({ children }: { children: ReactNode }) {
  const session = await readStaffSession()
  if (!session.ok && session.status === 401) redirect('/staff/login')

  return (
    <>
      <PortalHeader>
        <div className='flex items-center gap-3 text-sm'>
          <Link href='/staff' className='hidden text-[#e0ecfa] hover:underline tablet:inline'>
            Área do atendente
          </Link>
          {session.ok && <StaffLogoutForm />}
        </div>
      </PortalHeader>
      <main className='mx-auto w-9/10 max-w-284 space-y-6 pt-8 pb-16'>
        {session.ok ? (
          <>
            <p className='text-sm text-muted-foreground'>
              <span className='font-medium text-foreground'>{session.value.data.username}</span>
              {' · '}
              {session.value.data.reviewer ? 'Equipe de revisão' : departmentLabel(session.value.data.department)}
            </p>
            {children}
          </>
        ) : (
          <Card>
            <h1 className='text-xl font-semibold'>Fila indisponível</h1>
            <p role='alert' className='mt-2 text-sm text-muted-foreground'>
              Não foi possível consultar a sessão. Recarregue a página para tentar novamente.
            </p>
          </Card>
        )}
      </main>
    </>
  )
}
