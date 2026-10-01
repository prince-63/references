import FeatureDetails from './FeatureDetails'
import {FeatureDetailsProps} from './types'

const FeatureBody = ({title, is_active}: FeatureDetailsProps) => {
  const sectionTitle = is_active ? 'Benefits' : 'Unavailable features'

  return (
    <div className='p-4 space-y-3'>
      <div className={`font-medium text-textColor`}>{sectionTitle}</div>
      <FeatureDetails title={title} is_active={is_active} />
    </div>
  )
}

export default FeatureBody
