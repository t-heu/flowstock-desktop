import { useAuth } from "../context/auth-provider"
import Sidebar from "./layout/sidebar"

interface SidebarWrapperProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function SidebarWrapper({ currentPage, onNavigate }: SidebarWrapperProps) {
  const { user } = useAuth()

  if (!user) return null

  return <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
}
