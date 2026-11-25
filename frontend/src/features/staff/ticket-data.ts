export const departments = {
  FINANCE: 'Financeiro',
  ACCOUNT_ACCESS: 'Acesso à conta',
  CANCELLATION: 'Cancelamentos',
  SUPPORT: 'Suporte',
  OTHER: 'Outros'
} as const

export const statuses = {
  PENDING_TRIAGE: 'Pendente de triagem',
  NEEDS_REVIEW: 'Em revisão',
  ROUTED: 'Encaminhado'
} as const

const statusLabels = {
  PENDENTE_TRIAGEM: statuses.PENDING_TRIAGE,
  EM_REVISAO: statuses.NEEDS_REVIEW,
  ENCAMINHADO: statuses.ROUTED
} as const

const priorities = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta' } as const

export type Department = keyof typeof departments
export type Session = { username: string; department: Department | null; reviewer: boolean }

export type TicketSummary = {
  protocol: string
  status: keyof typeof statusLabels
  department: Department | null
  created_at: string
  subject: string | null
  priority: keyof typeof priorities | null
}

export type TicketDetail = {
  ticket: TicketSummary
  original_message: string
  classification: {
    category: Department | null
    priority: TicketSummary['priority']
    subject: string | null
    review_reason: 'INVALID_RESPONSE' | 'MODEL_REQUESTED_REVIEW' | null
  } | null
  history: {
    changed_by: string
    changed_at: string
    previous_department: Department | null
    new_department: Department
  }[]
}

export type QueueMeta = {
  current_page: number
  last_page: number
  total: number
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo'
})

export function isTicketProtocol(value: string) {
  return /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)
}

export function formatDate(value: string) {
  return dateFormat.format(new Date(value))
}

export function departmentLabel(value: Department | null) {
  return value ? departments[value] : 'Sem setor'
}

export function statusLabel(value: TicketSummary['status']) {
  return statusLabels[value]
}

export function priorityLabel(value: TicketSummary['priority']) {
  return value ? priorities[value] : 'Sem prioridade'
}
