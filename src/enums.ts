export enum Status {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export const statusValues: Status[] = Object.values(Status)
