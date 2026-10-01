import actionTypes from '@constants/actionTypes'
import ForceChangePrimaryIcon from 'assets/icons/ForceChangePrimaryIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {SVG_CROSS, SVG_CROSS_RED} from 'utils/SvgConstants'

interface IForceAlignerData {
  handleOnClose: (option: ActionItem) => void
  handleActionOnClick: (option: ActionItem) => void
}

const ModalForceAlignerWarning = (props: IForceAlignerData) => {
  const {handleOnClose, handleActionOnClick} = props

  const callForceAlignerChange = async () => {
    handleActionOnClick(actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL)
  }
  return (
    <ModalLayout className='w-[628px]'>
      <div className='px-4'>
        <div className='flex justify-between items-center mt-3'>
          <div className='w-16 h-16 bg-redSupport rounded-full flex justify-center items-center'>
            <ForceChangePrimaryIcon color='red' />
          </div>
          <div
            className='cursor-pointer'
            onClick={() => {
              handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER_WARNING_MODAL)
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-3 text-'>
          <div className='text-2xl font-bold'>Patient tracked data found</div>
          <div className='text-[16px] font-normal text-textColor mt-2'>
            Looks like your patient has already tracked data on and after the aligner change date
            mentioned by you
          </div>
          <div className='rounded-lg w-full border border-mediumGray mt-4 p-4'>
            <div className='text-[16px] font-medium '>
              If you continue with the same change date
            </div>
            <div className='flex gap-[10px] text-textColor items-center font-medium text-[14px] mt-2 pl-1'>
              <CommonSVG svg={SVG_CROSS_RED} width='10' height='10' />
              <span>
                The data that your patient has tracked will be reset for the particular aligner
              </span>
            </div>
            <div className='flex gap-[10px] text-textColor items-center font-medium text-[14px] mt-2 pl-1'>
              <CommonSVG svg={SVG_CROSS_RED} width='10' height='10' />
              <span>Compliance of patient will change accordingly</span>
            </div>
          </div>

          <div className='mt-7 flex gap-8'>
            <AntdButton
              text={'Go back'}
              className='h-12 border !border-red w-full hover:!bg-white hover:!text-red text-red'
              onClick={() => handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER_WARNING_MODAL)}
            />
            <AntdButton
              text={'Continue'}
              className='h-12 !bg-red w-full hover:!bg-red text-white'
              onClick={() => callForceAlignerChange()}
            />
          </div>
        </div>
      </div>
    </ModalLayout>
  )
}

export default ModalForceAlignerWarning
