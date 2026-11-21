import { Send, Ticket } from 'lucide-react'

export function SupportBanner() {
  return (
    <section className='relative isolate flex min-h-56 items-center overflow-hidden rounded-banner bg-linear-[110deg,#e6f2ff_6%,#dfedff_60%,#c5e2ff] px-[4.5%] py-9.5 max-tablet:min-h-auto max-tablet:px-5.5 max-tablet:py-6.5'>
      <div className='tablet:max-desktop:max-w-[72%]'>
        <h1 className='text-[clamp(2.4rem,4.2vw,3.65rem)] leading-[1.04] font-[720] tracking-[-0.067em]'>
          Central de atendimento
        </h1>
        <p className='mt-4 max-w-127.5 text-[1.05rem] leading-[1.6] text-[#385779] max-tablet:text-base'>
          Conte o que aconteceu. Vamos encaminhar sua mensagem para a equipe responsável.
        </p>
      </div>
      <TicketIllustration />
    </section>
  )
}

function TicketIllustration() {
  return (
    <div
      aria-hidden='true'
      className='absolute inset-y-0 right-0 -z-10 w-[33%] bg-ticket-dots bg-size-[--spacing(3.25)_--spacing(3.25)] mask-l-from-82% max-desktop:w-[28%] max-desktop:opacity-65 max-tablet:hidden'
    >
      <div className='absolute top-[23%] left-[7%] h-34 w-62.5 -rotate-25 rounded-full border-2 border-dashed border-[#81a9d8]' />
      <div className='absolute top-[28%] left-[22%] h-24 w-37.5 -rotate-13 rounded-xl bg-[#fafcff] px-4 py-3.25 text-[#3371b9] shadow-ticket-stack after:absolute after:inset-y-0 after:right-7 after:border-l-2 after:border-dashed after:border-[#b0cbed]'>
        <Ticket className='size-7.5' />
        <div className='mt-2 h-1.25 w-16.25 rounded-full bg-[#a7c7ec]' />
        <div className='mt-2 h-1.25 w-10.75 rounded-full bg-[#a7c7ec]' />
      </div>
      <span className='absolute top-[49%] left-[59%] grid size-12.5 rotate-8 place-items-center rounded-full border-4 border-[#d6eaff] bg-[#285ba0] text-white'>
        <Send />
      </span>
    </div>
  )
}
