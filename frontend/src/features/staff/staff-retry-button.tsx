'use client'

import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function StaffRetryButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type='button'
      variant='outline'
      className='h-10'
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw aria-hidden className={pending ? 'motion-safe:animate-spin' : undefined} />
      {pending ? 'Atualizando…' : 'Tentar novamente'}
    </Button>
  )
}
