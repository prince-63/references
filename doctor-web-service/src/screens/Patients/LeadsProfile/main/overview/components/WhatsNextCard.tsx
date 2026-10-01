import InfoIcon from 'assets/icons/InfoIcon'
import DropdownSvg from 'assets/icons/DropdownSvg'

interface WhatsNextCardProps {
  title: string
  description: string
  ctaLabel: string
  onCtaClick: () => void
}

const WhatsNextCard = ({title, description, ctaLabel, onCtaClick}: WhatsNextCardProps) => {
  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6'>
      <div className='flex items-start gap-4'>
        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50'>
          <InfoIcon color='#3B82F6' width='24' height='24' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-black mb-2'>What's Next? {title}</h3>
          <p className='text-sm text-gray-600 mb-4'>{description}</p>
          <button
            onClick={onCtaClick}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors'
          >
            {ctaLabel}
            <DropdownSvg color='#ffffff' width='12' height='12' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatsNextCard
