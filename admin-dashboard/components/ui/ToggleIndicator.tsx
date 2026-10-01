interface ToggleIndicatorProps {
  enabled: boolean | null;
}

export default function ToggleIndicator({ enabled }: ToggleIndicatorProps) {
  return (
    <div className="inline-flex items-center justify-center">
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
          enabled ? 'bg-[#735bf2]/10' : 'bg-gray-50'
        }`}
        title={enabled ? 'Enabled' : 'Disabled'}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${enabled ? 'bg-[#735bf2]' : 'bg-gray-300'}`}
        />
      </span>
    </div>
  );
}
