export enum FormTypes {
  INVOICE = 'INVOICE',
  ESTIMATE = 'ESTIMATE',
  CONTRACT = 'CONTRACT'
}

export enum InvoiceTypes {
  INTERIOR = 'INTERIOR',
  EXTERIOR = 'EXTERIOR',
  ALL = 'ALL',
  HANDYMAN = 'HANDYMAN'
}

export const InvoiceTypesValues: InvoiceTypes[] = Object.values(InvoiceTypes)
