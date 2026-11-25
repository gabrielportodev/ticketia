import { departments, statuses } from './ticket-data'

export type QueueParams = Record<string, string | string[] | undefined>
export type QueueSelection = ReturnType<typeof queueFilters>

export function queueFilters(params: QueueParams, reviewer = true) {
  return {
    department: reviewer ? filterValue(params.department, departments) : '',
    status: filterValue(params.status, statuses),
    page: typeof params.page === 'string' && /^[1-9]\d{0,7}$/.test(params.page) ? params.page : '1'
  }
}

export function queueHref(
  filters: QueueSelection,
  { protocol, updated }: { protocol?: string; updated?: boolean } = {}
) {
  const pathname = protocol ? `/staff/${protocol}` : '/staff'
  const query = new URLSearchParams()
  if (filters.department) query.set('department', filters.department)
  if (filters.status) query.set('status', filters.status)
  if (filters.page !== '1') query.set('page', filters.page)
  if (updated) query.set('updated', '1')
  const search = query.toString()
  return search ? `${pathname}?${search}` : pathname
}

function filterValue(value: string | string[] | undefined, options: Record<string, string>) {
  return typeof value === 'string' && Object.hasOwn(options, value) ? value : ''
}
