"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let addToastFn: (toast: Omit<ToastMessage, "id">) => void = () => {};

export function toast(message: string, type: ToastType = "info") {
  addToastFn({ message, type });
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (toast) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...toast, id }]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="relative flex w-80 items-center justify-between overflow-hidden rounded-md bg-white p-4 card-shadow card-border"
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <div className="h-2 w-2 rounded-full bg-success" />}
              {t.type === "error" && <div className="h-2 w-2 rounded-full bg-destructive" />}
              {t.type === "info" && <div className="h-2 w-2 rounded-full bg-accent" />}
              <p className="text-sm font-medium text-foreground">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-1 ${
                t.type === "success" ? "bg-success" : t.type === "error" ? "bg-destructive" : "bg-accent"
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
