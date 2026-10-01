import ClockIcon from 'assets/icons/ClockIcon'
import clsx from 'clsx'
import getColorPalette from 'utils/getColorPalette'

const RequestDeletion = () => {
  return (
    <div className='md:w-[624px] w-full border border-mediumGray rounded-lg p-4'>
      <div className='mb-4'>
        <div
          className={clsx('w-12 h-12 rounded-full flex justify-center items-center bg-lightGray')}
        >
          <ClockIcon color={getColorPalette().textColor} />
        </div>
      </div>

      <div className='max-h-[70vh] flex flex-col gap-4'>
        <div>
          <p className='font-semibold text-2xl '>{'Your request has been submitted'}</p>
          <p className=' text-textColor text-base font-normal'>
            {
              'Thanks for reaching out. Our team is reviewing your request and will contact you shortly to confirm and finalize the deletion.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default RequestDeletion
