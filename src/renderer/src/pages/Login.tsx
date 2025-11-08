import { useState, type FormEvent, useEffect } from "react"
import { Lock, User } from "lucide-react"
import { useAuth } from "../components/auth/auth-provider"
import { NoticeModal, Notice } from '../components/NoticeModal';

import logo from "../assets/icon.png";

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('seenNotices') || '[]');
    } catch {
      return [];
    }
  });

  // Carregar aviso remoto
  useEffect(() => {
    async function loadNotice() {
      try {
        const data = await window.api.fetchNotice(
          'https://gist.githubusercontent.com/t-heu/3dbf7d48d0a06fed3f8d61d720ee62f4/raw/93578613298f0d9a124e9dca8d921072459a9c9b/noticeApp.json'
        );
        if (!data) return;
        if (data.showOnce && seenIds.includes(data.id)) return;
        setNotice(data);
      } catch (err) {
        console.warn('Erro ao buscar notice via ipcMain:', err);
      }
    }
    loadNotice();
  }, [seenIds]);

  const handleCloseNotice = () => {
    if (notice?.showOnce) {
      const updated = Array.from(new Set([...seenIds, notice.id]));
      setSeenIds(updated);
      localStorage.setItem('seenNotices', JSON.stringify(updated));
    }
    setNotice(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const success = await login(username, password)
    if (!success) setError("Usuário ou senha inválidos")
    setLoading(false)
  }

  return (
    <>
      <NoticeModal notice={notice} onClose={handleCloseNotice} />

      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all">

        <div className="w-full max-w-md backdrop-blur-xl bg-white/90 dark:bg-slate-800/70 border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-10 animate-fadeIn">

          {/* Logo + Título */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Logo"
              className="w-16 h-16 mx-auto opacity-90 rounded-xl mb-4 shadow-sm"
            />

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Sistema de Estoque
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Acesse sua conta para continuar
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
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-black focus:border-black"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold tracking-wide shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
