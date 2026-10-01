import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlinedRed from 'components/atom/Buttons/ButtonOutlinedRed'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {Dispatch, SetStateAction} from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'
import ListItemWithIcon from '../../alignersTracking/actionModals/components/ListItemWithIcon'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import ReturnIcon from 'assets/icons/ReturnIcon'

const MoveToPreviousAligner = ({
  setIsMoveToPreviousAlignerModalOpen,
  setIsConfirmMoveToPreviousAlignerModalOpen,
  alignerUpdateDetails,
}: {
  setIsMoveToPreviousAlignerModalOpen: Dispatch<SetStateAction<boolean>>
  setIsConfirmMoveToPreviousAlignerModalOpen: Dispatch<SetStateAction<boolean>>
  alignerUpdateDetails:
    | IAlignerUpdateDetails
    | {
        previous_aligner_details: {
          jaw_type?: string | null
          sr_no?: number | null
        }
      }
}) => {
  const treatmentPauseEffectsList = [
    {
      checked: false,
      value: 'Data tracked by your patient for the current aligner will be reset ',
    },
    {
      checked: false,
      value: 'Your patient will have to make the same aligner change again',
    },
  ]
  const alignerName = `${capitalizeFirstLetter(
    alignerUpdateDetails?.previous_aligner_details?.jaw_type ?? ''
  )} ${alignerUpdateDetails?.previous_aligner_details?.sr_no}`
  return (
    <ModalLayout>
      <div className='flex justify-between items-center'>
        <div className='rounded-full p-3 bg-redSupport'>
          <ReturnIcon />
        </div>
        <div
          className='cursor-pointer'
          onClick={() => {
            setIsMoveToPreviousAlignerModalOpen(false)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-black text-2xl font-bold'>
          Do you want to move back to {alignerName}?
        </div>
      </div>
      <div className='border border-textColor rounded-lg p-3 flex flex-col gap-2 mt-4'>
        <p className='text-black font-medium text-base'>
          What happens when you move back to the previous aligner?
        </p>
        <div className='flex flex-col gap-1'>
          {treatmentPauseEffectsList.map((item, index) => (
            <ListItemWithIcon key={index} {...item} />
          ))}
        </div>
      </div>

      <div className='mt-7 flex gap-8'>
        <ButtonOutlinedRed
          text='Go back'
          className='!h-12 text-md !font-semibold'
          onClick={() => {
            setIsMoveToPreviousAlignerModalOpen(false)
          }}
        />
        <AntdButton
          text={'Continue'}
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={() => {
            setIsConfirmMoveToPreviousAlignerModalOpen(true)
            setIsMoveToPreviousAlignerModalOpen(false)
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default MoveToPreviousAligner
