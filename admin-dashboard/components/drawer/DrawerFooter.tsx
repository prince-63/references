import Button from '../ui/Button';

interface DrawerFooterProps {
  onClose: () => void;
  onSave: () => void;
  hasChanges: boolean;
  saving: boolean;
}

export default function DrawerFooter({
  onClose,
  onSave,
  hasChanges,
  saving,
}: DrawerFooterProps) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-3 z-10 sm:px-8 sm:py-5 sm:flex-row sm:justify-between sm:items-center">
      <p className="text-sm text-gray-500">
        {hasChanges ? 'You have unsaved changes' : 'No changes made'}
      </p>
      <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:gap-3">
        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={!hasChanges || saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
