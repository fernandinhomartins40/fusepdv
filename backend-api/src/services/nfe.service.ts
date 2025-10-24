import { prisma } from '../database/prisma'
import { nfeParserService } from '../utils/nfe-parser/nfe-parser.service'
import type { NfeParsedResult } from '../types/nfe.types'

export class NfeService {
  /**
   * Parseia XML de NF-e e retorna dados extraídos
   */
  async parseXML(xmlContent: string): Promise<NfeParsedResult> {
    // Validar XML
    const validation = nfeParserService.validateXML(xmlContent)
    if (!validation.valid) {
      throw new Error(validation.error || 'XML inválido')
    }

    // Parsear XML
    const parsed = nfeParserService.parse(xmlContent)

    return parsed
  }

  /**
   * Salva registro de importação de NF-e
   */
  async saveImport(
    establishmentId: string,
    parsed: NfeParsedResult,
    xmlContent: string
  ) {
    const nfeImport = await prisma.nfeImport.create({
      data: {
        establishmentId,
        chaveAcesso: parsed.info.chaveAcesso,
        numero: parsed.info.numero,
        serie: parsed.info.serie,
        modelo: parsed.info.modelo,
        fornecedorCnpj: parsed.fornecedor.cnpj,
        fornecedorNome: parsed.fornecedor.nome,
        dataEmissao: parsed.info.dataEmissao,
        valorTotal: parsed.info.valorTotal,
        xmlContent,
        produtosCount: parsed.totalProdutos,
      },
    })

    return nfeImport
  }

  /**
   * Busca histórico de importações
   */
  async getHistory(
    establishmentId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
      startDate?: Date
      endDate?: Date
    } = {}
  ) {
    const where: any = {
      establishmentId,
    }

    // Filtrar por data
    if (filters.startDate || filters.endDate) {
      where.dataEmissao = {}
      if (filters.startDate) {
        where.dataEmissao.gte = filters.startDate
      }
      if (filters.endDate) {
        where.dataEmissao.lte = filters.endDate
      }
    }

    const [imports, total] = await Promise.all([
      prisma.nfeImport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dataEmissao: 'desc' },
        select: {
          id: true,
          chaveAcesso: true,
          numero: true,
          serie: true,
          fornecedorCnpj: true,
          fornecedorNome: true,
          dataEmissao: true,
          valorTotal: true,
          produtosCount: true,
          createdAt: true,
        },
      }),
      prisma.nfeImport.count({ where }),
    ])

    return {
      imports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Busca detalhes de uma importação específica
   */
  async getImportById(id: string, establishmentId: string) {
    const nfeImport = await prisma.nfeImport.findFirst({
      where: {
        id,
        establishmentId,
      },
    })

    if (!nfeImport) {
      throw new Error('Importação não encontrada')
    }

    return nfeImport
  }

  /**
   * Verifica se uma NF-e já foi importada (por chave de acesso)
   */
  async checkIfExists(chaveAcesso: string, establishmentId: string) {
    const existing = await prisma.nfeImport.findFirst({
      where: {
        chaveAcesso,
        establishmentId,
      },
    })

    return !!existing
  }

  /**
   * Busca XML de uma importação
   */
  async getXML(id: string, establishmentId: string) {
    const nfeImport = await this.getImportById(id, establishmentId)
    return nfeImport.xmlContent
  }
}

export const nfeService = new NfeService()
