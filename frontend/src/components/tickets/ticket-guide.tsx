import { GitBranch, MessageSquareText, Ticket } from 'lucide-react'

const steps = [
  {
    icon: MessageSquareText,
    title: 'Descreva o problema',
    detail: 'Inclua a data e o que você já tentou fazer, se souber.'
  },
  {
    icon: Ticket,
    title: 'Guarde o protocolo',
    detail: 'Ele aparece na tela assim que a solicitação é registrada.'
  },
  {
    icon: GitBranch,
    title: 'Aguarde a triagem',
    detail: 'Sua mensagem segue para a equipe responsável pelo assunto.'
  }
]

export function TicketGuide() {
  return (
    <aside
      id='ticket-guide'
      tabIndex={-1}
      aria-labelledby='guide-title'
      className='border-t border-border pt-5 desktop:border-t-0 desktop:pt-3'
    >
      <h2 id='guide-title' className='text-lg font-semibold tracking-tight'>
        Como funciona
      </h2>
      <ol className='mt-4'>
        {steps.map(({ icon: Icon, title, detail }) => (
          <li
            key={title}
            className='relative flex gap-3 pb-5 last:pb-0 not-last:before:absolute not-last:before:inset-y-0 not-last:before:top-8 not-last:before:left-4 not-last:before:border-l not-last:before:border-border'
          >
            <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground'>
              <Icon aria-hidden className='size-4' />
            </span>
            <div>
              <h3 className='text-sm font-semibold'>{title}</h3>
              <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
