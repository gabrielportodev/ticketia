import { Headphones, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'

export function PortalHeader({ children }: { children?: ReactNode }) {
  return (
    <header className='bg-[#102e50] text-white'>
      <div className='mx-auto flex h-19 w-9/10 max-w-284 items-center justify-between max-tablet:h-15.5'>
        <span className='flex items-center gap-2.75 text-[1.55rem] font-[750] tracking-[-0.06em]'>
          <span className='grid size-9.25 place-items-center rounded-xl bg-[#b9e0ff] text-[#153d70]'>
            <Ticket className='-rotate-23' />
          </span>
          TicketIA
        </span>
        {children ?? (
          <span className='flex items-center gap-2 text-[0.9rem] text-[#e0ecfa]'>
            <Headphones className='size-4.25' /> Portal do cliente
          </span>
        )}
      </div>
    </header>
  )
}
