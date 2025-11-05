import { useAuth } from "./auth/auth-provider"
import Sidebar from "./layout/sidebar"

interface SidebarWrapperProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function SidebarWrapper({ currentPage, onNavigate }: SidebarWrapperProps) {
  const { user, loading } = useAuth()

  if (loading || !user) return null

  return <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
}
