import CheckIcon from 'assets/icons/CheckIcon'
import {FeatureDetailsProps, FeatureItemProps} from './types'
import CrossIcon from 'assets/icons/CrossIcon'
import {useMemo} from 'react'

const FEATURE_DETAILS = {
  'Braces Add-On': {
    active: [
      'Support cases requiring braces treatment in addition to aligners.',
      'Seamlessly track patient progress across both modalities.',
      'Allow patients to log updates and check-ins for braces treatment.',
      'Monitor wear patterns, progress, and issues.',
      'Keep all braces and aligner records, notes, and communication in one place.',
    ],
    inactive: [
      'Braces treatment tracking and progress updates.',
      'Braces-specific check-ins or issue reporting.',
      'Monitoring of braces treatment stages or timelines.',
      'Viewing combined progress across aligners and braces.',
    ],
  },
  'Billing Add-On': {
    active: [
      'Create and send invoices for treatments and services.',
      'Track payment status and outstanding balances in one place.',
      'Accept and record payments easily.',
      'Access a full billing history for every patient.',
      'Reduce manual work with automated updates and simplified record-keeping.',
    ],
    inactive: [
      'Creating or sending invoices.',
      'Tracking payments or outstanding balances.',
      'Viewing billing history.',
      'Recording payments in the system.',
    ],
  },
} as const

const FeatureDetails = ({title, is_active}: FeatureDetailsProps) => {
  const details = useMemo(() => {
    const featureData =
      FEATURE_DETAILS[title as keyof typeof FEATURE_DETAILS] || FEATURE_DETAILS['Billing Add-On']
    const items = is_active ? featureData.active : featureData.inactive

    return items.map((item, index) => (
      <CheckItem
        key={`${title}-${is_active ? 'active' : 'inactive'}-${index}`}
        data={item}
        isChecked={is_active}
      />
    ))
  }, [title, is_active])

  return <div className='space-y-2'>{details}</div>
}

const CheckItem = ({data, isChecked}: FeatureItemProps & {isChecked: boolean}) => {
  return (
    <div className='flex gap-2 items-center'>
      {isChecked ? <CheckIcon color='#00B383' /> : <CrossIcon color='#f45045' />}
      <div className={`text-sm font-medium`}>{data}</div>
    </div>
  )
}

export default FeatureDetails
