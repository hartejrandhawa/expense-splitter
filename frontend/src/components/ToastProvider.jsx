import { useCallback, useRef, useState } from "react";
import { ToastContext } from "../context/toast-context";
import Icon from "./Icon";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const show = useCallback((message) => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icon name="check" size={16} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
