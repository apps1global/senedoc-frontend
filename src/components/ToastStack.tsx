"use client";

import type { Toast } from "@/lib/useToasts";

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="bg-teal-deep text-white text-sm px-4 py-3 rounded-lg shadow-lg">
          {t.message}
        </div>
      ))}
    </div>
  );
}
