import { useToastStore } from '@/stores/toastStore';

const toastStyleByType: Record<'success' | 'error' | 'info', string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700'
};

const GlobalToast = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 z-[70] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => removeToast(toast.id)}
          className={`w-full text-left rounded-lg border px-4 py-3 shadow-lg transition-colors ${toastStyleByType[toast.type]}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </button>
      ))}
    </div>
  );
};

export default GlobalToast;
