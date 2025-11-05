import React from 'react';
import Modal from 'react-modal';

export type Notice = {
  id: string;
  title?: string;
  message: string;
  level?: 'info' | 'warning' | 'critical';
  showOnce?: boolean;
  expiresAt?: string;
};

interface NoticeModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notice, onClose }) => {
  if (!notice) return null;

  // Expirado? não mostrar
  if (notice.expiresAt && new Date(notice.expiresAt) < new Date()) return null;

  return (
    <Modal
      isOpen={!!notice}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="max-w-md mx-auto mt-24 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-bold mb-4">
        {notice.title || (notice.level === 'critical' ? 'Atenção' : 'Aviso')}
      </h2>
      <p className="mb-6">{notice.message}</p>
      <div className="text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};
