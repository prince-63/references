import {FC, useContext, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {ERROR_EDIT_END_DATE, ERROR_EDIT_START_DATE} from '../../../../../utils/MessageConstant'
import {ApiGetData, identifyUser, safeParseInt} from '../../../../../utils/ConstFunctions'
import {SVG_CROSS, SVG_TEETHS} from '../../../../../utils/SvgConstants'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import InputDateFormik from '../../../../atom/Inputs/InputDateFormik'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation, useParams} from 'react-router-dom'
import {RowData} from '../../../../../screens/Patients/PatientProfile/types/Aligners.types'
import {AuthContext} from '../../../../../context/AuthContext'
import {RootState} from '../../../../../redux/store'
import {AxiosError} from 'axios'
import {postApiDataEditSingleAlignerDetails} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/EditSingleAlignerDetailsSlice'
import {postApiDataTreatmentPlan} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import AntdButton from 'components/atom/Buttons/AntdButton'
import hasValue from 'utils/hasValue'
import dayjs, {Dayjs} from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import ModalLayout from 'components/modal/ModalLayout'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

dayjs.extend(minMax)
interface props {
  setIsEditTreatmentModel: (isEditTreatmentModel: boolean) => void
  selectedRowDetail:
    | RowData
    | {
        alignerNo: number
        startDate: string
        endDate: string
        alignerType: string
        productionLabId?: number | null
        productionLab?: string | null
        sub_status?: string | null
        currentAlignerNo: number
        alignerJourneyId: number
      }
  isManualTracking?: boolean
  setIsThereAlignerChangeModalOpen: (x: boolean) => void
  setSuccess: (x: boolean) => void
  setEditAlignerData: (x: any) => void
  setSelectedAligner?: (x: any) => void
  isPatientTimeLine?: boolean
  selectedFilter?: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
}

