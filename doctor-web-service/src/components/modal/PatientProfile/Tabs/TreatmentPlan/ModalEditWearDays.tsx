import {Dispatch, FC, SetStateAction} from 'react'
import Button from '../../../../atom/Buttons/Button'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {wearDaysList} from '../../../../../utils/Constant'
import DropdownPrimaryNormal from '../../../../atom/Dropdown/DropdownPrimaryNormal'
import {useDispatch} from 'react-redux'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import {SVG_CALENDER, SVG_CROSS, SVG_INFO_PRIMARY} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'

import {ERROR_CHANGE_WEAR_DAYS} from '../../../../../utils/MessageConstant'
import {setIsEditWearDaysModelOpen} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'

const initialValues = {
  changeWearDays: '',
}
const schema = Yup.object().shape({
  changeWearDays: Yup.string().required(ERROR_CHANGE_WEAR_DAYS),
})

interface ModalEditWearDaysInterface {
  setIsConfirmEditWearDaysModalOpen: Dispatch<SetStateAction<boolean>>
  setSelectedWearDays: Dispatch<SetStateAction<number>>
}

const ModalEditWearDays: FC<ModalEditWearDaysInterface> = ({
  setIsConfirmEditWearDaysModalOpen,
  setSelectedWearDays,
}: ModalEditWearDaysInterface) => {
  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues,
    validationSchema: schema,
    onSubmit: async () => {
      dispatch(setIsEditWearDaysModelOpen(false))
      setIsConfirmEditWearDaysModalOpen(true)
    },
  })

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      <form className=' bg-white w-[37%] rounded-lg p-6 shadow-lg' onSubmit={formik.handleSubmit}>
        <div className='flex justify-between items-center'>
          <BackGroundSVG
            svg={SVG_CALENDER}
            width='26'
            height='26'
            className='w-16 h-16 bg-primarySupport rounded-full'
          />
          <div onClick={() => dispatch(setIsEditWearDaysModelOpen(false))}>
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>Edit Wear Days Details</div>
          <div className='mt-2 h-5 text-textColor text-base font-normal'>
            Edit the wear days for the selected aligner
          </div>
        </div>
        <div className='w-[100%] mt-8'>
          <DropdownPrimaryNormal
            name='changeWearDays'
            className='h-12 mt-1'
            label='Recommended wear days'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={true}
            options={wearDaysList}
            setData={setSelectedWearDays}
          />
        </div>

        <div className='w-full h-10 mt-7 px-3.5 py-2.5 bg-primarySupport rounded-lg justify-start items-center gap-2 inline-flex'>
          <CommonSVG svg={SVG_INFO_PRIMARY} width='24' height='24' />
          <div className='text-primaryColor text-base font-semibold '>
            Wear days will be changed for the selected aligners only
          </div>
        </div>
        <div className='mt-7'>
          <Button text={'Update Wear Days'} className='h-12' />
        </div>
      </form>
    </div>
  )
}

export default ModalEditWearDays
