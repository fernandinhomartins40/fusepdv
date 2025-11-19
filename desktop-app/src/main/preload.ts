import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  app: {
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
  },
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  print: (content: string) => ipcRenderer.invoke('print', content),
})

// Type definitions for window.electron
export interface IElectronAPI {
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
    delete: (key: string) => Promise<boolean>
  }
  app: {
    getPath: (name: string) => Promise<string>
  }
  invoke: (channel: string, ...args: any[]) => Promise<any>
  print: (content: string) => Promise<boolean>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}
