import { useEffect, useRef } from "react";
import Icon from "./Icon";

/**
 * Built on the native <dialog> element: showModal() gives us focus trapping,
 * Esc-to-close, an inert background and a ::backdrop for free.
 */
export default function Modal({ open, onClose, title, children, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal() focuses the first focusable element (the close button), and React's
      // autoFocus has already fired by now, so pick the intended starting point ourselves.
      const target =
        dialog.querySelector("[data-autofocus]") ?? dialog.querySelector("input:not([type=checkbox]), select");
      target?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        // Clicking the backdrop (the dialog element itself, outside the panel) closes it.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
    >
      {open && (
        <div className="modal-panel">
          <header className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
