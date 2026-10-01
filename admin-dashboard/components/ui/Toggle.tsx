interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({
  enabled,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 sm:items-center">
      {label && (
        <div className="min-w-0 flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 wrap-break-word">
            {label}
          </label>
        </div>
      )}
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-200 ${
          enabled ? 'bg-[#735bf2] shadow-sm' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={label}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
            enabled ? 'translate-x-5.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
