import { useState, type FormEvent } from "react"
import { Lock, User, Eye, EyeOff } from "lucide-react"

import { useAuth } from "../context/AuthProvider"
import { useToast } from "../context/ToastProvider"

import logo from "../assets/icon.png";
import theu from "../assets/theu.png";

export default function LoginPage() {
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await window.api.loginUser(username, password)
      
      if (!result.success) {
        showToast(result.error || "Usuário ou senha inválidos", "error");
        return
      }
      
      setUser(result.data.user)
      showToast("Login realizado com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro ao fazer login:", err)
      showToast("Falha ao tentar logar: " + (err?.message || "Erro desconhecido"), "error");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 from-gray-100 via-white to-gray-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all">
      <div className="w-full max-w-md ">

        {/* Logo + Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-90">
            <img src={logo} className="w-14 h-14 rounded-lg shadow-sm" />
            
            <span className="text-gray-500 dark:text-gray-400 text-sm">•</span>

            <img src={theu} title="by theu" className="w-10 h-10 rounded-lg opacity-80" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            desenvolvido por theu
          </p>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Gestão de estoque de materiais interno
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Plataforma corporativa para controle de estoque e movimentações internas. Faça login para acessar.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                placeholder="ex: admin"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-sm bg-white focus:outline-none dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                placeholder="********"
                required
              />

              {/* Ícone de mostrar/ocultar senha */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Entre em contato com admin para criar uma conta
          </p>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2c5396] dark:bg-white text-white dark:text-black py-3 rounded-sm font-semibold tracking-wide shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
