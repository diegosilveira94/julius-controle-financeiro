import { useEffect } from "react";

const sizes = {
  md: "max-w-lg",
  xl: "max-w-5xl",
};

function Modal({ open, title, onClose, size = "md", children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative z-10 w-full ${sizes[size] || sizes.md} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-surface shadow-xl`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-xl leading-none text-gray-400 hover:text-gray-200"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
