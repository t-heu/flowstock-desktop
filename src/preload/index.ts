import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload';

interface StatusAPI {
  subscribeServiceStatus: () => void;
}

const statusAPI: StatusAPI = {
  subscribeServiceStatus: () => ipcRenderer.invoke('healthcheck'),
};

// adiciona statusAPI ao api já existente
const api = {
  ...statusAPI,
  // resto das funções que você já tem
  loginUser: (username: string, password: string) =>
    ipcRenderer.invoke('auth:login', { username, password }),

  loadSession: () => ipcRenderer.invoke("auth:load-session"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getCurrentUser: () => ipcRenderer.invoke("auth:get-current-user"),

  getStats: (branch?: string) => ipcRenderer.invoke('get-stats', branch),
  getProducts: () => ipcRenderer.invoke("get-products"),
  createProduct: (product: any) => ipcRenderer.invoke("create-product", product),
  updateProduct: (id: string, updates: any) => ipcRenderer.invoke("update-product", id, updates),
  deleteProduct: (id: string) => ipcRenderer.invoke("delete-product", id),

  getBranches: () => ipcRenderer.invoke("get-branches"),
  addBranch: (branch: any) => ipcRenderer.invoke("add-branch", branch),
  deleteBranch: (id: string) => ipcRenderer.invoke("delete-branch", id),

  getMovements: (typeFilter?: string) => ipcRenderer.invoke("get-movements", typeFilter),
  createMovement: (movement: any) => ipcRenderer.invoke("create-movement", movement),
  deleteMovement: (id: string) => ipcRenderer.invoke("delete-movement", id),

  getStock: () => ipcRenderer.invoke("get-stock"),

  getUsers: () => ipcRenderer.invoke("get-users"),
  createUser: (user: any) => ipcRenderer.invoke("create-user", user),
  updateUser: (id: string, updates: any) => ipcRenderer.invoke("update-user", id, updates),
  deleteUser: (id: string) => ipcRenderer.invoke("delete-user", id),

  getDetailedReport: (params: any) => ipcRenderer.invoke("get-detailed-report", params),

  fetchNotice: () => ipcRenderer.invoke('fetch-notice'),
  generateRomaneio: (data: any) => ipcRenderer.invoke("generate-romaneio", data),
  confirmDialog: (options: { message: string }) => ipcRenderer.invoke("confirmDialog", options),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
