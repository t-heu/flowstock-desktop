import './index.css'
import React, {useState} from 'react'
import { AuthProvider, useAuth } from './components/auth/auth-provider'

import Home from './screens/home/page'
import Login from './screens/login/page'
import Produtos from './screens/produtos/page'
import Branches from './screens/branches/page'
import Entrada from './screens/entrada/page'
import Saida from './screens/saida/page'
import Filiais from './screens/filiais/page'
import Users from './screens/users/page'
import Reports from './screens/relatorios/page'

import { SidebarWrapper } from './components/SidebarWrapper'

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando...</div>
  if (!user) return <Login />

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <SidebarWrapper 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {currentPage === 'dashboard' && <Home />}
        {currentPage === 'produtos' && <Produtos />}
        {currentPage === 'branches' && <Branches />}
        {currentPage === 'entrada' && <Entrada />}
        {currentPage === 'saida' && <Saida />}
        {currentPage === 'filiais' && <Filiais />}
        {currentPage === 'users' && <Users />}
        {currentPage === 'relatorios' && <Reports />}
      </main>
    </div>
  )
}

export default App
