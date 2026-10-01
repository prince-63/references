import treatmentPlanTypeBraces from '@constants/treatmentPlanTypeBraces'
import bracesTreatmentTypeOptionList from '@staticData/bracesTreatmentTypeOptionList'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import InputText from 'components/atom/Inputs/InputText'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import RadioGroups from 'components/RadioGroup/RadioGroups'
import {FC} from 'react'
import {useMediaQuery} from 'react-responsive'
import {FormikProps} from 'formik'
import dayjs from 'dayjs'
interface Props {
  formik: FormikProps<any> // Add the generic type for FormikProps
}

const StepOne: FC<Props> = ({formik}) => {
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  return (
    <BorderedCard
      header={{
        title: 'Treatment details',
        icon: 1,
      }}
      className='bg-primaryColor text-white'
    >
      <div className='flex flex-col md:flex-row gap-2 md:gap-0'>
        <div className='md:w-[50%] w-full'>
          <RadioGroups
            className='rounded-lg h-12'
            options={bracesTreatmentTypeOptionList}
            onOptionChange={(option: {label: string; value: string}) => {
              formik.setFieldValue(`treatment_stage`, option.value.trim())
            }}
            selectedOption={
              formik.values.treatment_stage === treatmentPlanTypeBraces.NEW
                ? treatmentPlanTypeBraces.NEW
                : treatmentPlanTypeBraces.MID
            }
            labelClassName='text-textColor text-lg font-medium'
            label='Treatment type'
            required
          />
        </div>
        <div className='md:w-[50%]'>
          <InputDateFormik
            {...{
              name: 'treatment_start_date',
              label: 'Treatment start date',
              className: 'md:min-w-[400px] border-mediumGray py-3',
              classNameLabel: 'text-textColor text-lg font-medium',
              required: true,
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik.setFieldValue('treatment_start_date', dateString)
              },
            }}
            formik={formik}
            dateValue={formik?.values?.treatment_start_date}
          />
        </div>
      </div>
      <div className='md:w-[50%] mt-4'>
        <InputText
          name={`tentative_treatment_duration_in_months`}
          classNameLabel='text-textColor text-lg font-medium'
          className='rounded-lg'
          label='Tentative treatment duration'
          placeholder={isTabletAndBelow ? '' : 'Enter treatment duration'}
          suffix='in months'
          maxLength={2}
          formik={formik}
          required={true}
          disabled={false}
          onChange={(e) => {
            const {value} = e.target
            const numericValue = value.replace(/[^0-9]/g, '')
            formik.setFieldValue('tentative_treatment_duration_in_months', numericValue)
          }}
        />
      </div>
    </BorderedCard>
  )
}

export default StepOne
