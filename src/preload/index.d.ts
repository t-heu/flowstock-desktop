import { ElectronAPI } from "@electron-toolkit/preload"
import { IProduct, RomaneioItem, OpenFileResponse, GenerateRomaneioPayload, GenerateRomaneioResponse } from "../shared/types"

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      // 📊 Dashboard
      getStats: (branch?: string) => Promise<any>

      // 🔐 Auth
      loginUser: (username: string, password: string) => Promise<{ success: boolean; data: {token: string; user: any}, error: any }>
      logout: () => Promise<void>
      getCurrentUser(): Promise<User | null>;
      loadSession(): Promise<AuthSession | null>;

      // 📦 Produtos
      getProducts: () => Promise<any>
      createProduct: (product: IProduct) => Promise<any>
      updateProduct: ({id, updates}: {id: string, updates: Partial<Product>}) => Promise<any>
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
      updateUser: ({id, updates}: {id: string, updates: any}) => Promise<any>
      deleteUser: (id: string) => Promise<any>

      // 📄 Relatório
      getDetailedReport: (params: DetailedReportParams) => Promise<{
        success: boolean;
        data: DetailedExit[];
        total: number;
        error?: string;
      }>

      // 🔔 Notificações
      fetchNotice: () => Promise<any>
      generateRomaneio: (
        data: GenerateRomaneioPayload
      ) => Promise<GenerateRomaneioResponse>

      confirmDialog: (options: { message: string }) => Promise<boolean>
    }
  }
}
