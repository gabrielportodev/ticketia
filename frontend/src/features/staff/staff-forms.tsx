'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { routeTicket, signIn, signOut } from './staff-actions'
import { departments, type Department } from './ticket-data'

export function StaffLoginForm() {
  const [error, action, pending] = useActionState(signIn, null)

  return (
    <form action={action} className='grid gap-4'>
      <label className='grid gap-1.5 text-sm font-medium'>
        Usuário
        <Input name='username' autoComplete='username' required />
      </label>
      <label className='grid gap-1.5 text-sm font-medium'>
        Senha
        <Input name='password' type='password' autoComplete='current-password' required />
      </label>
      <FormError message={error} />
      <Button type='submit' size='lg' disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}

export function StaffLogoutForm() {
  const [error, action, pending] = useActionState(signOut, null)

  return (
    <form action={action} className='grid justify-items-end gap-1'>
      <Button type='submit' variant='outline' className='text-foreground' disabled={pending}>
        {pending ? 'Saindo…' : 'Sair'}
      </Button>
      <FormError message={error} />
    </form>
  )
}

export function TicketRoutingForm({ protocol, department }: { protocol: string; department: Department | null }) {
  const [error, action, pending] = useActionState(routeTicket.bind(null, protocol), null)

  return (
    <form action={action} className='grid gap-3'>
      <label className='grid gap-1.5 text-sm font-medium'>
        Setor de destino
        <NativeSelect name='department' defaultValue={department ?? ''} required>
          <option value='' disabled>
            Selecione o setor
          </option>
          {Object.entries(departments).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </label>
      <FormError message={error} />
      <Button type='submit' size='lg' className='justify-self-start' disabled={pending}>
        {pending ? 'Encaminhando…' : 'Encaminhar atendimento'}
      </Button>
    </form>
  )
}

function FormError({ message }: { message: string | null }) {
  return message ? (
    <p role='alert' className='text-sm text-destructive'>
      {message}
    </p>
  ) : null
}
