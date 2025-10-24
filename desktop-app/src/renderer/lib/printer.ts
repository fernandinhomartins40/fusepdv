interface SaleItem {
  productId: string
  productNome: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

interface Sale {
  id: string
  items: SaleItem[]
  total: number
  formaPagamento: string
  valorPago: number
  troco: number
  createdAt: Date
}

export function generateCupomFiscal(sale: Sale, estabelecimento: any): string {
  const width = 48
  const line = '='.repeat(width)
  const date = new Date(sale.createdAt)

  let cupom = ''

  // Header
  cupom += centerText(estabelecimento.nome || 'Estabelecimento', width) + '\n'
  cupom += centerText(`CNPJ: ${formatCNPJ(estabelecimento.cnpj || '')}`, width) + '\n'
  cupom += centerText(estabelecimento.endereco || '', width) + '\n'
  cupom += line + '\n'
  cupom += centerText('CUPOM NÃO FISCAL', width) + '\n'
  cupom += line + '\n'

  // Data e hora
  cupom += `Data: ${date.toLocaleDateString('pt-BR')}\n`
  cupom += `Hora: ${date.toLocaleTimeString('pt-BR')}\n`
  cupom += line + '\n'

  // Items
  cupom += 'ITEM DESCRIÇÃO              QTD  UNIT    TOTAL\n'
  cupom += line + '\n'

  sale.items.forEach((item, index) => {
    const num = String(index + 1).padStart(3, '0')
    const desc = truncate(item.productNome, 20).padEnd(20)
    const qtd = item.quantidade.toFixed(2).padStart(5)
    const unit = item.precoUnitario.toFixed(2).padStart(7)
    const total = item.subtotal.toFixed(2).padStart(9)

    cupom += `${num} ${desc} ${qtd} ${unit} ${total}\n`
  })

  cupom += line + '\n'

  // Total
  const totalText = `TOTAL: R$ ${sale.total.toFixed(2)}`
  cupom += totalText.padStart(width) + '\n'
  cupom += line + '\n'

  // Pagamento
  cupom += `Forma de Pagamento: ${sale.formaPagamento}\n`
  cupom += `Valor Pago:     R$ ${sale.valorPago.toFixed(2)}\n`
  if (sale.troco > 0) {
    cupom += `Troco:          R$ ${sale.troco.toFixed(2)}\n`
  }
  cupom += line + '\n'

  // Footer
  cupom += centerText('Obrigado pela preferência!', width) + '\n'
  cupom += centerText('Volte sempre!', width) + '\n'
  cupom += '\n\n\n'

  return cupom
}

export async function printCupom(cupom: string): Promise<void> {
  try {
    // In Electron, this should use the main process to print
    if (window.electron?.print) {
      await window.electron.print(cupom)
    } else {
      // Fallback: open print dialog
      const printWindow = window.open('', '', 'width=300,height=600')
      if (printWindow) {
        printWindow.document.write('<pre style="font-family: monospace; font-size: 12px;">')
        printWindow.document.write(cupom)
        printWindow.document.write('</pre>')
        printWindow.document.close()
        printWindow.print()
      }
    }
  } catch (error) {
    console.error('Erro ao imprimir:', error)
    throw new Error('Erro ao imprimir cupom')
  }
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2))
  return ' '.repeat(padding) + text
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}
