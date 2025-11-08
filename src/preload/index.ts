import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getStats: (branch?: string) => ipcRenderer.invoke('get-stats', branch),
  getCurrentUser: (token?: string) => ipcRenderer.invoke('get-current-user', token),

  // 🔐 Autenticação
  loginUser: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', username, password),

  // 📦 Produtos
  getProducts: () => ipcRenderer.invoke("get-products"),
  createProduct: (product) => ipcRenderer.invoke("create-product", product),
  updateProduct: (id, updates) => ipcRenderer.invoke("update-product", id, updates),
  deleteProduct: (id) => ipcRenderer.invoke("delete-product", id),

  // 🏬 Filiais
  getBranches: () => ipcRenderer.invoke("get-branches"),
  addBranch: (branch) => ipcRenderer.invoke("add-branch", branch),
  deleteBranch: (id) => ipcRenderer.invoke("delete-branch", id),

  // 📈 Movimentos (entradas e saídas)
  getMovements: (typeFilter) => ipcRenderer.invoke("get-movements", typeFilter),
  createMovement: (movement) => ipcRenderer.invoke("create-movement", movement),
  deleteMovement: (id) => ipcRenderer.invoke("delete-movement", id),

  // 🗃️ Estoque por filial (novo)
  getBranchStock: () => ipcRenderer.invoke("get-branch-stock"),

   // 🔹 Usuários (novo)
  getUsers: () => ipcRenderer.invoke("get-users"),
  createUser: (user) => ipcRenderer.invoke("create-user", user),
  updateUser: (id, updates) => ipcRenderer.invoke("update-user", id, updates),
  deleteUser: (id) => ipcRenderer.invoke("delete-user", id),

  // 📄 Relatório detalhado (novo)
  getDetailedReport: (branchId, startDate, endDate) =>
    ipcRenderer.invoke("get-detailed-report", branchId, startDate, endDate),

  fetchNotice: (url: string) => ipcRenderer.invoke('fetch-notice', url),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
