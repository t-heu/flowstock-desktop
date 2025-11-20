export function ModalBase({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "100px",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg"
      >
        {children}
      </div>
    </div>
  );
}
