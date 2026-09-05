import { AlertTriangle, Info, Trash2 } from "lucide-react";
import Button from "./Button";
import { Modal } from "./Modal";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'primary'
  loading = false,
}) {
  const getIcon = () => {
    if (variant === "danger") return <Trash2 className="w-5 h-5 text-danger-600" />;
    if (variant === "warning") return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    return <Info className="w-5 h-5 text-primary-600" />;
  };

  const getIconBg = () => {
    if (variant === "danger") return "bg-danger-50 border-danger-200";
    if (variant === "warning") return "bg-amber-50 border-amber-200";
    return "bg-primary-50 border-primary-200";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border ${getIconBg()} flex-shrink-0 mt-0.5`}>
            {getIcon()}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-5">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
