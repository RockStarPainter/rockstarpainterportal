export enum FormTypes {
  INVOICE = 'INVOICE',
  ESTIMATE = 'ESTIMATE',
  CONTRACT = 'CONTRACT'
}

export enum InvoiceTypes {
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  BOTH = 'BOTH'
}

export const InvoiceTypesValues: InvoiceTypes[] = Object.values(InvoiceTypes)
