import {useManufacturingDetails} from '../hooks/useManufacturingDetails'

export const AlignerDetails = ({isManufacturing = false}: {isManufacturing?: boolean}) => {
  const {latest_manufacturing_data, unprocessed} = useManufacturingDetails({})

  const data = isManufacturing ? latest_manufacturing_data : unprocessed

  const total = data?.total_aligners ?? '-'

  const upperStart =
    (isManufacturing
      ? latest_manufacturing_data?.upper_aligner_start
      : unprocessed?.upperJaw?.start) ?? 0
  const upperEnd =
    (isManufacturing ? latest_manufacturing_data?.upper_aligner_end : unprocessed?.upperJaw?.end) ??
    0
  const upperTotal = upperEnd !== 0 && upperEnd >= upperStart ? upperEnd + 1 - upperStart : 0

  const lowerStart =
    (isManufacturing
      ? latest_manufacturing_data?.lower_aligner_start
      : unprocessed?.lowerJaw?.start) ?? 0
  const lowerEnd =
    (isManufacturing ? latest_manufacturing_data?.lower_aligner_end : unprocessed?.lowerJaw?.end) ??
    0
  const lowerTotal = lowerEnd !== 0 && lowerEnd >= lowerStart ? lowerEnd + 1 - lowerStart : 0

  return (
    <div className='border border-mediumGray flex flex-col gap-3 p-4 rounded-lg'>
      <div className='text-xl font-semibold'>
        {isManufacturing ? 'Manufactured Aligner quantity' : 'Aligner summary'}
      </div>
      <div className='flex gap-6 text-base font-medium'>
        <div>Total aligners: {total !== 0 ? total : '-'}</div>

        {upperTotal ? (
          <div>
            Upper jaw: {upperTotal || '-'}
            {(upperStart || upperEnd) && (
              <div className='text-textColor font-medium text-sm'>
                (Aligner {upperStart || '-'} - {upperEnd || '-'})
              </div>
            )}
          </div>
        ) : (
          ''
        )}

        {lowerTotal ? (
          <div>
            Lower jaw: {lowerTotal || '-'}
            {(lowerStart || lowerEnd) && (
              <div className='text-textColor font-medium text-sm'>
                (Aligner {lowerStart || '-'} - {lowerEnd || '-'})
              </div>
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}
