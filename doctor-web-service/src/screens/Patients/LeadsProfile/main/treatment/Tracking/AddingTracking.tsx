import {Collapse, ConfigProvider} from 'antd'
import StepperHeading from '../components/StepperHeading'
import SelectTrackingDetails from '../components/SelectTrackingDetails'
import * as Yup from 'yup'
import Page from 'components/page/Page'
import {TrackingAdditionalDetailsForm} from '../components/TrackingAdditionalDetailsForm'
import {useFormik} from 'formik'

import {useContext, useEffect, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getTrackingDetails,
  handlePostTrackingDetails,
  postTrackingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {RootState} from 'redux/store'
import {useDispatch, useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import userTypes from '@constants/userTypes'
import {trackingTypeList} from './types/trackingTypesList'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import trackingTypes from '@constants/trackingTypes'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import extractMaxMinValuesFromJawRanges from './helpers/extractMaxMinValuesFromJawRanges'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {AxiosError} from 'axios'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'
import When from 'components/when/When'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

const schemaWithoutPatientFill = (minCurrentAligner: number, maxCurrentAligner: number) => {
  return Yup.object().shape({
    trackingSelectTypes: Yup.string().optional(),
    currentAlignerNumber: Yup.number()
      .required(`Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`)
      .min(
        minCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      )
      .max(
        maxCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      ),
    startDate: Yup.date().required('Please select a value in Current Aligner Start Date'),
    endDate: Yup.date()
      .required('Please select a value in Current Aligner End Date')
      .min(Yup.ref('startDate'), 'End date must be later than start date'),
    askForPatientToFill: Yup.boolean().optional(),
  })
}
export interface TrackingFormValues {
  trackingSelectTypes: string
  currentAlignerNumber: string
  startDate: string
  endDate: string
  askForPatientToFill: boolean
}
const schemaWithPatientFill = Yup.object().shape({
  trackingSelectTypes: Yup.string().optional(),
  currentAlignerNumber: Yup.string().optional(),
  startDate: Yup.string().optional(),
  endDate: Yup.string().optional(),
  askForPatientToFill: Yup.boolean().optional(),
})
const AddingTracking = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)

  const schema = Yup.lazy((values) => {
    if (values && values.askForPatientToFill === false) {
      return schemaWithoutPatientFill(minCurrentAligner, maxCurrentAligner)
    }
    return schemaWithPatientFill
  })

  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {dataGetTrackingDetails} = useSelector((state: RootState) => state.tracking)
  const {treatmentPlan, getTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const {minCurrentAligner, maxCurrentAligner} = extractMaxMinValuesFromJawRanges(
    treatmentPlan?.aligner_details_meta_data
  )

  const isUpdatableTracking =
    dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.ACTIVE ||
    dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.DRAFT

  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'

  const callGetTrackingDetails = async () => {
    dispatchAction(
      getTrackingDetails({
        patient_id: String(patientId),
        doctor_id: safeParseInt(userId),
        treatment_subtype: treatmentTypeMain.ALIGNERS,
      })
    )
  }

  useEffect(() => {
    dispatchAction(
      getApiLeadsOverview({
        data: {
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        },
      })
    ).then((res: any) => {
      callGetTrackingDetails()
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: res?.payload?.treatment_plan_id,
        })
      )
    })
  }, [])

  const getInitialValues = () => {
    if (hasValue(dataGetTrackingDetails)) {
      return {
        trackingSelectTypes: hasValue(dataGetTrackingDetails?.tracking_type)
          ? dataGetTrackingDetails?.tracking_type
          : trackingTypes.PATIENTAPP,
        currentAlignerNumber: hasValue(dataGetTrackingDetails?.current_aligner_details?.number)
          ? dataGetTrackingDetails?.current_aligner_details?.number
          : '',
        startDate: hasValue(dataGetTrackingDetails?.current_aligner_details?.start_date)
          ? dataGetTrackingDetails?.current_aligner_details?.start_date
          : '',
        endDate: hasValue(dataGetTrackingDetails?.current_aligner_details?.end_date)
          ? dataGetTrackingDetails?.current_aligner_details?.end_date
          : '',
        askForPatientToFill: dataGetTrackingDetails?.ask_patient_to_fill,
      }
    }
    return {
      trackingSelectTypes: trackingTypes.PATIENTAPP,
      currentAlignerNumber: minCurrentAligner.toString(),
      startDate: '',
      endDate: '',
      askForPatientToFill: false,
    }
  }

  const formik = useFormik<TrackingFormValues>({
    initialValues: getInitialValues(),
    validationSchema: schema,
    onSubmit: async (values) => {
      const postData: any = {
        tracking_type: values.trackingSelectTypes,
        current_aligner_details: {
          number: values.currentAlignerNumber,
          start_date: values.startDate,
          end_date: values.endDate,
        },
        user_type: userTypes.DOCTOR,
        pricing: 0,
        status: 'DRAFT',
        treatment_plan_id: dataLeadsOverview?.treatment_plan_id,
        ask_patient_to_fill: values.askForPatientToFill,
      }

      dispatch(handlePostTrackingDetails(postData))
      const queryParams = new URLSearchParams({
        new: 'true',
      }).toString()
      navigate(`/leads-profile/${patientId}/treatment/review-tracking-details?${queryParams}`)
    },
  })
  const callSaveForLater = (values: any) => {
    const postData: any = {
      tracking_type: values.trackingSelectTypes,
      current_aligner_details: {
        number: values.currentAlignerNumber,
        start_date: values.startDate,
        end_date: values.endDate,
      },
      user_type: userTypes.DOCTOR,
      pricing: 0,
      status: 'DRAFT',
      aligner_treatment_plan_id: dataLeadsOverview?.treatment_plan_id,
      ask_patient_to_fill: values.askForPatientToFill,
      treatment_updating: isUpdatableTracking ? true : false,
    }

    dispatchAction(postTrackingDetails(postData))
      .unwrap()
      .then(async () => {
        dispatchAction(
          getTrackingDetails({
            patient_id: String(patientId),
            doctor_id: safeParseInt(userId),
            treatment_subtype: treatmentTypeMain.ALIGNERS,
          })
        )
          .unwrap()
          .then(async () => {
            dispatchAction(
              getLeadsProfileDetails({
                patient_id: safeParseInt(patientId),
                doctor_id: safeParseInt(userId),
              })
            )
            navigate(`/leads-profile/${patientId}/treatment/view-tracking`)
          })
          .catch((error: AxiosError) => {
            console.error(error)
          })
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  useEffect(() => {
    const initialValues = getInitialValues()
    formik.resetForm({
      values: initialValues,
    })
  }, [minCurrentAligner])

  const handleSelectTrackingType = (type: string): void => {
    formik.setFieldValue('trackingSelectTypes', type)
    if (type === trackingTypes.MANUAL) {
      formik.setFieldValue('askForPatientToFill', false)
    }
  }
  const [activeKey, setActiveKey] = useState(['1', '2'])

  const handleCollapseChange = (key: any) => {
    setActiveKey(key)
  }

  const getValid = (values: any) => {
    const {askForPatientToFill, currentAlignerNumber, startDate, endDate} = values

    if (askForPatientToFill) {
      return true
    }
    if (currentAlignerNumber && startDate && endDate) {
      return true
    }
    return false
  }

  return (
    <form onSubmit={formik.handleSubmit} className='mt-3'>
      <Page
        title='Select a tracking method'
        showBorder={false}
        showBackButton={true}
        loading={getTreatmentPlanLoading}
        backNavigationRoute={`/leads-profile/${patientId}/treatment`}
        exitConfirmPredicate={formik.dirty || isEdit || hasValue(dataGetTrackingDetails)}
      >
        <ConfigProvider
          theme={{
            components: {
              Collapse: {
                contentBg: 'transparent',
                headerBg: 'transparent',
              },
            },
            token: {
              borderRadius: 8,
              colorBorder: 'mediumGray',
              fontSizeIcon: 16,
              fontFamily: 'figtree',
            },
          }}
        >
          <Collapse
            activeKey={activeKey}
            onChange={handleCollapseChange}
            expandIconPosition='end'
            bordered={true}
            className='mb-3 md:px-3 md:py-3'
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
            }}
            expandIcon={expandIcon}
            items={[
              {
                key: '1',
                label: <StepperHeading number={1} title='Patient tracking details' />,
                children: (
                  <div className='bg-transparent md:p-4'>
                    <SelectTrackingDetails
                      options={trackingTypeList}
                      formik={formik}
                      onOptionChange={handleSelectTrackingType}
                    />
                  </div>
                ),
              },
            ]}
          />

          <Collapse
            activeKey={activeKey}
            onChange={handleCollapseChange}
            expandIconPosition='end'
            bordered={true}
            className='mb-20 md:px-3 md:py-3'
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
            }}
            expandIcon={expandIcon}
            items={[
              {
                key: '2',
                label: <StepperHeading number={2} title='Current aligner details' />,
                children: (
                  <div className='w-full md:px-[24px] py-4 bg-transparent'>
                    <TrackingAdditionalDetailsForm formik={formik} />
                  </div>
                ),
              },
            ]}
          />
        </ConfigProvider>

        <div className='flex items-center md:justify-end  gap-6 py-[10px] w-full absolute bottom-0 left-0 shadow-footerShadow md:pe-[26px] z-10 bg-white rounded-lg'>
          <div className='md:w-[250px] w-full flex items-center justify-between md:justify-end gap-4 md:px-0 px-4'>
            <When isTrue={!isEdit}>
              {getValid(formik.values) ? (
                <button
                  type='button'
                  className={`w-full flex justify-center items-center  rounded-lg p-[10px] text-[14px] ${'cursor-pointer bg-primarySupport border border-primaryColor text-primaryColor'}`}
                  onClick={() => callSaveForLater(formik.values)}
                >
                  Save for later
                </button>
              ) : (
                <button
                  type='button'
                  className={`w-full flex justify-center items-center  rounded-lg p-[10px] text-[14px] ${'cursor-pointer bg-lightGray border text-grayDisabled'}`}
                >
                  Save for later
                </button>
              )}
            </When>
            <AntdButton
              className='w-full flex items-center justify-center bg-primaryColor text-white text-sm p-5 font-semibold '
              text='Continue'
              // disabled={}
              onClick={() => {
                formik.handleSubmit()
              }}
            />
          </div>
        </div>
      </Page>
    </form>
  )
}

export default AddingTracking

export const expandIcon = ({isActive}: any) => (
  <div
    className={`flex-[0.1] flex items-center justify-center mt-3 transition-transform ${
      isActive ? 'rotate-90' : ''
    }`}
  >
    <CommonSVG svg={SVG_EXPAND_RIGHT} height='18' width='18' className='cursor-pointer' />
  </div>
)
