import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import Store from 'electron-store'
import {
  getPendingProducts,
  saveProducts,
  getPendingSales,
  saveSales,
  closePrismaClient
} from './database'

const store = new Store()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    frame: true,
    icon: path.join(__dirname, '../../build/icon.png'),
  })

  // Load app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  await closePrismaClient()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('store:get', (_, key: string) => {
  return store.get(key)
})

ipcMain.handle('store:set', (_, key: string, value: any) => {
  store.set(key, value)
  return true
})

ipcMain.handle('store:delete', (_, key: string) => {
  store.delete(key)
  return true
})

ipcMain.handle('app:getPath', (_, name: string) => {
  return app.getPath(name as any)
})

// Database IPC Handlers for sync
ipcMain.handle('get-pending-products', async () => {
  try {
    return await getPendingProducts()
  } catch (error) {
    console.error('Error getting pending products:', error)
    return []
  }
})

ipcMain.handle('save-products', async (_, products: any[]) => {
  try {
    return await saveProducts(products)
  } catch (error) {
    console.error('Error saving products:', error)
    return false
  }
})

ipcMain.handle('get-pending-sales', async () => {
  try {
    return await getPendingSales()
  } catch (error) {
    console.error('Error getting pending sales:', error)
    return []
  }
})

ipcMain.handle('save-sales', async (_, sales: any[]) => {
  try {
    return await saveSales(sales)
  } catch (error) {
    console.error('Error saving sales:', error)
    return false
  }
})

// Print handler
ipcMain.handle('print', async (_, content: string) => {
  try {
    if (!mainWindow) return false

    // Create a hidden window for printing
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    // Load HTML content
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`)

    // Print silently
    const options = {
      silent: true,
      printBackground: true,
      deviceName: '', // Use default printer
    }

    await printWindow.webContents.print(options, (success, errorType) => {
      if (!success) {
        console.error('Print failed:', errorType)
      }
      printWindow.close()
    })

    return true
  } catch (error) {
    console.error('Error printing:', error)
    return false
  }
})
