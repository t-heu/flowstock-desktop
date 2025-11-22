import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

let statusListeners: ((status: string) => void)[] = [];

ipcRenderer.on("service-status:update", (_, status: string) => {
  statusListeners.forEach(cb => cb(status));
});

const api = {
  subscribeServiceStatus: () => ipcRenderer.send("subscribe-service-status"),
  onServiceStatus: (cb: (status: string) => void) => {
    statusListeners.push(cb);
    return () => {
      statusListeners = statusListeners.filter(l => l !== cb);
    };
  },

  // Autenticação
  loginUser: (username, password) =>
    ipcRenderer.invoke('auth:login', {username, password}),

  loadSession: () => ipcRenderer.invoke("auth:load-session"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  getCurrentUser: () => ipcRenderer.invoke("auth:get-current-user"),

  getStats: (branch?: string) => ipcRenderer.invoke('get-stats', branch),

  // 📦 Produtos
  getProducts: () => ipcRenderer.invoke("get-products"),
  createProduct: (product: any) => ipcRenderer.invoke("create-product", product),
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
  getDetailedReport: (params) => ipcRenderer.invoke("get-detailed-report", params),

  fetchNotice: () => ipcRenderer.invoke('fetch-notice'),
  generateRomaneio: (data) => ipcRenderer.invoke("generate-romaneio", data),
  confirmDialog: (options: { message: string }) => ipcRenderer.invoke("confirmDialog", options),
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
