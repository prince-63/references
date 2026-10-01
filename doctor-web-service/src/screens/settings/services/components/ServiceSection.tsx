import ServiceCheckboxRow from './ServiceCheckboxRow'
import type {OrgServicesState} from './types'

type ServiceKey = keyof OrgServicesState['services']

type Item = {key: ServiceKey; label: string}

type Props = {
  title: string
  items: Item[]
  services: OrgServicesState['services']
  disabled?: boolean
  onToggle: (k: ServiceKey) => void
  description?: string | null
}

function ServiceSection({title, description, items, services, disabled, onToggle}: Props) {
  const disableDescription = 'Not available under your current plan'
  return (
    <div>
      <h4 className='font-medium mb-3'>{title}</h4>
      {description ? (
        <p className='text-sm text-gray-500 mb-3'>{description}</p>
      ) : (
        <p className='text-sm text-gray-500 mb-3'>{disableDescription}</p>
      )}
      <div className='space-y-2'>
        {items.map((s) => (
          <ServiceCheckboxRow
            key={String(s.key)}
            id={`svc-${String(s.key)}`}
            label={s.label}
            checked={Boolean(services[s.key])}
            disabled={Boolean(disabled)}
            onChange={() => onToggle(s.key)}
          />
        ))}
      </div>
    </div>
  )
}

export default ServiceSection
