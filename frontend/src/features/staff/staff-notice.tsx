import { CircleAlert, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { StaffRetryButton } from './staff-retry-button'

export function StaffNotice({
  title,
  children,
  action,
  retry = false
}: {
  title: string
  children: ReactNode
  action?: ReactNode
  retry?: boolean
}) {
  const Icon = retry ? CircleAlert : Inbox
  const noticeAction = retry ? <StaffRetryButton /> : action

  return (
    <section role={retry ? 'alert' : undefined} className='grid justify-items-center gap-2 px-5 py-10 text-center'>
      <span className='grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground'>
        <Icon aria-hidden className='size-5' />
      </span>
      <h2 className='text-lg font-bold tracking-tight'>{title}</h2>
      <p className='max-w-96 text-sm leading-relaxed text-muted-foreground'>{children}</p>
      {noticeAction && <div className='mt-1'>{noticeAction}</div>}
    </section>
  )
}
