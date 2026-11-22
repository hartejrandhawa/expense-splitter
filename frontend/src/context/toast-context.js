import { createContext, useContext } from "react";

export const ToastContext = createContext(() => {});

/** const toast = useToast(); toast("Expense added"); */
export function useToast() {
  return useContext(ToastContext);
}
