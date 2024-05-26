declare module 'html2pdf.js' {
  export interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number]
    filename?: string
    image?: { type: string; quality: number }
    html2canvas?: any
    jsPDF?: { unit: string; format: string | number[]; orientation: string }
  }

  function html2pdf(): {
    from: (element: HTMLElement) => {
      set: (options: Html2PdfOptions) => {
        save: () => void
        outputPdf: (type: string) => Promise<any>
      }
    }
  }

  export default html2pdf
}