const schema = Yup.object().shape({
  startDate: Yup.string().required(ERROR_EDIT_START_DATE),
  endDate: Yup.string().required(ERROR_EDIT_END_DATE),
})
const ModalEditTreatment: FC<props> = (props) => {
  const {
    setIsEditTreatmentModel,
    selectedRowDetail,
    isManualTracking,
    setIsThereAlignerChangeModalOpen,
    setSuccess,
    setEditAlignerData,
    setSelectedAligner,
    isPatientTimeLine,
    selectedFilter,
  } = props
  const {id: patientUserId, alignerJourneyId: alignerJourneyIdFromParams, patientId} = useParams()
  const alignerJourneyId = alignerJourneyIdFromParams ?? selectedRowDetail?.alignerJourneyId
  const {userId} = useContext(AuthContext)
  const location = useLocation()
  const {loading} = useSelector((state: RootState) => state.apiEditSingleAlignerDetail)
  const dispatch = useDispatch()
  const {isEnterprisePlanUser} = useAllUserPlan()
  const getInitialValues = () => {
    return {
      productionLab: selectedRowDetail.productionLab
        ? {
            label: selectedRowDetail.productionLab && selectedRowDetail.productionLab,
            value: selectedRowDetail.productionLabId && selectedRowDetail.productionLabId,
          }
        : null,
      status: selectedRowDetail?.sub_status ?? null,
      startDate: selectedRowDetail?.startDate,
      endDate: selectedRowDetail?.endDate,
      jawType: selectedRowDetail?.alignerType,
    }
  }

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: schema,
    onSubmit: async (values: any) => {
      const updateDetails = () => {
        const postData: ApiGetData = {
          data: {
            aligner_journey_id: safeParseInt(alignerJourneyId),
            start_date: values.startDate,
            end_date: values.endDate,
            aligner_sr_no: selectedRowDetail?.alignerNo,
            jaw_type: values.jawType,
            production_lab_id: values?.productionLab?.value,
            sub_status: values?.status,
            is_force_aligner_change: false,
          },
        }
        dispatch(postApiDataEditSingleAlignerDetails(postData) as any)
          .unwrap()
          .then((res: any) => {
            if (
              hasValue(res?.aligner_changing_details) &&
              res?.aligner_changing_details?.is_current_aligner_changing
            ) {
              setEditAlignerData({
                postData: {
                  data: {
                    aligner_journey_id: safeParseInt(alignerJourneyId),
                    start_date: values.startDate,
                    end_date: values.endDate,
                    aligner_sr_no: selectedRowDetail?.alignerNo,
                    jaw_type: values.jawType,
                    production_lab_id: values?.productionLab?.value,
                    sub_status: values?.status,
                    is_force_aligner_change: true,
                  },
                },
                aligner_changing_details: res?.aligner_changing_details,
              })
              setIsEditTreatmentModel(false)
              if (setSelectedAligner) {
                setSelectedAligner(null)
              }
              setIsThereAlignerChangeModalOpen(true)
              return
            }
            if (location.state) location.state.isExtendAligner = false
            if (isPatientTimeLine && selectedFilter) {
              dispatch(
                getPatientTimeline({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                  filter: selectedFilter,
                }) as any
              )
            }
            const postData: ApiGetData = {
              data: {
                patient_id: patientUserId ?? patientId,
                alignerJourneyId: alignerJourneyId,
              },
            }
            dispatch(postApiDataTreatmentPlan(postData) as any)
            setSuccess(true)
            setTimeout(() => {
              setIsEditTreatmentModel(false)
              if (setSelectedAligner) {
                setSelectedAligner(null)
              }
            }, 2000)
          })
          .catch((error: AxiosError) => {
            console.error(error)
          })
      }
      updateDetails()
    },
  })

  // useEffect(() => {
  //   getCallBrandListAPI()
  // }, [])

  useEffect(() => {
    if (formik.values.startDate && formik.values.endDate) {
      const startDate = dayjs(formik.values.startDate)
      const endDate = dayjs(formik.values.endDate)
      if (startDate.isAfter(endDate) || startDate.isSame(endDate)) {
        formik.setFieldValue('endDate', '')
      }
    }
  }, [formik.values.startDate, formik.values.endDate])

  // const getCallBrandListAPI = () => {
  //   dispatch(
  //     getApiDataProductionList({
  //       doctorId: safeParseInt(userId),
  //     }) as any
  //   )
  // }
  // const {data: dataProductionLabList}: any = useSelector(
  //   (state: RootState) => state.apiProductionList
  // )
  // const handleAlignerBrandNameChange = (brandName: Option) => {
  //   formik.setFieldValue('productionLab', brandName)
  // }

  // const handleOnCreateBrandName = (brandName: Option) => {
  //   const postData: ApiGetData = {
  //     data: {
  //       name: brandName?.value,
  //       logo_url: '',
  //       user_id: safeParseInt(userId),
  //       user_type: userTypes.DOCTOR,
  //     },
  //   }
  //   dispatch(postApiDataAddCustomBrandName(postData) as any)
  //     .then(() => {
  //       SuccessToast('Aligner brand name added successfully')
  //       dispatch(
  //         getApiDataProductionList({
  //           doctorId: safeParseInt(userId),
  //         }) as any
  //       )
  //         .unwrap()
  //         .then((res: any) => {
  //           formik.setFieldValue('productionLab', getProductionLabIdUsingName(brandName.value, res))
  //         })
  //         .catch((error: AxiosError) => {
  //           console.error(error)
  //         })
  //     })
  //     .catch((error: AxiosError) => {
  //       console.error(error)
  //     })
  // }

  const getMinDateForEndDate = (): Dayjs => {
    if (selectedRowDetail?.currentAlignerNo === selectedRowDetail?.alignerNo) {
      return (
        dayjs.max([dayjs(formik.values.startDate).add(1, 'days'), dayjs().startOf('day')]) ??
        dayjs().startOf('day')
      )
    }
    return dayjs(formik.values.endDate)
  }

  return (
    <ModalLayout isResponsive={true} className='md:!w-[30%]'>
      <form className='' onSubmit={formik.handleSubmit}>
        <div className='flex justify-between items-center'>
          <BackGroundSVG
            svg={SVG_TEETHS}
            width='26'
            height='26'
            className='w-16 h-16 bg-primarySupport rounded-full'
          />
          <div
            className='cursor-pointer'
            onClick={() => {
              setIsEditTreatmentModel(false)
              if (setSelectedAligner) {
                setSelectedAligner(null)
              }
              if (location.state) location.state.isExtendAligner = false
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>
            Edit details for Aligner {selectedRowDetail?.alignerNo}
          </div>
          <div className=' h-5 text-textColor text-base font-normal'>
            {isManualTracking
              ? 'You can edit the aligner’s details here'
              : 'You can edit the details according to your preference.'}
          </div>
        </div>
        <div className='w-full flex gap-2 mt-[21px]'>
          <div className='w-1/2'>
            <InputDateFormik
              {...{
                name: 'startDate',
                label: 'Start Date',
                className: 'w-full h-12 rounded-lg border border-mediumGray py-3',
                required: true,
                minDate: hasValue(isManualTracking)
                  ? undefined
                  : dayjs(selectedRowDetail?.startDate),
                disabled: true,
                classNameLabel: 'text-textColor text-base font-medium',
                onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                  formik?.setFieldValue('startDate', dateString)
                },
              }}
              dateValue={formik?.values?.startDate}
              formik={formik}
            />
          </div>
          <div className='w-1/2'>
            <InputDateFormik
              {...{
                name: 'endDate',
                label: 'End Date',
                className: 'w-full h-12 rounded-lg border border-mediumGray py-3',
                required: true,
                minDate: getMinDateForEndDate(),
                maxDate: dayjs().add(60, 'days'),
                classNameLabel: 'text-textColor text-base font-medium',
                disabled:
                  isEnterprisePlanUser ||
                  (selectedRowDetail?.alignerNo ?? 0) <
                    (selectedRowDetail?.currentAlignerNo ?? 0) - 1,
                onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                  formik?.setFieldValue('endDate', dateString)
                },
              }}
              dateValue={formik?.values?.endDate}
            />
          </div>
        </div>

        {/* <When isTrue={isAccessible}>
          <div className='relative w-full mt-5'>
            {dataProductionLabList && (
              <DropdownPrimaryCreatable
                name='productionLab'
                className='h-12 mt-1'
                label='Production lab'
                placeholder='Enter a name or choose from the list'
                classNameLabel='text-textColor text-base font-medium'
                formik={formik}
                required={true}
                options={dataProductionLabList}
                value={formik.values.productionLab}
                handleOnChange={handleAlignerBrandNameChange}
                handleOnCreate={handleOnCreateBrandName}
              />
            )}
          </div>
        </When>
        <When isTrue={isAccessible}>
          <div className=' relative w-full mt-5'>
            <DropdownPrimary
              name='status'
              className='h-12 mt-1'
              label='Status'
              placeholder='Select status'
              classNameLabel='text-textColor text-base font-medium'
              formik={formik}
              required={true}
              value={formik.values.status}
              options={alignerStatusOptions}
              dropDownHeight={175}
            />
          </div>
        </When> */}

        <div className='mt-7'>
          <AntdButton
            className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
            isLoading={loading}
            text='Update details'
            disabled={!formik.dirty || !formik.isValid || loading}
            onClick={() => {
              identifyUser()
              formik.handleSubmit()
            }}
          />
        </div>
      </form>
    </ModalLayout>
  )
}

export default ModalEditTreatment
