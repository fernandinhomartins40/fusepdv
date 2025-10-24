import { XMLParser } from 'fast-xml-parser'
import type { NfeParsedResult, NfeFornecedor, NfeProdutoExtraido, NfeInfoGeral } from '../../types/nfe.types'

export class NFEParserService {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      cdataPropName: '__cdata',
    })
  }

  /**
   * Parseia o XML da NF-e e extrai os dados
   */
  parse(xmlContent: string): NfeParsedResult {
    try {
      // Remover BOM e espaços extras
      const cleanXml = xmlContent.trim().replace(/^\uFEFF/, '')

      // Parsear XML
      const parsed = this.parser.parse(cleanXml)

      // Determinar estrutura (pode ser nfeProc ou NFe diretamente)
      let nfe: any
      if (parsed.nfeProc) {
        nfe = parsed.nfeProc.NFe || parsed.nfeProc.nfe
      } else if (parsed.NFe) {
        nfe = parsed.NFe
      } else if (parsed.nfe) {
        nfe = parsed.nfe
      } else {
        throw new Error('Estrutura XML inválida: não encontrado nó NFe')
      }

      const infNFe = nfe.infNFe || nfe.infNfe

      if (!infNFe) {
        throw new Error('Estrutura XML inválida: não encontrado nó infNFe')
      }

      // Extrair informações gerais
      const info = this.extractInfoGeral(infNFe)

      // Extrair dados do fornecedor (emitente)
      const fornecedor = this.extractFornecedor(infNFe.emit)

      // Extrair produtos
      const produtos = this.extractProdutos(infNFe.det)

      return {
        info,
        fornecedor,
        produtos,
        totalProdutos: produtos.length,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao parsear XML: ${error.message}`)
      }
      throw new Error('Erro desconhecido ao parsear XML')
    }
  }

  /**
   * Extrai informações gerais da NF-e
   */
  private extractInfoGeral(infNFe: any): NfeInfoGeral {
    const ide = infNFe.ide

    // Extrair chave de acesso do atributo Id
    let chaveAcesso = infNFe['@_Id'] || infNFe['@_id'] || ''
    chaveAcesso = chaveAcesso.replace('NFe', '').replace('nfe', '')

    return {
      chaveAcesso,
      numero: ide.nNF?.toString() || '',
      serie: ide.serie?.toString() || '1',
      modelo: ide.mod?.toString() || '55',
      dataEmissao: this.parseDate(ide.dhEmi || ide.dEmi),
      valorTotal: parseFloat(infNFe.total?.ICMSTot?.vNF || '0'),
      naturezaOperacao: ide.natOp || undefined,
    }
  }

  /**
   * Extrai dados do fornecedor (emitente)
   */
  private extractFornecedor(emit: any): NfeFornecedor {
    const enderEmit = emit.enderEmit

    return {
      cnpj: emit.CNPJ || emit.CPF || '',
      nome: emit.xFant || emit.xNome || '',
      razaoSocial: emit.xNome || '',
      inscricaoEstadual: emit.IE || undefined,
      endereco: enderEmit
        ? {
            logradouro: enderEmit.xLgr || undefined,
            numero: enderEmit.nro || undefined,
            complemento: enderEmit.xCpl || undefined,
            bairro: enderEmit.xBairro || undefined,
            municipio: enderEmit.xMun || undefined,
            uf: enderEmit.UF || undefined,
            cep: enderEmit.CEP?.toString() || undefined,
          }
        : undefined,
    }
  }

  /**
   * Extrai lista de produtos
   */
  private extractProdutos(det: any | any[]): NfeProdutoExtraido[] {
    // det pode ser um único objeto ou array
    const detArray = Array.isArray(det) ? det : [det]

    return detArray.map((item) => this.extractProduto(item))
  }

  /**
   * Extrai dados de um produto individual
   */
  private extractProduto(det: any): NfeProdutoExtraido {
    const prod = det.prod
    const imposto = det.imposto

    // Extrair impostos se disponíveis
    const impostos = imposto
      ? {
          icms: this.extractICMS(imposto.ICMS),
          pis: this.extractPIS(imposto.PIS),
          cofins: this.extractCOFINS(imposto.COFINS),
        }
      : undefined

    return {
      codigo: prod.cProd?.toString() || '',
      ean: this.normalizeEAN(prod.cEAN || prod.cEANTrib),
      nome: prod.xProd || '',
      descricao: prod.xProd || '',
      ncm: prod.NCM?.toString() || undefined,
      cest: prod.CEST?.toString() || undefined,
      cfop: prod.CFOP?.toString() || undefined,
      unidade: prod.uCom || prod.uTrib || 'UN',
      quantidade: parseFloat(prod.qCom || prod.qTrib || '0'),
      precoUnitario: parseFloat(prod.vUnCom || prod.vUnTrib || '0'),
      valorTotal: parseFloat(prod.vProd || '0'),
      impostos,
    }
  }

  /**
   * Extrai informações de ICMS
   */
  private extractICMS(icms: any): { aliquota?: number; valor?: number } | undefined {
    if (!icms) return undefined

    // ICMS pode ter várias estruturas (ICMS00, ICMS10, ICMS20, etc.)
    const icmsKey = Object.keys(icms)[0]
    const icmsData = icms[icmsKey]

    if (!icmsData) return undefined

    return {
      aliquota: parseFloat(icmsData.pICMS || '0') || undefined,
      valor: parseFloat(icmsData.vICMS || '0') || undefined,
    }
  }

  /**
   * Extrai informações de PIS
   */
  private extractPIS(pis: any): { aliquota?: number; valor?: number } | undefined {
    if (!pis) return undefined

    const pisKey = Object.keys(pis)[0]
    const pisData = pis[pisKey]

    if (!pisData) return undefined

    return {
      aliquota: parseFloat(pisData.pPIS || '0') || undefined,
      valor: parseFloat(pisData.vPIS || '0') || undefined,
    }
  }

  /**
   * Extrai informações de COFINS
   */
  private extractCOFINS(cofins: any): { aliquota?: number; valor?: number } | undefined {
    if (!cofins) return undefined

    const cofinsKey = Object.keys(cofins)[0]
    const cofinsData = cofins[cofinsKey]

    if (!cofinsData) return undefined

    return {
      aliquota: parseFloat(cofinsData.pCOFINS || '0') || undefined,
      valor: parseFloat(cofinsData.vCOFINS || '0') || undefined,
    }
  }

  /**
   * Normaliza código EAN (remove "SEM GTIN")
   */
  private normalizeEAN(ean?: string): string | undefined {
    if (!ean) return undefined

    const cleanEan = ean.toString().trim()

    // Se for "SEM GTIN" ou zeros, retorna undefined
    if (
      cleanEan === 'SEM GTIN' ||
      cleanEan === '' ||
      /^0+$/.test(cleanEan) ||
      cleanEan.length < 8
    ) {
      return undefined
    }

    return cleanEan
  }

  /**
   * Converte string de data para Date
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date()

    // Formato: 2024-01-15T10:30:00-03:00 ou 2024-01-15
    try {
      return new Date(dateStr)
    } catch {
      return new Date()
    }
  }

  /**
   * Valida se o XML é uma NF-e válida
   */
  validateXML(xmlContent: string): { valid: boolean; error?: string } {
    try {
      const cleanXml = xmlContent.trim().replace(/^\uFEFF/, '')

      if (!cleanXml.includes('NFe') && !cleanXml.includes('nfe')) {
        return {
          valid: false,
          error: 'XML não é uma NF-e válida',
        }
      }

      // Tentar parsear
      const parsed = this.parser.parse(cleanXml)

      if (!parsed.nfeProc && !parsed.NFe && !parsed.nfe) {
        return {
          valid: false,
          error: 'Estrutura XML inválida',
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erro ao validar XML',
      }
    }
  }
}

export const nfeParserService = new NFEParserService()
