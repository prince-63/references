import CommonSVG from 'components/atom/SVG/CommonSVG'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {capitalizeFirstLetter, formatPluralizedString, secToHour} from 'utils/ConstFunctions'
import {SVG_LAYERS, SVG_TIMER_ORANGE, SVG_TIMER_PRIMARY} from 'utils/SvgConstants'

const Statistics = ({alignerUpdateDetails}: {alignerUpdateDetails: IAlignerUpdateDetails}) => {
  return (
    <div className='flex flex-col gap-4 border border-mediumGray rounded-lg py-4 px-4 '>
      <div>
        <div className=' text-black text-base font-semibold '>
          Statistics of {capitalizeFirstLetter(alignerUpdateDetails?.aligner?.jaw_type)}{' '}
          {alignerUpdateDetails?.aligner?.sr_no} aligner
        </div>
        <p className='text-sm font-medium text-textColor '>
          This data is always available in wear stats
        </p>
      </div>
      <div className=' justify-between gap-7 hidden md:flex'>
        <div className=' bg-white rounded-lg shadow p-4 w-full'>
          <div className='w-10 h-9 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_LAYERS} width='18' height='18' />
          </div>
          <div className='text-textColor text-[13px] font-medium mt-4'>Compliance</div>
          <div className='text-black text-xs font-semibold '>
            {capitalizeFirstLetter(alignerUpdateDetails?.aligner?.compliance)}
          </div>
        </div>
        <div className=' bg-white rounded-lg shadow p-4 w-full'>
          <div className='w-10 h-9 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_TIMER_PRIMARY} width='22' height='22' />
          </div>
          <div className='text-textColor text-[13px] font-medium mt-4'>Average wear time</div>
          <div className='text-black text-xs font-semibold '>
            {formatPluralizedString(
              secToHour(alignerUpdateDetails.aligner?.avg_time_in_secs ?? 0),
              'Hour'
            )}
          </div>
        </div>
        <div className=' bg-white rounded-lg shadow p-4 w-full'>
          <div className='w-10 h-9 p-2 bg-lightOrange rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_TIMER_ORANGE} width='22' height='22' />
          </div>
          <div className='text-textColor text-[13px] font-medium mt-4'>Recommended wear time</div>
          <div className='text-black text-xs font-semibold '>
            {formatPluralizedString(
              alignerUpdateDetails?.recommended_hours_to_wear_aligners,
              'Hour'
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-col md:hidden gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-9 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_LAYERS} width='18' height='18' />
          </div>
          <div>
            <div className='text-textColor text-[13px] font-medium '>Compliance</div>
            <div className='text-black text-xs font-semibold '>
              {capitalizeFirstLetter(alignerUpdateDetails?.aligner?.compliance)}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-9 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_TIMER_PRIMARY} width='22' height='22' />
          </div>
          <div className='flex flex-col'>
            <div className='text-textColor text-[13px] font-medium '>Average wear time</div>
            <div className='text-black text-xs font-semibold '>
              {formatPluralizedString(
                secToHour(alignerUpdateDetails.aligner?.avg_time_in_secs ?? 0),
                'Hour'
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-9 p-2 bg-lightOrange rounded-lg justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_TIMER_ORANGE} width='22' height='22' />
          </div>
          <div>
            <div className='text-textColor text-[13px] font-medium '>Recommended wear time</div>
            <div className='text-black text-xs font-semibold '>
              {formatPluralizedString(
                alignerUpdateDetails?.recommended_hours_to_wear_aligners,
                'Hour'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
