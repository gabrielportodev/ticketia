'use client'

import { ArrowRight, Eye, EyeOff, LoaderCircle, LogOut, Route } from 'lucide-react'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormError } from '@/components/ui/form-error'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import type { QueueSelection } from './queue-navigation'
import { routeTicket, signIn, signOut } from './staff-actions'
import { departments, type TicketSummary } from './ticket-data'

export function StaffLoginForm() {
  const [error, action, pending] = useActionState(signIn, null)
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <form action={action} className='grid gap-4' aria-busy={pending}>
      <label className='grid gap-1.5 text-sm font-semibold'>
        Usuário
        <Input name='username' autoComplete='username' required className='h-11' />
      </label>
      <div className='grid gap-1.5'>
        <label htmlFor='staff-password' className='text-sm font-semibold'>
          Senha
        </label>
        <div className='relative'>
          <Input
            id='staff-password'
            name='password'
            type={passwordVisible ? 'text' : 'password'}
            autoComplete='current-password'
            required
            className='h-11 pe-12'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            className='absolute inset-y-0 end-0 size-11 text-muted-foreground'
            onClick={() => setPasswordVisible(visible => !visible)}
          >
            {passwordVisible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </Button>
        </div>
      </div>
      <FormError message={error} className='wrap-anywhere' />
      <Button type='submit' className='mt-1 h-11 justify-between px-4' disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
        {pending ? <LoaderCircle aria-hidden className='motion-safe:animate-spin' /> : <ArrowRight aria-hidden />}
      </Button>
    </form>
  )
}

export function StaffLogoutForm() {
  const [error, action, pending] = useActionState(signOut, null)

  return (
    <form action={action} className='grid max-w-full gap-1 lg:w-full' aria-busy={pending}>
      <Button
        type='submit'
        variant='ghost'
        className='h-11 justify-start gap-2 px-3 text-muted-foreground lg:text-on-ink lg:hover:bg-white/12 lg:hover:text-white lg:focus-visible:ring-white/70'
        disabled={pending}
      >
        <LogOut aria-hidden /> {pending ? 'Saindo…' : 'Sair'}
      </Button>
      <FormError message={error} className='wrap-anywhere' />
    </form>
  )
}

export function TicketRoutingForm({ ticket, filters }: { ticket: TicketSummary; filters: QueueSelection }) {
  const [error, action, pending] = useActionState(routeTicket.bind(null, ticket.protocol, filters), null)
  const [destination, setDestination] = useState('')
  const routedDepartment = ticket.status === 'ENCAMINHADO' ? ticket.department : null

  return (
    <form action={action} className='grid gap-3' aria-busy={pending}>
      <label className='grid gap-1.5 text-sm font-semibold'>
        Setor de destino
        <NativeSelect
          name='department'
          value={destination}
          onChange={event => setDestination(event.target.value)}
          required
          className='h-11'
        >
          <option value='' disabled>
            Selecione o setor
          </option>
          {Object.entries(departments).map(([value, label]) => (
            <option key={value} value={value} disabled={value === routedDepartment}>
              {label}
              {value === ticket.department ? ' (setor atual)' : ''}
            </option>
          ))}
        </NativeSelect>
      </label>
      <FormError message={error} className='wrap-anywhere' />
      <Button
        type='submit'
        className='h-11 px-3'
        disabled={pending || !destination || destination === routedDepartment}
      >
        {pending ? <LoaderCircle aria-hidden className='motion-safe:animate-spin' /> : <Route aria-hidden />}
        {pending ? 'Encaminhando…' : 'Encaminhar atendimento'}
      </Button>
    </form>
  )
}
