interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-2xl shadow-xl border border-black/5 p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink/60 mb-6">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink/70 hover:bg-black/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-danger text-white py-2.5 text-sm font-medium hover:opacity-90 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}