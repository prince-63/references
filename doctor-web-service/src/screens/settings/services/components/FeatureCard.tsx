import FeatureBody from './FeatureBody'
import FeatureHeader from './FeatureHeader'
import {FeatureCardProps} from './types'

const FeatureCard = ({title, description, is_active, callChangeStatus}: FeatureCardProps) => {
  return (
    <div className={`border border-mediumGray rounded-lg overflow-hidden shadow-sm`}>
      <FeatureHeader
        title={title}
        description={description}
        is_active={is_active}
        callChangeStatus={callChangeStatus}
      />
      <FeatureBody title={title} is_active={is_active} />
    </div>
  )
}

export default FeatureCard
