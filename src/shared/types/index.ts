import departments from "../../shared/config/departments.json";

export type DepartmentId = (typeof departments.allowed)[number]["id"];

export interface RomaneioItem {
  fromBranch: string
  toBranch: string
  product: string
  quantity: number
  notes?: string
  date: string
}

export interface GenerateRomaneioPayload {
  romaneioNumber: number | string
  items: RomaneioItem[]
}

export interface GenerateRomaneioResponse {
  success: boolean
  path?: string
  error?: string
}

export interface OpenFileResponse {
  success: boolean
  error?: string
}

export interface ProductDTO {
  name: string;
  code: string;
  description: string;
  unit: string;
  department: DepartmentId;
}

export interface UserDTO {
  name: string;
  email: string;
  role:  "admin" | "manager" | "operator";
  username: string;
  branchId: string;
  department: string | null;
}

// ===
export interface ReportMovement {
  id: string;
  invoice_number: string;
  branch_name: string;
  product_code: string;
  product_name: string;
  quantity: number;
  notes: string;
  created_at: string;
  branch_code: string
  destination_branch_name: string
  destination_branch_code: string
  product_department: string
  type: string
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  unit: string;
  department: DepartmentId;
  created_at?: string;
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
  created_at?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "operator";
  branchId: string;
  department: DepartmentId;
}

export interface Stats {
  totalProducts: number;
  totalStock: number;
  totalEntries: number;
  totalExits: number;
  totalBranches: number;
}

export type Notice = {
  id: string;
  title?: string;
  message: string;
  level?: 'info' | 'warning' | 'critical';
  showOnce?: boolean;
  expiresAt?: string;
  link: string;
};

export interface Branch {
  id?: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface BranchStockItem {
  branch_id: string;
  branch_name: string;
  product_id: string;
  product_name: string;
  product_description: string;
  quantity: number;
}