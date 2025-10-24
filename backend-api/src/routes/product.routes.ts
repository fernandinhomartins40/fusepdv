import { FastifyInstance } from 'fastify'
import { productController } from '../controllers/product.controller'
import { createProductSchema, updateProductSchema, bulkCreateProductsSchema } from '../types/product.types'
import { authenticate } from '../middlewares/auth.middleware'

export async function productRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('preHandler', authenticate)

  // Criar produto
  fastify.post('/', {
    schema: {
      body: createProductSchema,
    },
    handler: productController.create.bind(productController),
  })

  // Criar produtos em lote (para importação de NF-e)
  fastify.post('/bulk', {
    schema: {
      body: bulkCreateProductsSchema,
    },
    handler: productController.bulkCreate.bind(productController),
  })

  // Listar produtos com filtros e paginação
  fastify.get('/', {
    handler: productController.list.bind(productController),
  })

  // Buscar produto por ID
  fastify.get('/:id', {
    handler: productController.getById.bind(productController),
  })

  // Buscar produto por código
  fastify.get('/code/:codigo', {
    handler: productController.getByCode.bind(productController),
  })

  // Buscar produto por EAN
  fastify.get('/ean/:ean', {
    handler: productController.getByEan.bind(productController),
  })

  // Atualizar produto
  fastify.patch('/:id', {
    schema: {
      body: updateProductSchema,
    },
    handler: productController.update.bind(productController),
  })

  // Deletar produto (soft delete)
  fastify.delete('/:id', {
    handler: productController.delete.bind(productController),
  })

  // Listar categorias
  fastify.get('/meta/categories', {
    handler: productController.getCategories.bind(productController),
  })

  // Produtos com estoque baixo
  fastify.get('/meta/low-stock', {
    handler: productController.getLowStock.bind(productController),
  })

  // Atualizar estoque
  fastify.patch('/:id/stock', {
    handler: productController.updateStock.bind(productController),
  })
}
