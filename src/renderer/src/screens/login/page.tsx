import { useState, type FormEvent, useEffect } from "react"
import { Lock, User } from "lucide-react"
import { useAuth } from "../../components/auth/auth-provider"
import { NoticeModal, Notice } from '../../components/NoticeModal';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black/10 rounded-full mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistema de Estoque</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-black text-gray-900 dark:text-white"
                placeholder="Digite seu usuário"
                required
              />
            </div>
          </div>

          {/* senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-black text-gray-900 dark:text-white"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}
