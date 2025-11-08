import { ElectronAPI } from '@electron-toolkit/preload'

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  department: "rh" | "transferencia";
  createdAt?: string;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getStats: (branch: string | null) => Promise<any>;
      logoutUser: () => Promise<any>;
      loginUser: (username: string, password: string) => Promise<any>;
      logoutUser: (token: string) => Promise<any>;
      getCurrentUser: (token: string) => Promise<any>;
      getProducts: () => Promise<Product[]>;
      createProduct: (product) => Promise<any>
      updateProduct: (id, updates) => Promise<any>
      deleteProduct: (id) => Promise<any>;
      getBranches: () => Promise<any>;
      addBranch: (branch) => Promise<any>;
      deleteBranch: (id) => Promise<any>;
      getMovements: (typeFilter) => Promise<any>
      createMovement: (movement) => Promise<any>
      deleteMovement: (id) => Promise<any>
      getBranchStock: () => Promise<any>;
      getUsers: () => Promise<any>;
      createUser: (user) => Promise<any>;
      updateUser: (id: string, updates: any) => Promise<any>;
      deleteUser: (id: string) => Promise<any>;
      getDetailedReport: (
        branchId: string,
        startDate?: string,
        endDate?: string
      ) => Promise<any>;
      fetchNotice: (url: string) => Promise<any>;
    }
  }
}
