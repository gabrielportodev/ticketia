import { ListTree, MailCheck, MessageSquareText, Ticket } from 'lucide-react'
import { Card } from '@/components/ui/card'

const steps = [
  {
    icon: MessageSquareText,
    title: 'Envie sua mensagem',
    detail: 'Descreva sua dúvida ou o problema que precisa resolver.'
  },
  {
    icon: Ticket,
    title: 'Receba um protocolo',
    detail: 'O número aparece na tela assim que a solicitação é registrada.'
  },
  {
    icon: ListTree,
    title: 'Triagem e encaminhamento',
    detail: 'Sua mensagem passa pela triagem para chegar à equipe responsável.'
  }
]

export function TicketGuide() {
  return (
    <aside aria-labelledby='guide-title'>
      <Card>
        <div className='mb-6 flex items-center gap-3'>
          <MailCheck className='size-5.75 text-secondary-foreground' />
          <h2 id='guide-title' className='text-[1.17rem] font-bold tracking-[-0.044em]'>
            Como funciona
          </h2>
        </div>
        <ol>
          {steps.map(({ icon: Icon, title, detail }) => (
            <li
              key={title}
              className='relative flex items-start gap-3.25 pb-5.75 last:pb-0 not-last:before:absolute not-last:before:inset-y-0 not-last:before:top-8 not-last:before:left-3.75 not-last:before:border-l not-last:before:border-dashed not-last:before:border-[#bbcede]'
            >
              <span className='grid size-8 shrink-0 place-items-center rounded-xl bg-secondary text-[#39658f]'>
                <Icon className='size-4.25' />
              </span>
              <div>
                <h3 className='text-[0.97rem] font-[650]'>{title}</h3>
                <p className='mt-0.75 text-[0.9rem] leading-normal text-muted-foreground'>{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </aside>
  )
}
