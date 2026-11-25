import { ArrowRight, Clock3, MessageSquareText, Route, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { QueueSelection } from './queue-navigation'
import { TicketRoutingForm } from './staff-forms'
import { departmentLabel, formatDate, type TicketDetail } from './ticket-data'
import { PriorityLabel, StatusLabel } from './ticket-labels'

const reviewReasons = {
  INVALID_RESPONSE: 'A resposta da IA era inválida.',
  MODEL_REQUESTED_REVIEW: 'A classificação solicitou revisão.'
}

export function StaffTicketDetail({
  ticket,
  original_message: originalMessage,
  classification,
  history,
  filters
}: TicketDetail & { filters: QueueSelection }) {
  return (
    <section aria-labelledby='ticket-title' className='space-y-5'>
      <header className='space-y-3'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <h1
            id='ticket-title'
            className='text-2xl leading-tight font-bold tracking-tight wrap-anywhere tablet:text-3xl'
          >
            {ticket.subject ?? 'Detalhe do atendimento'}
          </h1>
          <StatusLabel value={ticket.status} />
        </div>
        <p className='text-sm text-muted-foreground'>
          Protocolo <span className='font-mono wrap-anywhere'>{ticket.protocol}</span>
        </p>
        <dl className='flex flex-wrap gap-x-7 gap-y-2 text-sm'>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <dt className='text-muted-foreground'>Setor atual</dt>
            <dd className='font-semibold'>{departmentLabel(ticket.department)}</dd>
          </div>
          <div className='flex flex-wrap items-baseline gap-x-2'>
            <dt className='text-muted-foreground'>Recebido em</dt>
            <dd className='font-semibold tabular-nums'>
              <time dateTime={ticket.created_at}>{formatDate(ticket.created_at)}</time>
            </dd>
          </div>
        </dl>
      </header>

      <Card className='p-0 tablet:p-0'>
        <div className='grid rounded-[inherit] desktop:grid-cols-[minmax(0,1.3fr)_minmax(17rem,1fr)]'>
          <section aria-labelledby='message-title' className='min-w-0 p-5 tablet:p-7'>
            <h2 id='message-title' className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
              <MessageSquareText aria-hidden className='size-5 shrink-0 text-muted-foreground' /> Mensagem original
            </h2>
            <p className='mt-4 max-w-[70ch] leading-relaxed wrap-anywhere whitespace-pre-wrap'>{originalMessage}</p>
          </section>
          <div className='min-w-0 divide-y divide-border rounded-b-[inherit] border-t border-border bg-background desktop:rounded-tr-[inherit] desktop:rounded-bl-none desktop:border-t-0 desktop:border-l'>
            <Classification classification={classification} />
            <section aria-labelledby='routing-title' className='space-y-4 p-5 tablet:p-7'>
              <div>
                <h2 id='routing-title' className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
                  <Route aria-hidden className='size-5 shrink-0 text-muted-foreground' /> Encaminhamento manual
                </h2>
                <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                  A mudança de setor fica registrada no histórico.
                </p>
              </div>
              <TicketRoutingForm ticket={ticket} filters={filters} />
            </section>
          </div>
        </div>
      </Card>
      <RoutingHistory history={history} />
    </section>
  )
}

function Classification({ classification }: Pick<TicketDetail, 'classification'>) {
  return (
    <section aria-labelledby='classification-title' className='p-5 tablet:p-7'>
      <h2 id='classification-title' className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
        <Sparkles aria-hidden className='size-5 shrink-0 text-muted-foreground' /> Classificação da IA
      </h2>
      {classification ? (
        <dl className='mt-4 grid grid-cols-2 gap-4 text-sm'>
          <div>
            <dt className='text-xs text-muted-foreground'>Setor sugerido</dt>
            <dd className='mt-1 font-semibold'>{departmentLabel(classification.category)}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Prioridade</dt>
            <dd className='mt-1'>
              <PriorityLabel value={classification.priority} />
            </dd>
          </div>
          <div className='col-span-full'>
            <dt className='text-xs text-muted-foreground'>Assunto sugerido</dt>
            <dd className='mt-1 font-semibold wrap-anywhere'>{classification.subject ?? 'Sem assunto'}</dd>
          </div>
          {classification.review_reason && (
            <div className='col-span-full rounded-lg bg-amber-50 p-3 text-amber-900'>
              <dt className='font-semibold'>Motivo da revisão</dt>
              <dd className='mt-1'>{reviewReasons[classification.review_reason]}</dd>
            </div>
          )}
        </dl>
      ) : (
        <p className='mt-3 text-sm text-muted-foreground'>Nenhuma classificação registrada.</p>
      )}
    </section>
  )
}

function RoutingHistory({ history }: Pick<TicketDetail, 'history'>) {
  return (
    <section aria-labelledby='history-title' className='px-1 py-3'>
      <h2 id='history-title' className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
        <Clock3 aria-hidden className='size-5 shrink-0 text-muted-foreground' /> Histórico de encaminhamento
      </h2>
      {history.length === 0 ? (
        <p className='mt-3 text-sm text-muted-foreground'>Nenhum encaminhamento manual registrado.</p>
      ) : (
        <ol className='mt-4 space-y-4'>
          {history.map((change, index) => (
            <li
              key={index}
              className='relative flex gap-3 not-last:before:absolute not-last:before:top-8 not-last:before:-bottom-4 not-last:before:left-4 not-last:before:border-l not-last:before:border-border'
            >
              <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground'>
                <Route aria-hidden className='size-4' />
              </span>
              <div className='min-w-0 pt-0.5 text-sm'>
                <p className='flex flex-wrap items-center gap-x-2 font-semibold'>
                  {departmentLabel(change.previous_department)} <ArrowRight aria-hidden className='size-3' />
                  <span className='sr-only'>para</span> {departmentLabel(change.new_department)}
                </p>
                <p className='mt-1 wrap-anywhere text-muted-foreground tabular-nums'>
                  {change.changed_by} · <time dateTime={change.changed_at}>{formatDate(change.changed_at)}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
