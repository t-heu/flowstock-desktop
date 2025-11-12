import { useState, useEffect } from 'react';
import Modal from 'react-modal';

export type Notice = {
  id: string;
  title?: string;
  message: string;
  level?: 'info' | 'warning' | 'critical';
  showOnce?: boolean;
  expiresAt?: string;
  link?: string;
};

export const NoticeModal = () => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('seenNotices') || '[]');
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Carrega o aviso remoto apenas uma vez
  useEffect(() => {
    let mounted = true;

    async function loadNotice() {
      try {
        const data = await window.api.fetchNotice();
        if (!mounted || !data) return;

        const alreadySeen = data.showOnce && seenIds.includes(data.id);
        if (!alreadySeen) setNotice(data);
      } catch (err) {
        console.warn('Erro ao buscar notice via ipcMain:', err);
      }
    }

    loadNotice();

    return () => {
      mounted = false;
    };
  }, [seenIds]);

  // Abre ou fecha o modal quando notice muda
  useEffect(() => {
    setIsOpen(!!notice);
  }, [notice]);

  const handleCloseNotice = () => {
    if (notice?.showOnce) {
      const updated = Array.from(new Set([...seenIds, notice.id]));
      setSeenIds(updated);
      localStorage.setItem('seenNotices', JSON.stringify(updated));
    }
    setNotice(null);
  };

  const isExpired = notice?.expiresAt
  ? new Date(notice.expiresAt).getTime() < Date.now()
  : false;

  return (
    <Modal
      isOpen={isOpen && !!notice && !isExpired}
      onRequestClose={handleCloseNotice}
      ariaHideApp={false}
      className="max-w-md mx-auto mt-24 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50"
    >
      {notice && (
        <>
          <h2 className="text-xl font-bold mb-4">
            {notice.title || (notice.level === 'critical' ? 'Atenção' : 'Aviso')}
          </h2>
          <p className="mb-6">{notice.message}</p>
          <div className="text-right flex justify-end gap-2">
            {notice.link && (
              <a
                href={notice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Ir para link
              </a>
            )}
            <button
              onClick={handleCloseNotice}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
