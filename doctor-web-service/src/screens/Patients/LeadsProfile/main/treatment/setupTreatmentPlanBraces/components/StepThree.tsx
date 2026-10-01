import useDispatchAction from '@hooks/useDispatchAction'

import BorderedCard from 'components/BorderedCard/BorderedCard'
import RadioGroups from 'components/RadioGroup/RadioGroups'
import When from 'components/when/When'
import {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  getBracketSelectTypeList,
  setBracketSubTypeList,
  setBracketCompanyList,
  getBracketCompanyList,
  getBracketSubTypeList,
  postBracketAddCompany,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import FieldAddInput from './FieldAddInput'
import hasValue from 'utils/hasValue'
import {AuthContext} from 'context/AuthContext'
import {FormikProps} from 'formik'
import {getValueByLabel} from '../helpers/helpers'
interface Props {
  formik: FormikProps<any> // Add the generic type for FormikProps
}
const StepThree: FC<Props> = ({formik}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  const {
    bracketTypeList,
    getBracketTypeListLoading,
    bracketSelectTypeList,
    getBracketSelectTypeListLoading,
    bracketSubTypeList,
    getBracketSubTypeListLoading,
    bracketCompanyList,
    getBracketCompanyListLoading,
    postBracketAddCompanyLoading,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  const onClickAddBracketBrandName = (value: string) => {
    const inputValue = value
    if (hasValue(inputValue)) {
      dispatchAction(
        postBracketAddCompany({
          doctor_id: safeParseInt(userId),
          bracket_sub_type_id:
            formik.values.bracket_sub_type === ''
              ? safeParseInt(formik.values.bracket_select_sub_type)
              : safeParseInt(formik.values.bracket_sub_type),
          bracket_company_name: inputValue,
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res) {
            if (res.error_code === 'M00001') {
              formik.setFieldError('input_bracket_brand', res.message)
            } else {
              formik.setFieldValue('input_bracket_brand', '')
              dispatchAction(
                getBracketCompanyList({
                  doctor_id: safeParseInt(userId),
                  bracket_sub_type_id:
                    formik.values.bracket_sub_type === ''
                      ? safeParseInt(formik.values.bracket_select_sub_type)
                      : safeParseInt(formik.values.bracket_sub_type),
                })
              )
            }
          }
        })
    }
  }
  return (
    <BorderedCard
      header={{
        title: 'Bracket details',
        icon: 3,
      }}
      className='bg-primaryColor text-white'
    >
      <div className='md:w-[50%]'>
        <RadioGroups
          options={bracketTypeList}
          className='rounded-lg h-12'
          onOptionChange={(option: {label: string; value: string}) => {
            formik.setFieldValue(`bracket_type`, option.value)
            dispatchAction(setBracketSubTypeList([]))
            dispatchAction(setBracketCompanyList([]))
            dispatchAction(
              getBracketSelectTypeList({
                bracket_id: safeParseInt(option.value),
              })
            )
          }}
          labelClassName='text-textColor text-lg font-medium'
          selectedOption={formik.values.bracket_type}
          label='Bracket type'
          loading={getBracketTypeListLoading}
        />
      </div>
      <When isTrue={bracketSelectTypeList.length > 0}>
        <div className=' mt-4'>
          <RadioGroups
            className='rounded-lg h-12'
            options={bracketSelectTypeList}
            onOptionChange={(option: {label: string; value: string}) => {
              if (formik.getFieldProps('bracket_select_type').value !== option.label)
                formik.setFieldValue(`bracket_select_type`, option.value)
              formik.setFieldValue(`bracket_sub_type`, '')
              formik.setFieldValue(`bracket_brand`, '')

              dispatchAction(
                getBracketSubTypeList({
                  doctor_id: safeParseInt(userId),
                  bracket_id: safeParseInt(option.value),
                })
              )
                .unwrap()
                .then((res: any) => {
                  dispatchAction(setBracketSubTypeList(res))
                  if (option.label === 'Lingual') {
                    formik.setFieldValue('bracket_sub_type', res[0]?.value)
                    dispatchAction(
                      getBracketCompanyList({
                        doctor_id: safeParseInt(userId),
                        bracket_sub_type_id: safeParseInt(res[0]?.value),
                      })
                    )
                    setBracketSubTypeList([])
                  } else {
                    dispatchAction(setBracketCompanyList([]))
                  }
                })
            }}
            labelClassName='text-textColor text-lg font-medium'
            selectedOption={formik.values.bracket_select_type}
            label={'Select type'}
            loading={getBracketSelectTypeListLoading}
          />
        </div>
      </When>
      <When
        isTrue={
          bracketSubTypeList.length > 0 &&
          getValueByLabel(bracketSelectTypeList, formik.values.bracket_select_type) !== 'Lingual'
        }
      >
        <div className='md:w-[50%] mt-4'>
          <RadioGroups
            className='rounded-lg h-12'
            options={bracketSubTypeList}
            onOptionChange={(option: {label: string; value: string}) => {
              if (formik.getFieldProps('bracket_sub_type').value !== option.label) {
                formik.setFieldValue(`bracket_sub_type`, option.value)
                dispatchAction(
                  getBracketCompanyList({
                    doctor_id: safeParseInt(userId),
                    bracket_sub_type_id: safeParseInt(option.value),
                  })
                )
                dispatchAction(setBracketCompanyList([]))
                formik.setFieldValue(`bracket_brand`, '')
              }
            }}
            labelClassName='text-textColor text-lg font-medium'
            selectedOption={formik.values.bracket_sub_type}
            label='Select sub-type'
            loading={getBracketSubTypeListLoading}
          />
        </div>
      </When>
      <When isTrue={bracketCompanyList.length > 0}>
        <div className='w-[100%] mt-4'>
          <RadioGroups
            options={bracketCompanyList}
            onOptionChange={(option: {label: string; value: string}) => {
              if (formik.getFieldProps('bracket_brand').value !== option.label)
                formik.setFieldValue(`bracket_brand`, option.value)
            }}
            labelClassName='text-textColor text-lg font-medium'
            selectedOption={formik.values.bracket_brand}
            label="Which company's bracket system are you using for this treatment?"
            loading={getBracketCompanyListLoading}
          />
        </div>
      </When>
      <When
        isTrue={
          !postBracketAddCompanyLoading &&
          (bracketCompanyList.length > 0 ||
            getValueByLabel(bracketSelectTypeList, formik.values.bracket_select_type) === 'Lingual')
        }
      >
        <When isTrue={bracketCompanyList.length === 0}>
          <div className='text-textColor text-lg font-medium mt-3'>
            Which company's bracket system are you using for this treatment?
          </div>
        </When>
        <FieldAddInput
          formik={formik}
          name={'input_bracket_brand'}
          loader={postBracketAddCompanyLoading}
          onClick={() =>
            onClickAddBracketBrandName(formik.getFieldProps(`input_bracket_brand`).value)
          }
          placeholder=''
        />
      </When>
    </BorderedCard>
  )
}

export default StepThree
