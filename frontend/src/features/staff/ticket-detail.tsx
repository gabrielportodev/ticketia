import { Card } from '@/components/ui/card'
import { TicketRoutingForm } from './staff-forms'
import { departmentLabel, formatDate, priorityLabel, statusLabel, type TicketDetail } from './ticket-data'

const reviewReasons = {
  INVALID_RESPONSE: 'A resposta da IA era inválida.',
  MODEL_REQUESTED_REVIEW: 'A classificação solicitou revisão.'
}

export function StaffTicketDetail({ ticket, original_message, classification, history }: TicketDetail) {
  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-3xl font-semibold tracking-tight break-words'>
          {ticket.subject ?? 'Detalhe do atendimento'}
        </h1>
        <p className='mt-1 text-sm break-all text-muted-foreground'>{ticket.protocol}</p>
        <p className='mt-2 text-sm'>
          {statusLabel(ticket.status)} · {departmentLabel(ticket.department)} · {formatDate(ticket.created_at)}
        </p>
      </div>

      <div className='grid gap-4 desktop:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'>
        <div className='space-y-4'>
          <Card>
            <h2 className='text-lg font-semibold'>Mensagem original</h2>
            <p className='mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap'>{original_message}</p>
          </Card>
          <Card>
            <h2 className='text-lg font-semibold'>Histórico de encaminhamento</h2>
            {history.length === 0 ? (
              <p className='mt-3 text-sm text-muted-foreground'>Nenhum encaminhamento manual registrado.</p>
            ) : (
              <ol className='mt-2 divide-y divide-border'>
                {history.map((change, index) => (
                  <li key={index} className='py-3 text-sm'>
                    <p className='font-medium'>
                      {departmentLabel(change.previous_department)} → {departmentLabel(change.new_department)}
                    </p>
                    <p className='mt-1 break-words text-muted-foreground'>
                      {change.changed_by} · <time dateTime={change.changed_at}>{formatDate(change.changed_at)}</time>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
        <div className='space-y-4'>
          <Card>
            <h2 className='text-lg font-semibold'>Classificação da IA</h2>
            {classification ? (
              <dl className='mt-3 space-y-2 text-sm'>
                <div>
                  <dt className='text-muted-foreground'>Setor sugerido</dt>
                  <dd>{departmentLabel(classification.category)}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Prioridade</dt>
                  <dd>{priorityLabel(classification.priority)}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Assunto</dt>
                  <dd className='break-words'>{classification.subject ?? 'Sem assunto'}</dd>
                </div>
                {classification.review_reason && (
                  <div>
                    <dt className='text-muted-foreground'>Motivo da revisão</dt>
                    <dd>{reviewReasons[classification.review_reason]}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className='mt-3 text-sm text-muted-foreground'>Nenhuma classificação registrada.</p>
            )}
          </Card>
          <Card className='space-y-3'>
            <h2 className='text-lg font-semibold'>Encaminhamento manual</h2>
            <TicketRoutingForm protocol={ticket.protocol} department={ticket.department} />
          </Card>
        </div>
      </div>
    </section>
  )
}
