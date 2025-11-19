import { PrismaClient } from '../database/generated'
import path from 'path'
import { app } from 'electron'

// Prisma client for desktop app database
let prisma: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const dbPath = path.join(app.getPath('userData'), 'pdv.db')
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`
        }
      }
    })
  }
  return prisma
}

export async function closePrismaClient() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

// Database operations for sync

export async function getPendingProducts() {
  const client = getPrismaClient()
  return await client.product.findMany({
    where: { synced: false }
  })
}

export async function saveProducts(products: any[]) {
  const client = getPrismaClient()

  for (const product of products) {
    await client.product.upsert({
      where: { id: product.id },
      update: {
        ...product,
        synced: true,
        updatedAt: new Date()
      },
      create: {
        ...product,
        synced: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  return true
}

export async function getPendingSales() {
  const client = getPrismaClient()
  return await client.sale.findMany({
    where: { synced: false },
    include: {
      items: true
    }
  })
}

export async function saveSales(sales: any[]) {
  const client = getPrismaClient()

  for (const sale of sales) {
    const { items, ...saleData } = sale

    await client.sale.upsert({
      where: { id: sale.id },
      update: {
        ...saleData,
        synced: true,
        updatedAt: new Date()
      },
      create: {
        ...saleData,
        synced: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Save sale items if they exist
    if (items && items.length > 0) {
      for (const item of items) {
        await client.saleItem.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
    }
  }

  return true
}

export async function addToSyncQueue(type: string, action: string, data: any) {
  const client = getPrismaClient()

  await client.syncQueue.create({
    data: {
      type,
      action,
      data: JSON.stringify(data),
      synced: false,
      retries: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  return true
}

export async function getSyncQueue() {
  const client = getPrismaClient()
  return await client.syncQueue.findMany({
    where: { synced: false },
    orderBy: { createdAt: 'asc' }
  })
}

export async function markSyncQueueItemSynced(id: string) {
  const client = getPrismaClient()
  await client.syncQueue.update({
    where: { id },
    data: { synced: true, updatedAt: new Date() }
  })
  return true
}

export async function incrementSyncQueueRetries(id: string) {
  const client = getPrismaClient()
  const item = await client.syncQueue.findUnique({ where: { id } })
  if (item) {
    await client.syncQueue.update({
      where: { id },
      data: { retries: item.retries + 1, updatedAt: new Date() }
    })
  }
  return true
}
