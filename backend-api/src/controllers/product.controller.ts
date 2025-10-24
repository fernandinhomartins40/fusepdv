import { FastifyRequest, FastifyReply } from 'fastify'
import { productService } from '../services/product.service'
import type { CreateProductInput, UpdateProductInput, BulkCreateProductsInput } from '../types/product.types'

export class ProductController {
  async create(request: FastifyRequest<{ Body: CreateProductInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const product = await productService.create(establishmentId, request.body)

      return reply.status(201).send(product)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao criar produto',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async bulkCreate(request: FastifyRequest<{ Body: BulkCreateProductsInput }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const results = await productService.bulkCreate(establishmentId, request.body.products)

      return reply.status(201).send(results)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao criar produtos em lote',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async list(
    request: FastifyRequest<{
      Querystring: {
        search?: string
        categoria?: string
        ativo?: string
        estoqueMinimo?: string
        page?: string
        limit?: string
      }
    }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const filters = {
        search: request.query.search,
        categoria: request.query.categoria,
        ativo: request.query.ativo === 'true' ? true : request.query.ativo === 'false' ? false : undefined,
        estoqueMinimo: request.query.estoqueMinimo === 'true',
      }

      const page = parseInt(request.query.page || '1')
      const limit = parseInt(request.query.limit || '50')

      const result = await productService.findAll(establishmentId, filters, page, limit)

      return reply.status(200).send(result)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar produtos' })
    }
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const product = await productService.findById(request.params.id, establishmentId)

      return reply.status(200).send(product)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(404).send({
          error: 'Produto não encontrado',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async getByCode(request: FastifyRequest<{ Params: { codigo: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const product = await productService.findByCode(request.params.codigo, establishmentId)

      if (!product) {
        return reply.status(404).send({ error: 'Produto não encontrado' })
      }

      return reply.status(200).send(product)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async getByEan(request: FastifyRequest<{ Params: { ean: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const product = await productService.findByEan(request.params.ean, establishmentId)

      if (!product) {
        return reply.status(404).send({ error: 'Produto não encontrado' })
      }

      return reply.status(200).send(product)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const product = await productService.update(request.params.id, establishmentId, request.body)

      return reply.status(200).send(product)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao atualizar produto',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      await productService.delete(request.params.id, establishmentId)

      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao deletar produto',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }

  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const categories = await productService.getCategories(establishmentId)

      return reply.status(200).send(categories)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar categorias' })
    }
  }

  async getLowStock(request: FastifyRequest, reply: FastifyReply) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const products = await productService.getLowStock(establishmentId)

      return reply.status(200).send(products)
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao buscar produtos com estoque baixo' })
    }
  }

  async updateStock(
    request: FastifyRequest<{
      Params: { id: string }
      Body: { quantity: number; operation: 'add' | 'subtract' | 'set' }
    }>,
    reply: FastifyReply
  ) {
    try {
      const establishmentId = request.user?.establishmentId

      if (!establishmentId) {
        return reply.status(401).send({ error: 'Não autorizado' })
      }

      const { quantity, operation } = request.body

      const product = await productService.updateStock(request.params.id, establishmentId, quantity, operation)

      return reply.status(200).send(product)
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({
          error: 'Erro ao atualizar estoque',
          message: error.message,
        })
      }
      return reply.status(500).send({ error: 'Erro interno do servidor' })
    }
  }
}

export const productController = new ProductController()
