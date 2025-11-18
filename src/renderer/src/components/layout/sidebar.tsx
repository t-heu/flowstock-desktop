import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  BarChart3,
  LogOut,
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  Warehouse,
  User
} from "lucide-react"

import { useAuth } from '../../context/auth-provider'

import {can} from "../../lib/permissions"

const navItems = [
  { title: "Dashboard", key: "dashboard", icon: LayoutDashboard },
  { title: "Produtos", key: "produtos", icon: Package },
  { title: "Entrada de Estoque", key: "entrada", icon: TrendingUp },
  { title: "Saída de Estoque", key: "saida", icon: TrendingDown },
  { title: "Relatórios", key: "relatorios", icon: BarChart3 },
  { title: "Estoque das Filiais", key: "filiais", icon: Warehouse }
]

export default function Sidebar({
  currentPage,
  onNavigate
}: {
  currentPage: string
  onNavigate: (page: string) => void
}) {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão hambúrguer para mobile */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-black">FlowStock</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen flex flex-col`}
      >
        {/* Header Desktop */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 hidden md:block">
          <h1 className="text-xl font-bold text-black">FlowStock</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestão de estoque interno</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key)
                  setIsOpen(false)
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-sm transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-[#2c5396] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.title}
              </button>
            )
          })}

          {user && can(user.role, "manageBranches") && (
            <button
              onClick={() => {
                onNavigate("branches")
                setIsOpen(false)
              }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-sm transition-colors text-sm font-medium ${
                currentPage === "branches"
                  ? "bg-[#2c5396] text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <MapPin className="w-5 h-5" />
              Filiais
            </button>
          )}

          {user && can(user.role, "viewUsers") && (
            <button
              onClick={() => {
                onNavigate("users")
                setIsOpen(false)
              }}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-sm transition-colors text-sm font-medium ${
                currentPage === "users"
                  ? "bg-[#2c5396] text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              <Users className="w-5 h-5" />
              Usuários
            </button>
          )}

          <button
            onClick={() => {
              onNavigate("profile")
              setIsOpen(false)
            }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-sm transition-colors text-sm font-medium ${
              currentPage === "profile"
                ? "bg-[#2c5396] text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <User className="w-5 h-5" />
            Meu Perfil
          </button>
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-sm bg-gray-100 dark:bg-slate-700">
              <div className="w-8 h-8 rounded-full bg-[#2c5396] flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name} ({user.role})
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-red-700 w-full flex items-center gap-3 px-4 py-2 rounded-sm text-sm font-medium dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
