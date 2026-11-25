import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <section role='status' className='space-y-5'>
      <span className='sr-only'>Carregando atendimentos…</span>
      <div aria-hidden className='space-y-5 motion-safe:animate-pulse'>
        <div className='h-8 w-60 max-w-full rounded-md bg-muted' />
        <Card className='grid gap-4'>
          <div className='h-8 w-48 max-w-full rounded-md bg-muted' />
          <div className='border-t border-border pt-4'>
            <div className='h-5 w-3/4 rounded-md bg-muted' />
          </div>
          <div className='h-5 w-1/2 rounded-md bg-muted' />
        </Card>
      </div>
    </section>
  )
}
