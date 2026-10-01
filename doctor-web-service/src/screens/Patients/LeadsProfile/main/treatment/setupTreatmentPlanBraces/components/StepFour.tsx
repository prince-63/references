import CommonSVG from 'components/atom/SVG/CommonSVG'
import RadioGroups from 'components/RadioGroup/RadioGroups'
import When from 'components/when/When'
import React, {FC, useContext, useState} from 'react'
import {SVG_PLUS_GRAY} from 'utils/SvgConstants'
import FieldAddInput from './FieldAddInput'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  AnchorFilterOption,
  getAnchorageTypeList,
  postAnchorType,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import jawType from '@constants/jawType'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {FormikProps} from 'formik'
import {splitByJawType} from '../helpers/helpers'
interface Props {
  formik: FormikProps<any> // Add the generic type for FormikProps
}

const StepFour: FC<Props> = ({formik}) => {
  const [iIsAnchorageTypeUpper, setIsAnchorageTypeUpper] = useState<boolean>(false)
  const [iIsAnchorageTypeLower, setIsAnchorageTypeLower] = useState<boolean>(false)
  const {anchorageTypeList, anchorageTypeListLoading, anchorageTypeAddLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  const upperJawAnchorTypeList: AnchorFilterOption[] = splitByJawType(anchorageTypeList).upperJaw
  const lowerJawAnchorTypeList: AnchorFilterOption[] = splitByJawType(anchorageTypeList).lowerJaw

  const onClickAddAnchorType = (type: string) => {
    const inputValue =
      type === jawType.UPPER
        ? formik.getFieldProps(`anchorTypeForUpper`).value
        : formik.getFieldProps(`anchorTypeLower`).value

    if (hasValue(inputValue)) {
      dispatchAction(
        postAnchorType({
          doctor_id: safeParseInt(userId),
          jaw_type: type,
          value: inputValue,
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res) {
            if (res.error_code === 'M00001') {
              if (type === jawType.UPPER) {
                formik.setFieldError('anchorTypeUpper', res.message)
              } else {
                formik.setFieldError('anchorTypeLower', res.message)
              }
            } else {
              if (type === jawType.UPPER) {
                setIsAnchorageTypeUpper(false)
                formik.setFieldValue('anchorTypeForUpper', '')
              } else {
                setIsAnchorageTypeLower(false)
                formik.setFieldValue('anchorTypeLower', '')
              }
              dispatchAction(getAnchorageTypeList({doctor_id: safeParseInt(userId)}))
            }
          }
        })
    }
  }
  return (
    <BorderedCard
      header={{
        title: 'Anchorage type',
        icon: 4,
      }}
      className='bg-primaryColor text-white'
    >
      {/* UPPER */}
      <div className='flex flex-wrap  gap-2 items-center'>
        <RadioGroups
          options={upperJawAnchorTypeList}
          onOptionChange={(option: {label: string; value: string}) => {
            formik.setFieldValue('upper_jaw_anchor_type_value', option.value)
          }}
          labelClassName='text-textColor text-lg font-medium'
          selectedOption={formik.getFieldProps('upper_jaw_anchor_type_value').value}
          label='Upper jaw'
          loading={anchorageTypeListLoading}
        />
      </div>
      <div className='text-xs text-red mt-1'>
        {typeof formik.errors.upper_jaw_anchor_type_value === 'string'
          ? formik.errors.upper_jaw_anchor_type_value
          : ''}
      </div>
      <AddButton setValue={() => setIsAnchorageTypeUpper(true)} />
      <When isTrue={iIsAnchorageTypeUpper}>
        <FieldAddInput
          formik={formik}
          name={'anchorTypeForUpper'}
          loader={anchorageTypeAddLoading}
          onClick={() => onClickAddAnchorType('UPPER')}
        />
      </When>

      {/* LOWER */}
      <div className='flex flex-wrap gap-2 items-center mt-3'>
        <RadioGroups
          options={lowerJawAnchorTypeList}
          onOptionChange={(option: {label: string; value: string}) => {
            formik.setFieldValue('lower_jaw_anchor_type_value', option.value)
          }}
          labelClassName='text-textColor text-lg font-medium'
          selectedOption={formik.getFieldProps('lower_jaw_anchor_type_value').value}
          label='Lower jaw'
          loading={anchorageTypeListLoading}
        />
      </div>
      <div className='text-xs text-red mt-1'>
        {typeof formik.errors.lower_jaw_anchor_type_value === 'string'
          ? formik.errors.lower_jaw_anchor_type_value
          : ''}
      </div>
      <AddButton setValue={() => setIsAnchorageTypeLower(true)} />

      <When isTrue={iIsAnchorageTypeLower}>
        <FieldAddInput
          formik={formik}
          name={'anchorTypeLower'}
          loader={anchorageTypeAddLoading}
          onClick={() => onClickAddAnchorType('LOWER')}
        />
      </When>
    </BorderedCard>
  )
}
export default StepFour

const AddButton = ({setValue}: {setValue: (value: boolean) => void}) => {
  return (
    <button
      className='md:w-[116px] w-full rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-textColor mt-4'
      onClick={(e) => {
        e.preventDefault()
        setValue(true) // Call the setValue function and pass the desired value
      }}
    >
      <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
      Add other
    </button>
  )
}
