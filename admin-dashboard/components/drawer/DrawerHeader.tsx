interface DrawerHeaderProps {
  mode: 'view' | 'edit';
  onClose: () => void;
}

export default function DrawerHeader({ mode, onClose }: DrawerHeaderProps) {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-start justify-between gap-3 z-10 sm:px-5 sm:items-center">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-gray-900">
          {mode === 'view' ? 'User Details' : 'Edit User Details'}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5 wrap-break-word">
          {mode === 'view'
            ? 'View user information'
            : 'View and manage user information'}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
