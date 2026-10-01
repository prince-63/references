import {DataWrapper} from './DataWrapper'
import {ConditionalValueDiv} from './ConditionalValueDiv'
import hasValue from 'utils/hasValue'
import {
  formatPluralizedString,
  formatPluralizedStringOnly,
  getFirstLetterCapitalOfWord,
  removeSign,
  sliceArray,
} from 'utils/ConstFunctions'
import moment from 'moment'
import {IAlignerTrackingAligner} from '../types/summary.types'
import compilanceType from '@constants/compilanceType'
import clsx from 'clsx'
import When from 'components/when/When'

const AlignerTrackingSummary = ({
  alignerTracking,
  isManual,
}: {
  alignerTracking: any
  isManual: boolean
}) => {
  const AlignerList: IAlignerTrackingAligner[] = sliceArray(
    alignerTracking?.aligners,
    alignerTracking?.current_aligner_no + 1
  )

  return (
    <div>
      <DataWrapper
        title='Current aligner details'
        isShow={
          alignerTracking?.current_aligner_no ||
          alignerTracking?.aligners ||
          alignerTracking?.recommended_hours_to_wear_aligners ||
          alignerTracking?.recommended_hours_to_wear_aligners
        }
        showBorder={hasValue(AlignerList)}
      >
        <ConditionalValueDiv
          label='Current aligner'
          value={
            getFirstLetterCapitalOfWord(alignerTracking?.current_aligner?.jaw_type) +
            ' ' +
            alignerTracking?.current_aligner?.sr_no
          }
        />
        <ConditionalValueDiv
          label='Wear days'
          value={
            <div className='flex flex-wrap  gap-1 text-black'>
              <div className='flex '>
                <div className='w-12'>
                  {hasValue(alignerTracking?.current_aligner?.start_date)
                    ? moment(alignerTracking?.current_aligner?.start_date).format('DD MMM')
                    : null}
                </div>

                <div>
                  {'- '}{' '}
                  {hasValue(alignerTracking?.current_aligner?.end_date)
                    ? moment(alignerTracking?.current_aligner?.end_date).format('DD MMM YYYY')
                    : null}
                </div>
              </div>
              <div className='hidden md:block'>{' • '}</div>
              <div>
                {'('}
                {formatPluralizedString(alignerTracking?.days_to_wear_each_aligner, 'day')}
                {')'}
              </div>
            </div>
          }
        />
        <ConditionalValueDiv
          label='Compliance'
          value={
            hasValue(alignerTracking?.current_aligner_compliance) && !isManual
              ? getFirstLetterCapitalOfWord(alignerTracking?.current_aligner_compliance)
              : null
          }
        />
        <ConditionalValueDiv
          label='Delay (if any)'
          value={
            hasValue(alignerTracking?.current_aligner?.change_offset) && !isManual ? (
              <span className='text-red text-sm'>
                Delayed by {removeSign(alignerTracking?.current_aligner?.change_offset)}{' '}
                {formatPluralizedStringOnly(
                  Number(removeSign(alignerTracking?.current_aligner?.change_offset)),
                  'day'
                )}
              </span>
            ) : null
          }
        />
      </DataWrapper>

      <DataWrapper
        title='Other aligner details'
        showBorder={false}
        isShow={hasValue(AlignerList)}
        className='text-[16px] '
      >
        <div className='w-full overflow-x-auto'>
          <table className='w-full min-w-[600px]' border={1} cellPadding={5} cellSpacing={0}>
            <thead className='w-full'>
              <tr className='border-b border-mediumGray text-start h-10'>
                <th className='pb-4 text-sm text-start w-24'>Aligner number</th>
                <th className='pb-4 text-sm text-start w-24'>Wear days</th>
                <th className='pb-4 text-sm text-start w-24'>Delay (if any)</th>
                {!isManual && <th className='pb-4 text-sm text-start w-24'>Compliance</th>}{' '}
              </tr>
            </thead>
            <tbody>
              {AlignerList?.map((aligner: IAlignerTrackingAligner) => (
                <tr key={aligner?.sr_no} className='border-b border-mediumGray text-textColor'>
                  <td className='py-4 text-left text-sm'>
                    {getFirstLetterCapitalOfWord(aligner?.jaw_type)} {aligner?.sr_no}
                  </td>
                  <td className='py-4 text-left text-sm'>
                    <div className='text-sm'>
                      {hasValue(aligner?.start_date) && hasValue(aligner?.end_date)
                        ? `${moment(aligner?.start_date).format('DD MMM')} - ${moment(
                            aligner?.change_date ?? aligner?.end_date
                          ).format('DD MMM YYYY')}`
                        : '--'}
                    </div>
                  </td>
                  <td className='py-4 text-left text-sm text-textColor'>
                    <When isTrue={hasValue(aligner?.change_offset) && !isManual}>
                      <When isTrue={aligner?.change_offset ? aligner?.change_offset > 0 : false}>
                        <span className='text-red'>
                          Delayed by {removeSign(aligner?.change_offset)}{' '}
                          {formatPluralizedStringOnly(
                            Number(removeSign(aligner?.change_offset)),
                            'day'
                          )}
                        </span>
                      </When>
                      <When isTrue={aligner?.change_offset ? aligner?.change_offset < 0 : false}>
                        <span className='text-red'>
                          Early by {removeSign(aligner?.change_offset)}{' '}
                          {formatPluralizedStringOnly(
                            Number(removeSign(aligner?.change_offset)),
                            'day'
                          )}
                        </span>
                      </When>
                    </When>
                    {(aligner?.change_offset === null ||
                      aligner?.change_offset === 0 ||
                      isManual) && <span className='text-textColor'>No delay</span>}
                  </td>
                  {!isManual && (
                    <td className='py-4 text-left text-sm'>
                      {hasValue(aligner?.aligner_compliance) && !isManual ? (
                        <span
                          className={clsx(
                            aligner.aligner_compliance === compilanceType.POOR
                              ? 'text-red'
                              : 'text-textColor'
                          )}
                        >
                          {getFirstLetterCapitalOfWord(aligner.aligner_compliance)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataWrapper>
    </div>
  )
}

export default AlignerTrackingSummary
