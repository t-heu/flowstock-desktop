import { ElectronAPI } from "@electron-toolkit/preload"
import { IProduct } from "../shared/types"

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // 📊 Dashboard
      getStats: (branch?: string) => Promise<any>

      // 🔐 Auth
      loginUser: (username: string, password: string) => Promise<{ success: boolean; token: string; user: any }>
      saveToken: (token: string) => Promise<void>
      logout: () => Promise<void>
      getCurrentUser: () => Promise<{ success: boolean; user?: any }>

      // 📦 Produtos
      getProducts: () => Promise<Product[]>
      createProduct: (product: IProduct) => Promise<any>
      updateProduct: (id: string, updates: Partial<Product>) => Promise<any>
      deleteProduct: (id: string) => Promise<any>

      // 🏬 Filiais
      getBranches: () => Promise<any>
      addBranch: (branch: any) => Promise<any>
      deleteBranch: (id: string) => Promise<any>

      // 📈 Movimentos
      getMovements: (typeFilter?: string) => Promise<any>
      createMovement: (movement: any) => Promise<any>
      deleteMovement: (id: string) => Promise<any>

      // 🏗️ Estoque
      getBranchStock: () => Promise<any>

      // 👥 Usuários
      getUsers: () => Promise<any>
      createUser: (user: any) => Promise<any>
      updateUser: (id: string, updates: any) => Promise<any>
      deleteUser: (id: string) => Promise<any>

      // 📄 Relatório
      getDetailedReport: (branchId: string, startDate?: string, endDate?: string) => Promise<any>

      // 🔔 Notificações
      fetchNotice: () => Promise<any>
    }
  }
}
