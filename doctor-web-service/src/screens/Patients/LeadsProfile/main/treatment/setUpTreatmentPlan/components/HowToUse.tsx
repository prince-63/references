import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'

const HowToUse = () => {
  return (
    <div className='flex flex-col gap-3 md:flex-row bg-primarySupport border border-primaryColor p-4 rounded-lg w-full justify-between'>
      <div className='flex flex-col md:flex-row gap-3'>
        <InfoIcon color={getColorPalette().primaryColor} height='28' width='28' />
        <div>
          <p className='text-black md:text-primaryColor font-semibold text-base'>How to use?</p>
          <div className='text-textColor font-medium text-sm md:text-base'>
            <ul>
              <li>1. Enter the aligner range for each jaw in the plan</li>
              <li>2. Click on the box to de-select an aligner assigned to both jaws</li>
              <li>3. The final table gets generated based on the value added by you</li>
            </ul>
          </div>
        </div>
      </div>
      <div>
        {/* <button
          type='button'
          className='border border-primaryColor rounded-[4px] font-bold px-2 py-2 text-primaryColor flex justify-between items-center gap-2'
          onClick={() => {}}
        >
          Show video
          <CommonSVG svg={SVG_PURPLE_RIGHT_ARROW} width='13' height='9' color='black' />
        </button> */}
      </div>
    </div>
  )
}

export default HowToUse
