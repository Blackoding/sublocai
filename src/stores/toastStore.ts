import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
};

const createToastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type = 'info', duration = 3500) => {
    const id = createToastId();
    const toast: ToastItem = { id, message, type, duration };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
  }
}));
