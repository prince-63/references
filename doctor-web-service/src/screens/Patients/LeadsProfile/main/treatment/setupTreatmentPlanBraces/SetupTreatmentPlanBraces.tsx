import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import {useFormik} from 'formik'
import React, {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import {ITreatmentPlanBraces, ITreatmentPlanBracesUpdate} from '../types/treatmentPlan.types'
import {RootState} from 'redux/store'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  AnchorFilterOption,
  getAnchorageTypeList,
  getBracesTreatmentPlan,
  getBracketCompanyList,
  getBracketSelectTypeList,
  getBracketSubTypeList,
  getBracketTypeList,
  postCreateTreatmentPlanBraces,
  postUpdateTreatmentPlanBraces,
  setBracketCompanyList,
  setBracketSelectTypeList,
  setBracketSubTypeList,
  setTreatmentPlanBraces,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {AuthContext} from 'context/AuthContext'
import treatmentPlanTypeBraces from '@constants/treatmentPlanTypeBraces'
import {identifyUser, safeParseInt} from 'utils/ConstFunctions'
import productTypes from '@constants/productTypes'
import When from 'components/when/When'
import StepFive from './components/StepFive'
import StepFour from './components/StepFour'
import StepThree from './components/StepThree'
import StepTwo from './components/StepTwo'
import StepOne from './components/StepOne'
import validationSchema from './setupBracesTreatmentForm.validations'
import {getLabelByValue, getValueByLabel, splitByJawType} from './helpers/helpers'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import Footer from 'screens/Patients/StarterPlanAddPatient/components/Footer'

export type TootTypeSelection = {label: string; isSelected: boolean}

interface SetupTreatmentPlanBracesProps {
  isStepperMode?: boolean
  onCancel?: () => void
  onSuccess?: () => void
  isInline?: boolean
  propBracesJourneyId?: string
}

const SetupTreatmentPlanBraces: React.FC<SetupTreatmentPlanBracesProps> = ({
  isStepperMode = false,
  onCancel,
  onSuccess,
  isInline,
  propBracesJourneyId,
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {userId} = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const {patientId, treatmentId} = useParams()
  const isNew = searchParams.get('new') === 'true'
  const bracesJourneyId = propBracesJourneyId || searchParams.get('bracesJourneyId')

  const {
    bracketTypeList,
    bracketSelectTypeList,
    bracketSubTypeList,
    bracesTreatmentPlanList,
    treatmentPlanBraces,
    bracketCompanyList,
    anchorageTypeList,
    getTreatmentPlanBracesLoading,
  } = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  const upperJawAnchorTypeList: AnchorFilterOption[] = splitByJawType(anchorageTypeList).upperJaw
  const lowerJawAnchorTypeList: AnchorFilterOption[] = splitByJawType(anchorageTypeList).lowerJaw

  // 🔹 Load braces plan when editing inline from PlansList
  useEffect(() => {
    if (propBracesJourneyId && userId) {
      dispatchAction(
        getBracesTreatmentPlan({
          doctorId: safeParseInt(userId),
          bracesJourneyId: safeParseInt(propBracesJourneyId),
        })
      )
    }
  }, [propBracesJourneyId, userId, dispatchAction])

  // 🔹 Load bracket lists on mount (do NOT resetForm here — enableReinitialize handles re-init when treatmentPlanBraces loads)
  useEffect(() => {
    dispatchAction(getBracketTypeList({data: null}))
      .unwrap()
      .then((res: any) => {
        if (res) {
          dispatchAction(setBracketSubTypeList([]))
          dispatchAction(setBracketSelectTypeList([]))
          dispatchAction(setBracketCompanyList([]))
        }
      })
  }, [])

  const getInitialValues = () => {
    if (hasValue(treatmentPlanBraces)) {
      return {
        doctor_id: treatmentPlanBraces.doctor_id,
        patient_id: treatmentPlanBraces.patient_id,
        product_type_name: treatmentPlanBraces.product_type_name,
        tentative_treatment_duration_in_months:
          treatmentPlanBraces.tentative_treatment_duration_in_months,
        bracket_type: '',
        bracket_select_type: '',
        bracket_select_sub_type: '',
        bracket_sub_type: '',
        bracket_brand: '',
        input_bracket_brand: '',
        teeth_extraction: treatmentPlanBraces.teeth_extraction ?? [],
        remarks: treatmentPlanBraces.remarks,
        treatment_stage: treatmentPlanBraces.treatment_stage ?? treatmentPlanTypeBraces.MID,
        braces_treatment_stage: treatmentPlanBraces.braces_treatment_stage,
        treatment_name: treatmentPlanBraces.treatment_name,
        upper_jaw_anchor_type_value: '',
        lower_jaw_anchor_type_value: '',
        treatment_start_date: treatmentPlanBraces.treatment_start_date,
        extraction_remarks: treatmentPlanBraces.extraction_remarks,
        input_anchor_type: '',
      }
    } else {
      return {
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        product_type_name: productTypes.BRACES,
        tentative_treatment_duration_in_months: '',
        bracket_type: '',
        bracket_select_type: '',
        bracket_select_sub_type: '',
        bracket_sub_type: '',
        bracket_brand: '',
        input_bracket_brand: '',
        teeth_extraction: [],
        remarks: '',
        treatment_stage: treatmentPlanTypeBraces.NEW,
        braces_treatment_stage: treatmentPlanStatusConstants.ACTIVE,
        treatment_name: `Treatment ${bracesTreatmentPlanList.length + 1}`,
        upper_jaw_anchor_type_value: '',
        lower_jaw_anchor_type_value: '',
        extraction_remarks: '',
        input_anchor_type: '',
        treatment_start_date: '',
      }
    }
  }

  const formik = useFormik<ITreatmentPlanBraces>({
    initialValues: getInitialValues(),
    validateOnBlur: false,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      identifyUser()
      onSubmitHandler(values)
    },
  })

  const onSubmitHandler = async (
    values: ITreatmentPlanBraces,
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    const isInlineUpdate = isInline && hasValue(bracesJourneyId) && bracesJourneyId !== 'null'
    const treatmentPlanBracesToSave: ITreatmentPlanBraces = {
      doctor_id: values.doctor_id || safeParseInt(userId),
      patient_id: values.patient_id || safeParseInt(patientId),
      product_type_name: values.product_type_name,
      tentative_treatment_duration_in_months: values.tentative_treatment_duration_in_months,
      bracket_type: getValueByLabel(bracketTypeList, values.bracket_type),
      bracket_select_type: getValueByLabel(bracketSelectTypeList, values.bracket_select_type),
      bracket_select_sub_type: getValueByLabel(bracketSubTypeList, values.bracket_sub_type),
      bracket_sub_type: getValueByLabel(bracketSubTypeList, values.bracket_sub_type),
      bracket_brand: getValueByLabel(bracketCompanyList, values.bracket_brand),
      input_bracket_brand: '',
      teeth_extraction: values.teeth_extraction,
      remarks: values.remarks,
      treatment_status: values.treatment_stage,
      braces_treatment_stage: isInlineUpdate ? values.braces_treatment_stage : treatmentPlanStatus,
      treatment_name: values.treatment_name,
      upper_jaw_anchor_type_value: getValueByLabel(
        upperJawAnchorTypeList,
        values.upper_jaw_anchor_type_value
      ),
      lower_jaw_anchor_type_value: getValueByLabel(
        lowerJawAnchorTypeList,
        values.lower_jaw_anchor_type_value
      ),
      extraction_remarks: values.extraction_remarks,
      treatment_start_date: values.treatment_start_date,
    }

    // 🔹 INLINE UPDATE MODE (from PlansList)

    if (isInlineUpdate) {
      const updatePayload: ITreatmentPlanBracesUpdate = {
        braces_journey_id: safeParseInt(bracesJourneyId as string),
        ...treatmentPlanBracesToSave,
      }

      try {
        await dispatchAction(postUpdateTreatmentPlanBraces(updatePayload)).unwrap()
        SuccessToast('Braces treatment updated successfully')

        // Re-fetch the plan detail so Redux treatmentPlanBraces (incl. teeth_extraction) is fresh
        await dispatchAction(
          getBracesTreatmentPlan({
            doctorId: safeParseInt(userId),
            bracesJourneyId: safeParseInt(bracesJourneyId as string),
          })
        )

        if (onSuccess) {
          onSuccess() // PlansList: closes edit + refresh list
        }
      } catch (error) {
        console.error('Error updating braces treatment plan (inline):', error)
      }

      // ⛔️ IMPORTANT: don't fall through to navigation logic
      return
    }

    // 🔹 OLD FLOW (non-inline) – keep as is
    dispatchAction(setTreatmentPlanBraces(treatmentPlanBracesToSave))

    if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) {
      dispatchAction(postCreateTreatmentPlanBraces(treatmentPlanBracesToSave))
        .unwrap()
        .then((res: any) => {
          if (res) {
            if (onSuccess) {
              onSuccess()
            } else {
              navigation(`${profileBasePath}/${patientId}/plans-list`)
            }
          }
        })
      return
    }

    if (onSuccess) {
      onSuccess()
      return
    }

    const isBracesJourneyIdExist = String(
      hasValue(treatmentPlanBraces?.braces_journey_id)
        ? treatmentPlanBraces?.braces_journey_id
        : bracesJourneyId
    )

    if (isBracesJourneyIdExist === 'null') {
      navigation(`${profileBasePath}/${patientId}/view-plan/${treatmentId}`)
    } else {
      const queryParams = new URLSearchParams({
        bracesJourneyId: String(
          hasValue(treatmentPlanBraces.braces_journey_id)
            ? treatmentPlanBraces.braces_journey_id
            : bracesJourneyId
        ),
        new: 'false',
        bracesTreatmentStage: treatmentPlanStatusConstants.DRAFT,
      }).toString()
      navigation(`${profileBasePath}/${patientId}/view-plan/${treatmentId}?${queryParams}`)
    }
  }

  const [itemTooths, setItemTooths] = useState<TootTypeSelection[]>([
    {label: '14', isSelected: false},
    {label: '24', isSelected: false},
    {label: '34', isSelected: false},
    {label: '44', isSelected: false},
  ])

  useEffect(() => {
    if (hasValue(treatmentPlanBraces)) {
      formik.setFieldValue(
        'lower_jaw_anchor_type_value',
        getLabelByValue(lowerJawAnchorTypeList, treatmentPlanBraces.lower_jaw_anchor_type_value)
      )
      formik.setFieldValue(
        'upper_jaw_anchor_type_value',
        getLabelByValue(upperJawAnchorTypeList, treatmentPlanBraces.upper_jaw_anchor_type_value)
      )

      dispatchAction(getBracketTypeList({data: null}))
        .unwrap()
        .then((res: any) => {
          if (res) {
            formik.setFieldValue(
              'bracket_type',
              getLabelByValue(res, treatmentPlanBraces.bracket_type)
            )
            dispatchAction(
              getBracketSelectTypeList({
                bracket_id: safeParseInt(getLabelByValue(res, treatmentPlanBraces.bracket_type)),
              })
            ).then((res: any) => {
              if (res) {
                formik.setFieldValue(
                  'bracket_select_type',
                  getLabelByValue(res.payload, treatmentPlanBraces.bracket_select_type)
                )

                dispatchAction(
                  getBracketSubTypeList({
                    doctor_id: safeParseInt(userId),
                    bracket_id: safeParseInt(
                      getLabelByValue(res.payload, treatmentPlanBraces.bracket_select_type)
                    ),
                  })
                ).then((res: any) => {
                  if (res) {
                    formik.setFieldValue(
                      'bracket_sub_type',
                      getLabelByValue(res.payload, treatmentPlanBraces.bracket_select_sub_type)
                    )
                    dispatchAction(
                      getBracketCompanyList({
                        doctor_id: safeParseInt(userId),
                        bracket_sub_type_id: safeParseInt(
                          getLabelByValue(res.payload, treatmentPlanBraces.bracket_select_sub_type)
                        ),
                      })
                    ).then((res: any) => {
                      if (res) {
                        formik.setFieldValue(
                          'bracket_brand',
                          getLabelByValue(res.payload, treatmentPlanBraces.bracket_brand)
                        )
                      }
                    })
                  }
                })
              }
            })
          }
        })

      // Pre-Select Tooth to be extracted — use treatmentPlanBraces directly (formik.values may be stale here)
      setItemTooths((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          isSelected: treatmentPlanBraces.teeth_extraction?.includes(item.label) ?? false,
        }))
      )
    }
  }, [treatmentPlanBraces])

  useEffect(() => {
    dispatchAction(getAnchorageTypeList({doctor_id: safeParseInt(userId)}))
  }, [dispatchAction, userId])

  return (
    <Page
      title={isInline ? '' : 'Set-up treatment plan'}
      loading={bracesJourneyId != null ? getTreatmentPlanBracesLoading : false}
      showBorder={!isInline}
      showBackButton={!isInline}
      backNavigationRoute={`${profileBasePath}/${patientId}/treatment/`}
      // ❗ Disable global "Quit editing" guard for inline mode
      exitConfirmPredicate={isInline ? false : formik.dirty || hasValue(treatmentPlanBraces)}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='flex flex-col gap-3'>
          <StepOne formik={formik} />
          <StepTwo formik={formik} setItemTooths={setItemTooths} itemTooths={itemTooths} />
          <StepThree formik={formik} />
          <StepFour formik={formik} />
          <StepFive formik={formik} />
        </div>
        {isStepperMode ? (
          <Footer
            {...{
              nextButtonText: 'Save & Continue',
              onNext: () => {
                formik.handleSubmit()
              },
            }}
          />
        ) : (
          <div className='flex flex-col gap-2'>
            <div className='font-semibold text-base flex flex-col-reverse md:flex-row gap-3 mt-3 justify-end'>
              <button
                className=' p-3 md:p-0 border border-mediumGray md:border-none rounded-lg cursor-pointer text-black'
                type='button'
                onClick={() => {
                  if (onCancel) {
                    onCancel()
                  } else {
                    navigation(`${profileBasePath}/${patientId}/treatment/`)
                  }
                }}
              >
                Cancel
              </button>

              <When isTrue={isNew && !isInline}>
                <button
                  type='button'
                  className='rounded-lg p-3 cursor-pointer bg-primarySupport border border-primaryColor text-primaryColor'
                  onClick={() => {
                    identifyUser()
                    onSubmitHandler(formik.values, treatmentPlanStatusConstants.DRAFT)
                  }}
                >
                  Save as draft
                </button>
              </When>

              <button type='submit' className='bg-primaryColor rounded-lg p-3 text-white'>
                Continue
              </button>
            </div>
          </div>
        )}
      </form>
    </Page>
  )
}

export default SetupTreatmentPlanBraces
