import Link from 'next/link'
import { PortalHeader } from '@/components/layout/portal-header'
import { Card } from '@/components/ui/card'
import { StaffLoginForm } from '@/features/staff/staff-forms'

export default function StaffLoginPage() {
  return (
    <>
      <PortalHeader>
        <Link href='/' className='text-sm text-[#e0ecfa] hover:underline'>
          Portal do cliente
        </Link>
      </PortalHeader>
      <main className='mx-auto w-9/10 max-w-md pt-10 pb-16'>
        <Card className='space-y-5'>
          <h1 className='text-2xl font-semibold tracking-tight'>Área do atendente</h1>
          <StaffLoginForm />
        </Card>
      </main>
    </>
  )
}
