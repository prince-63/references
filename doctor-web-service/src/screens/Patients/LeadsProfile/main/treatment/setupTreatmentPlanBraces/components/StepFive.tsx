import InputTextArea from 'components/atom/Inputs/InputTextArea'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {FormikProps} from 'formik'

const StepFive = ({formik}: {formik: FormikProps<any>}) => {
  return (
    <BorderedCard
      header={{
        title: 'Remarks',
        icon: 5,
      }}
      className='bg-primaryColor text-white'
    >
      <InputTextArea
        name='remarks'
        formik={formik}
        maxLength={200}
        className='py-2 rounded-lg border border-mediumGray h-16'
        classNameLabel='text-stone-500 text-lg font-medium'
      />
    </BorderedCard>
  )
}

export default StepFive
