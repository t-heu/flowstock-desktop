import './index.css'
import React, {useState} from 'react'
import { Toaster } from "react-hot-toast"

import { AuthProvider, useAuth } from './context/auth-provider'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import Branches from './pages/Branches'
import ProductInput from './pages/ProductInput'
import ProductOutput from './pages/ProductOutput'
import Filiais from './pages/BranchStock'
import Users from './pages/Users'
import Reports from './pages/Reports'
import ProfilePage from './pages/ProfilePage'

import { SidebarWrapper } from './components/SidebarWrapper';
import LoadingSpinner from "./components/LoadingSpinner";

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={60} />
      </div>
    );
  }
  if (!user) return <Login />

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <SidebarWrapper 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'produtos' && <Products />}
        {currentPage === 'branches' && <Branches />}
        {currentPage === 'entrada' && <ProductInput />}
        {currentPage === 'saida' && <ProductOutput />}
        {currentPage === 'filiais' && <Filiais />}
        {currentPage === 'users' && <Users />}
        {currentPage === 'relatorios' && <Reports />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  )
}

export default App
