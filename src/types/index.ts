export interface BranchStockItem {
  branchId: string;
  branchName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  createdAt?: string;
}

export interface Branch {
  id?: string;
  name: string;
  code: string;
  location?: string;
  createdAt?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  username: string;
  branchId: string;
  password?: string;
  createdAt?: string;
}

export interface Movement {
  id?: string;
  productId: string;
  branchId: string;
  type: "entrada" | "saida";
  quantity: number;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  branchId: string;
}

export interface DetailedReportItem {
  date: string;
  branchName: string;
  destinationBranchName: string;
  productCode: string;
  productName: string;
  quantity: number;
  notes?: string;
}

export interface Stats {
  totalProducts: number;
  totalStock: number;
  totalEntries: number;
  totalExits: number;
  totalBranches: number;
}
