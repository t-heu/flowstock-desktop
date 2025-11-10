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
  department: "rh" | "transferencia";
  createdAt?: string;
}

export interface IProduct {
  name: string;
  code: string;
  description?: string;
  unit: string;
  department: "rh" | "transferencia" | "";
}

export interface Branch {
  id?: string;
  name: string;
  code: string;
  location?: string;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role:  "admin" | "manager" | "operator";
  username: string;
  branchId: string;
  department: string | null;
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
  role: "admin" | "manager" | "operator";
  branchId: string;
  department: "rh" | "transferencia";
}

export interface DetailedReportItem {
  branchName: string;
  destinationBranchName: string;
  productCode: string;
  productName: string;
  quantity: number;
  notes?: string;
  createdAt?: string;
}

export interface Stats {
  totalProducts: number;
  totalStock: number;
  totalEntries: number;
  totalExits: number;
  totalBranches: number;
}
