import { prisma } from '../database/prisma'
import type { CreateProductInput, UpdateProductInput, ProductFilter } from '../types/product.types'
import { Prisma } from '@prisma/client'

export class ProductService {
  async create(establishmentId: string, data: CreateProductInput) {
    // Verificar se código já existe
    const existing = await prisma.product.findUnique({
      where: {
        establishmentId_codigo: {
          establishmentId,
          codigo: data.codigo,
        },
      },
    })

    if (existing) {
      throw new Error('Já existe um produto com este código')
    }

    // Verificar se EAN já existe (se fornecido)
    if (data.ean) {
      const existingEan = await prisma.product.findFirst({
        where: {
          establishmentId,
          ean: data.ean,
        },
      })

      if (existingEan) {
        throw new Error('Já existe um produto com este EAN')
      }
    }

    return await prisma.product.create({
      data: {
        ...data,
        establishmentId,
      },
    })
  }

  async bulkCreate(establishmentId: string, products: CreateProductInput[]) {
    const results = {
      success: [] as any[],
      errors: [] as { product: CreateProductInput; error: string }[],
    }

    for (const productData of products) {
      try {
        const product = await this.create(establishmentId, productData)
        results.success.push(product)
      } catch (error) {
        results.errors.push({
          product: productData,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    return results
  }

  async findAll(
    establishmentId: string,
    filters: ProductFilter = {},
    page: number = 1,
    limit: number = 50
  ) {
    const where: Prisma.ProductWhereInput = {
      establishmentId,
    }

    // Aplicar filtros
    if (filters.search) {
      where.OR = [
        { nome: { contains: filters.search, mode: 'insensitive' } },
        { codigo: { contains: filters.search, mode: 'insensitive' } },
        { ean: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.categoria) {
      where.categoria = filters.categoria
    }

    if (filters.ativo !== undefined) {
      where.ativo = filters.ativo
    }

    if (filters.estoqueMinimo) {
      where.AND = [
        { estoqueMinimo: { not: null } },
        {
          estoque: {
            lte: prisma.product.fields.estoqueMinimo,
          },
        },
      ]
    }

    // Buscar produtos com paginação
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string, establishmentId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        establishmentId,
      },
    })

    if (!product) {
      throw new Error('Produto não encontrado')
    }

    return product
  }

  async findByCode(codigo: string, establishmentId: string) {
    return await prisma.product.findUnique({
      where: {
        establishmentId_codigo: {
          establishmentId,
          codigo,
        },
      },
    })
  }

  async findByEan(ean: string, establishmentId: string) {
    return await prisma.product.findFirst({
      where: {
        establishmentId,
        ean,
      },
    })
  }

  async update(id: string, establishmentId: string, data: UpdateProductInput) {
    // Verificar se produto existe
    await this.findById(id, establishmentId)

    // Verificar duplicatas de código (se alterado)
    if (data.codigo) {
      const existing = await prisma.product.findFirst({
        where: {
          establishmentId,
          codigo: data.codigo,
          id: { not: id },
        },
      })

      if (existing) {
        throw new Error('Já existe outro produto com este código')
      }
    }

    // Verificar duplicatas de EAN (se alterado)
    if (data.ean) {
      const existingEan = await prisma.product.findFirst({
        where: {
          establishmentId,
          ean: data.ean,
          id: { not: id },
        },
      })

      if (existingEan) {
        throw new Error('Já existe outro produto com este EAN')
      }
    }

    return await prisma.product.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, establishmentId: string) {
    // Verificar se produto existe
    await this.findById(id, establishmentId)

    // Soft delete - apenas marca como inativo
    return await prisma.product.update({
      where: { id },
      data: { ativo: false },
    })
  }

  async getCategories(establishmentId: string) {
    const products = await prisma.product.findMany({
      where: {
        establishmentId,
        categoria: { not: null },
      },
      select: {
        categoria: true,
      },
      distinct: ['categoria'],
    })

    return products.map((p) => p.categoria).filter((c): c is string => c !== null)
  }

  async getLowStock(establishmentId: string) {
    return await prisma.product.findMany({
      where: {
        establishmentId,
        ativo: true,
        estoqueMinimo: { not: null },
        estoque: {
          lte: prisma.product.fields.estoqueMinimo,
        },
      },
      orderBy: { estoque: 'asc' },
    })
  }

  async updateStock(id: string, establishmentId: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const product = await this.findById(id, establishmentId)

    let newStock: number

    if (operation === 'set') {
      newStock = quantity
    } else if (operation === 'add') {
      newStock = Number(product.estoque) + quantity
    } else {
      newStock = Number(product.estoque) - quantity
    }

    if (newStock < 0) {
      throw new Error('Estoque não pode ser negativo')
    }

    return await prisma.product.update({
      where: { id },
      data: { estoque: newStock },
    })
  }
}

export const productService = new ProductService()
