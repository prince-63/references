import useDispatchAction from '@hooks/useDispatchAction'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import DropdownPrimaryCreatable from 'components/atom/Dropdown/DropdownPrimaryCreatable'
import DropdownPrimaryNormal from 'components/atom/Dropdown/DropdownPrimaryNormal'
import InputText from 'components/atom/Inputs/InputText'
import {useFormik} from 'formik'
import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import BoxComponent from './components/BoxComponent'
import AlignersTable from './components/AlignersTable'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_CLOUD, SVG_CROSS} from 'utils/SvgConstants'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import fileFormatType from '@staticData/fileFormatType'
import When from 'components/when/When'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import {
  ApiGetData,
  areObjectValuesEmpty,
  getImageUrl,
  getProductionLabIdUsingName,
  safeParseInt,
} from 'utils/ConstFunctions'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {dailyWearHoursList, wearDaysList} from 'utils/Constant'
import {
  getApiDataDefaultBrandName,
  getApiDataProductionList,
} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import {AuthContext} from 'context/AuthContext'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {
  postApiDataAddCustomBrandName,
  postApiDataAddDefaultBrandName,
} from 'redux/Slices/AppSlice/PatientsList/AddCustomBrandNameSlice'
import userTypes from '@constants/userTypes'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {Option} from 'react-google-places-autocomplete/build/types'
import {
  createTreatmentPlan,
  getAllTreatmentPlanList,
  getTreatmentPlan,
  setOpenDraftModal,
  setTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import DraftConfirmationModal from './components/DraftConfirmationModal'
import {
  FormValues,
  ITreatmentPlan,
  IVideoFile,
  VideoPositionKey,
} from '../types/treatmentPlan.types'
import Page from 'components/page/Page'
import HowToUse from './components/HowToUse'
import CancelModal from './components/CancelModal'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import leadsOverviewConstants from '@constants/leadsOverview.constants'
import {setSelectedOverviewStep} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import TextWithTooltip from 'components/section/TextWithTooltip'
import {Popover, Spin} from 'antd'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import {CommonVideoView} from './components/CommonVideoView'
import {CommonVideoInput} from './components/CommonVideoInput'
import {BOTTOM_VIEW, FRONT_VIEW, LEFT_SIDE_VIEW, RIGHT_SIDE_VIEW, TOP_VIEW} from 'utils/ImageConst'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import uploadTreatmentPlanTypes from '@staticData/uploadTreatmentPlanTypes'
import {getInitialValues} from './getInitialValues'
import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import getValidationSchema from './setupTreatmentForm.validation'
import InfoCard from '../../alignersTracking/components/InfoCard'
import SendForApprovalModal from '../viewTreatmentPlan/components/SendForApprovalModal'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'
import FooterForExisting from '../../../../../ExistingCase/components/Footer'
import {nextStep, setSaveTreatmentData} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import PDFWebview from '../../files/components/PDFWebview'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {createFolder} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {setCurrentStep} from 'redux/Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import FooterForStarterPlan from 'screens/Patients/StarterPlanAddPatient/components/Footer'

const SetupTreatmentPlan = ({
  order_id = null,
  toBeCloned = false,
  backNavigationRoute,
  hideAlignerDetails,
  existingCase = false,
  isStepperMode = false,
  patientIdProp,
  isEdit,
}: {
  order_id?: string | null
  toBeCloned?: boolean
  hideAlignerDetails?: boolean
  backNavigationRoute?: string
  existingCase?: boolean
  isStepperMode?: boolean
  patientIdProp?: number
  isEdit?: boolean
}) => {
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {patientId: patientIdFromParams, treatmentId} = useParams()
  const patientId = patientIdProp || patientIdFromParams
  const [upperOptions, setUpperOptions] = useState<number[]>([])
  const [lowerOptions, setLowerOptions] = useState<number[]>([])
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {treatmentPlan, openDraftModal, getTreatmentPlanLoading, createTreatmentPlanLoading} =
    useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {isDesignLabUser, isVendor, isEnterprisePlanUser, isStarterPlanUser} = useAllUserPlan()
  const {allTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const hasActiveTreatmentPlan = useMemo(
    () => treatmentPlan?.status === treatmentPlanStatusConstants.ACTIVE,
    [allTreatmentPlanList, treatmentPlan?.status]
  )
  const [searchParams] = useSearchParams()
  const isDraft = searchParams.get('draft') === 'true' || isEdit
  const orderId = searchParams.get('order_id') ?? order_id

  const {dispatchAction} = useDispatchAction()

  const isValidToAddBrandDetails = (!isDesignLabUser && !isVendor) || isEnterprisePlanUser

  const treatmentPlanName =
    allTreatmentPlanList && allTreatmentPlanList?.length > 0
      ? `Treatment ${allTreatmentPlanList.length + 1}`
      : 'Treatment 1'
  const [selectedUpperBoxes, setSelectedUpperBoxes] = useState<number[]>(
    treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range ?? []
  )
  const [selectedLowerBoxes, setSelectedLowerBoxes] = useState<number[]>(
    treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range ?? []
  )
  const [initialUpperBoxes, setInitialUpperBoxes] = useState<number[]>([])
  const [initialLowerBoxes, setInitialLowerBoxes] = useState<number[]>([])
  const {data: dataProductionLabList} = useSelector((state: RootState) => state.apiProductionList)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [fileUrls, setFileUrls] = useState<Partial<IVideoFile>[]>(treatmentPlan?.files)
  const [otherFileUrls, setOtherFileUrls] = useState<Partial<IVideoFile>[]>(
    treatmentPlan?.other_files
  )
  const [pdfFileUrl, setPdfFileUrl] = useState<any>(treatmentPlan?.pdf_files ?? null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false)
  const [checked, setChecked] = useState(false)
  const [defaultBrandName, setDefaultBrandName] = useState('')
  const [showSendForApprovalModal, setShowSendForApprovalModal] = useState(false)
  const [videoFileUrls, setVideoFileUrls] = useState<Record<VideoPositionKey, IVideoFile | null>>(
    treatmentPlan?.video_files ?? {
      SINGLE_VIDEO: null,
      TOP: null,
      BOTTOM: null,
      RIGHT: null,
      LEFT: null,
      FRONT: null,
    }
  )
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // PDF handler functions - Add these
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  useEffect(() => {
    if (treatmentId) {
      if (!treatmentPlan) {
        dispatchAction(
          getTreatmentPlan({
            aligner_treatment_id: treatmentId,
          })
        )
      }
    }
  }, [dispatchAction, treatmentPlan, treatmentId])

  useEffect(() => {
    getCallBrandListAPI()
    getTreatmentList()
  }, [])

  const treatmentDetailsRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state?.scrollToDiv && treatmentDetailsRef.current) {
      treatmentDetailsRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [location.state])

  useEffect(() => {
    if (hasValue(treatmentPlan)) {
      getInitialValues({treatmentPlan, treatmentPlanName, toBeCloned})
    }
    getDefaultBrand()
  }, [treatmentPlan])
  const onSubmitHandler = async (
    values: FormValues,
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    const payload = {
      details: {
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        ...((hasValue(treatmentPlan.order_id) || (hasValue(orderId) && orderId !== 'null')) && {
          order_id: orderId ?? treatmentPlan.order_id,
        }),

        ...(!toBeCloned && {
          treatment_plan_id: treatmentId,
        }),
        ...(toBeCloned && {
          linked_treatment_plan_id: treatmentId,
        }),
        ...(toBeCloned && {
          approver_status: 'PENDING_APPROVAL',
        }),
        aligner_treatment_details: {
          upper_jaw: {
            starts_with: Number(values?.upperJawStartsWith),
            ends_with: Number(values?.upperJawEndsWith),
            range: selectedUpperBoxes,
          },
          lower_jaw: {
            starts_with: Number(values?.lowerJawStartsWith),
            ends_with: Number(values?.lowerJawEndsWith),
            range: selectedLowerBoxes,
          },
        },
        treatment_sub_type:
          typeof values?.treatment_sub_type?.value === 'string'
            ? values.treatment_sub_type.value
            : undefined,
        days_to_wear_each_aligner: safeParseInt(values?.days_to_wear_each_aligner?.value),
        recommended_hours_to_wear_aligners: safeParseInt(
          values?.recommended_hours_to_wear_aligners?.value
        ),
        treatment_planning_link: values?.treatment_planning_link,
        treatment_plan_tag_name: values?.treatment_plan_tag_name ?? null,
        remarks: values?.remarks,
        video_display_to_patient: values?.video_display_to_patient,
        link_display_patient: values?.link_display_patient,
        file_ids_to_clone: values?.file_ids_to_clone,
        treatment_plan_upload_type: values?.treatment_plan_upload_type ?? null,
        status: isStarterPlanUser ? treatmentPlanStatusConstants.ACTIVE : treatmentPlanStatus,
        initiator_status: isStarterPlanUser
          ? treatmentPlanStatusConstants.APPROVED
          : toBeCloned
            ? treatmentPlanStatusConstants.SENT_FOR_APPROVAL
            : treatmentPlanStatusConstants.IN_PROGRESS,
        production_lab_details: {
          production_lab_id: Number(values.brand_name?.value ?? 0),
          brand_name: values.brand_name?.label ?? '',
        },
      },
      files: values?.files ?? [],
      other_files: values?.other_files ?? [],
      video_files: values?.video_files ?? {},
      pdf_file: values?.pdf_file ?? [],
    }

    return dispatchAction(createTreatmentPlan(payload as any))
      .unwrap()
      .then((res: ITreatmentPlan) => {
        dispatchAction(
          createFolder({
            parent_path: `/Orders`,
            folder_name: `STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
            uploader: {
              user_id: safeParseInt(userId),
              user_type: userTypes.DOCTOR,
            },
            owners: [
              {
                user_id: safeParseInt(userId),
                user_type: userTypes.DOCTOR,
              },
              {
                user_id: safeParseInt(patientId),
                user_type: userTypes.PATIENT,
              },
            ],
          })
        )
        if (toBeCloned) {
          navigate(`${profileBasePath}/${patientId}/view-plan/${res?.treatment_plan_id}`, {
            replace: true,
          })
          return
        }
        if (isStepperMode) {
          dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
            .unwrap()
            .then((res: any) => {
              const postData = {
                data: {
                  first_name: res.first_name,
                  last_name: res.last_name,
                  email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
                  mobile: res.mobile !== '' ? res.mobile : null,
                  country_code: res.country_code,
                  practice_location_name:
                    res.practice_location !== '' ? res.practice_location : null,
                  inviter_id: userId,
                  inviter_user_type: userTypes.DOCTOR,
                  customer_mapped_id: res.customer_mapped_id.trim(),
                  age: res.age,
                  gender: res.gender,
                  practice_location_id: null,
                  country: res.country,
                  state: res.state,
                  city: res.city,
                  practice_profile_id: profileId,
                  practice_invite_code: null,
                  current_step: 6,
                  patient_id: patientId,
                },
              }
              dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
                .unwrap()
                .then(() => {})
            })
          dispatchAction(setCurrentStep('4'))
          return
        }
        if (serviceConfig.PLANNING) {
          const queryParams = new URLSearchParams()
          queryParams.append('order_id', String(order_id))
          const queryString = queryParams.toString()
          navigate(
            `${profileBasePath}/${patientId}/plans/view-plan/${res?.treatment_plan_id}?${queryString}`,
            {
              replace: true,
            }
          )
        } else {
          navigate(`${profileBasePath}/${patientId}/view-plan/${res?.treatment_plan_id}`, {
            replace: true,
          })
        }
        if (treatmentPlanStatus !== treatmentPlanStatusConstants.DRAFT) {
          dispatchAction(setSelectedOverviewStep(leadsOverviewConstants.ADD_TRACKING))
        }
        if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) return
        if (hideAlignerDetails) {
          setShowSendForApprovalModal(true)
          return
        }
      })
      .catch(() => {})
  }
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const formik = useFormik<FormValues>({
    initialValues: getInitialValues({treatmentPlan, treatmentPlanName, toBeCloned}),
    validateOnBlur: false,
    validationSchema: getValidationSchema(isDesignLabUser, isVendor),
    onSubmit: (values) => {
      if (existingCase) {
        const alignerDetails = {
          upper_jaw: {
            starts_with: values.upperJawStartsWith,
            ends_with: values.upperJawEndsWith,
            range: selectedUpperBoxes,
          },
          lower_jaw: {
            starts_with: values.lowerJawStartsWith,
            ends_with: values.lowerJawEndsWith,
            range: selectedLowerBoxes,
          },
        }
        const treatmentPlanToSave = {
          treatment_plan_tag_name: values.treatment_plan_tag_name,
          aligner_treatment_details: alignerDetails,
          treatment_plan_id: treatmentPlan?.treatment_plan_id ?? null,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          production_lab_details: toBeCloned
            ? null
            : {
                production_lab_id: values.brand_name?.value,
                brand_name: values.brand_name?.label,
              },
          status: isStarterPlanUser ? 'ACTIVE' : 'DRAFT',
          days_to_wear_each_aligner: values.days_to_wear_each_aligner?.value,
          recommended_hours_to_wear_aligners: values.recommended_hours_to_wear_aligners?.value,
          treatment_planning_software: values.treatment_planning_software?.value ?? '',
          treatment_planning_link: values.treatment_planning_link,
          remarks: values.remarks,
          filesToSave: values.files ?? [],
          otherFilesToSave: values.other_files ?? [],
          files: fileUrls,
          other_files: otherFileUrls,
          video_files: videoFileUrls,
          video_files_to_save: values.video_files ?? [],
          doctor_id: safeParseInt(userId),
          aligner_details_meta_data: alignerDetails,
          is_link_display_patient: values.link_display_patient,
          video_display_patient: values.video_display_to_patient,
          approved_by_patient_at: null,
          order_id: order_id ?? orderId,
          pdf_file_to_save: values.pdf_file,
          pdf_files: pdfFileUrl,
          treatment_plan_upload_type: values.treatment_plan_upload_type,
          created_at: treatmentPlan?.created_at ? treatmentPlan.created_at : null,
          file_ids_to_clone: values.file_ids_to_clone,
        }
        dispatchAction(setTreatmentPlan(treatmentPlanToSave))
        dispatchAction(setSaveTreatmentData(treatmentPlanToSave))
        dispatchAction(nextStep())

        return
      }

      // Only execute if existingCase is false
      onSubmitHandler(values, treatmentPlanStatusConstants.DRAFT)
    },
  })

  const getCallBrandListAPI = () => {
    const payload = {
      doctorId: safeParseInt(userId),
    }
    dispatchAction(getApiDataProductionList({payload}) as any)
  }
  const getDefaultBrand = () => {
    dispatchAction(
      getApiDataDefaultBrandName({
        doctorId: safeParseInt(userId),
        is_default: true,
      })
    )
      .unwrap()
      .then((res: {label: string; value: number} | null) => {
        res !== null && setDefaultBrandName(res.label)
        if (!treatmentPlan?.treatment_plan_id || treatmentPlan?.production_lab_details) {
          formik.setFieldValue('brand_name', res)
        }
      })
  }

  const getTreatmentList = () => {
    if (userId && patientId) {
      dispatchAction(
        getAllTreatmentPlanList({
          doctor_id: userId,
          patient_id: patientId,
          organization_id: safeParseInt(organizationId),
        })
      )
    }
  }
  const handleOnCreateBrandName = (brandName: Option) => {
    const postData: ApiGetData = {
      data: {
        name: brandName?.value,
        logo_url: '',
        user_id: safeParseInt(userId),
        user_type: userTypes.DOCTOR,
      },
    }
    dispatchAction(postApiDataAddCustomBrandName(postData))
      .unwrap()
      .then(() => {
        SuccessToast('Aligner brand name added successfully')
        const payload = {
          doctorId: safeParseInt(userId),
        }
        dispatchAction(getApiDataProductionList({payload}) as any)
          .unwrap()
          .then((res: {label: string; value: string}[]) => {
            const foundProductionLabObject = getProductionLabIdUsingName(brandName.value, res)
            formik.setFieldValue('brand_name', foundProductionLabObject)
          })
      })
  }
  const {subscriptionData} = useSubscriptionDetails()

  useEffect(() => {
    if (hasValue(formik.values.upperJawStartsWith) && hasValue(formik.values.upperJawEndsWith)) {
      const upperStart = Number(formik.values.upperJawStartsWith)
      const upperEnd = Number(formik.values.upperJawEndsWith)

      const upperBoxes = Array.from({length: upperEnd - upperStart + 1}, (_, i) => upperStart + i)
      if (formik.dirty) setSelectedUpperBoxes(upperBoxes)
      setInitialUpperBoxes(upperBoxes)

      const upperOptions = Array.from({length: upperEnd - upperStart + 1}, (_, i) => upperStart + i)
      setUpperOptions(upperOptions)
    } else {
      setUpperOptions([])
    }

    if (hasValue(formik.values.lowerJawStartsWith) && hasValue(formik.values.lowerJawEndsWith)) {
      const lowerStart = Number(formik.values.lowerJawStartsWith)
      const lowerEnd = Number(formik.values.lowerJawEndsWith)

      const lowerBoxes = Array.from({length: lowerEnd - lowerStart + 1}, (_, i) => lowerStart + i)
      if (formik.dirty) setSelectedLowerBoxes(lowerBoxes)
      setInitialLowerBoxes(lowerBoxes)

      const lowerOptions = Array.from({length: lowerEnd - lowerStart + 1}, (_, i) => lowerStart + i)
      setLowerOptions(lowerOptions)
    } else {
      setLowerOptions([])
    }
  }, [
    formik.values.upperJawStartsWith,
    formik.values.upperJawEndsWith,
    formik.values.lowerJawStartsWith,
    formik.values.lowerJawEndsWith,
  ])

  useEffect(() => {
    if (!formik.values.upperJaw) {
      if (formik.values.upperJawStartsWith || formik.values.upperJawEndsWith) {
        formik.setFieldValue('upperJawStartsWith', '')
        formik.setFieldValue('upperJawEndsWith', '')
      }
      setUpperOptions([])
      setSelectedUpperBoxes([])
    }
  }, [formik.values.upperJaw])

  useEffect(() => {
    if (!formik.values.lowerJaw) {
      if (formik.values.lowerJawStartsWith || formik.values.lowerJawEndsWith) {
        formik.setFieldValue('lowerJawStartsWith', '')
        formik.setFieldValue('lowerJawEndsWith', '')
      }
      setLowerOptions([])
      setSelectedLowerBoxes([])
    }
  }, [formik.values.lowerJaw])
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value <= 99 && value > 0) {
      formik.setFieldValue(e.target.name, value)
    } else {
      formik.setFieldValue(e.target.name, '')
    }
  }

  const handleOtherFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const existingFiles = formik.values.other_files || []
      const timestampAppendedFiles = Array.from(event.currentTarget.files).map((file) => {
        const timestamp = Date.now()
        const newFile = new File([file], `${timestamp}-${file.name}`, {
          type: file.type,
        })
        return newFile
      })
      const combinedFiles = [...existingFiles, ...timestampAppendedFiles]
      const validatedFileList = validateAndProcessPhotos({
        files: combinedFiles,
        fileCount: 6,
        toastMessage: 'You can upload a maximum of 5 files at a time',
        chatFileFormats: fileFormatType.TREATMENT_PLAN_EXTENSIONS,
        maxFileSize: 50,
        availableStorage: subscriptionData?.total_storage_gb,
        usedStorage: subscriptionData?.used_storage_gb,
      })

      const newFiles = Array.from(validatedFileList)
      formik.setFieldValue('other_files', newFiles)

      // For existing files, use their URLs from fileUrls array
      // For new files, create object URLs
      const urls = newFiles.map((file) => {
        const existingFileUrl = otherFileUrls?.find((f) => f.name === file.name)
        if (existingFileUrl?.url) {
          return existingFileUrl
        }
        return {
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
          extension: file.name.split('.').pop(),
        }
      })
      setOtherFileUrls(urls)
    }
    event.currentTarget.value = ''
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const existingFiles = formik.values.files || []
      const timestampAppendedFiles = Array.from(event.currentTarget.files).map((file) => {
        const timestamp = Date.now()
        const newFile = new File([file], `${timestamp}-${file.name}`, {
          type: file.type,
        })
        return newFile
      })
      const combinedFiles = [...existingFiles, ...timestampAppendedFiles]
      const validatedFileList = validateAndProcessPhotos({
        files: combinedFiles,
        fileCount: 6,
        toastMessage: 'You can upload a maximum of 5 files at a time',
        chatFileFormats: fileFormatType.TREATMENT_PLAN_EXTENSIONS,
        maxFileSize: 50,
        availableStorage: subscriptionData?.total_storage_gb,
        usedStorage: subscriptionData?.used_storage_gb,
      })

      const newFiles = Array.from(validatedFileList)
      formik.setFieldValue('files', newFiles)

      // For existing files, use their URLs from fileUrls array
      // For new files, create object URLs
      const urls = newFiles.map((file) => {
        const existingFileUrl = fileUrls?.find((f) => f.name === file.name)
        if (existingFileUrl?.url) {
          return existingFileUrl
        }
        return {
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
          extension: file.name.split('.').pop(),
        }
      })
      setFileUrls(urls)
    }
    event.currentTarget.value = ''
  }
  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      formik.setFieldValue('pdf_file', event.target.files[0])
      const obj = {
        url: URL.createObjectURL(event.target.files[0]),
        type: event.target.files[0].type,
        name: event.target.files[0].name,
        extension: event.target.files[0].name.split('.').pop(),
      }
      setPdfFileUrl([obj])
    }
  }

  const handleVideoFileChange = (
    position: VideoPositionKey,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const file = event.currentTarget.files[0]
      const timestamp = Date.now()
      const newFile = new File([file], `${timestamp}-${file.name}`, {
        type: file.type,
      })

      const validatedFile = validateAndProcessPhotos({
        files: [newFile],
        fileCount: 2,
        toastMessage: 'You can upload only one video file',
        chatFileFormats: fileFormatType.VIDEOS_EXTENSIONS,
        maxFileSize: 50,
        availableStorage: subscriptionData?.total_storage_gb,
        usedStorage: subscriptionData?.used_storage_gb,
      })
      if (hasValue(validatedFile)) {
        formik.setFieldValue('video_files', {
          ...formik.values.video_files,
          [position]: validatedFile[0],
        })

        setVideoFileUrls((prevFiles) => ({
          ...prevFiles,
          [position]: {
            url: URL?.createObjectURL(validatedFile[0]),
            type: validatedFile[0].type,
            name: validatedFile[0].name,
            extension: validatedFile[0].name.split('.').pop(),
          },
        }))
      }
    }
    event.currentTarget.value = ''
  }

  const handleBoxClick = (number: number, isUpperJaw: boolean) => {
    if (initialUpperBoxes.includes(number) && initialLowerBoxes.includes(number)) {
      if (isUpperJaw) {
        setSelectedUpperBoxes((prevState) =>
          prevState.includes(number)
            ? prevState.filter((n) => n !== number)
            : [...prevState, number]
        )
      } else {
        setSelectedLowerBoxes((prevState) =>
          prevState.includes(number)
            ? prevState.filter((n) => n !== number)
            : [...prevState, number]
        )
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...formik.values.files]
    newFiles.splice(index, 1)
    formik.setFieldValue('files', newFiles)

    const newFileUrls = [...fileUrls]
    newFileUrls.splice(index, 1)
    setFileUrls(newFileUrls)

    if (formik.values.file_ids_to_clone[index]) {
      const newFileIdsToClone = [...formik.values.file_ids_to_clone]
      newFileIdsToClone.splice(index, 1)
      formik.setFieldValue('file_ids_to_clone', newFileIdsToClone)
    }
  }

  const handleRemoveOtherFile = (index: number) => {
    const newFiles = [...formik.values.other_files]
    newFiles.splice(index, 1)
    formik.setFieldValue('other_files', newFiles)

    const newFileUrls = [...otherFileUrls]
    newFileUrls.splice(index, 1)
    setOtherFileUrls(newFileUrls)

    if (formik.values.file_ids_to_clone[index]) {
      const newFileIdsToClone = [...formik.values.file_ids_to_clone]
      newFileIdsToClone.splice(index, 1)
      formik.setFieldValue('file_ids_to_clone', newFileIdsToClone)
    }
  }
  const handleRemovePdfFile = () => {
    formik.setFieldValue('pdf_file', null)

    setPdfFileUrl(null)
  }

  const handleVideoFileRemove = (videoKey: string) => {
    setVideoFileUrls((prev) => ({
      ...prev,
      [videoKey]: null,
    }))
    if (videoKey === 'SINGLE_VIDEO') {
      formik.setFieldValue('video_files', null)
      return
    }

    formik.setFieldValue('video_files', {
      ...formik.values.video_files,
      [videoKey]: null,
    })
  }

  const handleDefaultBrandName = () => {
    const postData: ApiGetData = {
      data: {
        name: formik.values?.brand_name?.label,
        logo_url: '',
        user_id: safeParseInt(userId),
        user_type: userTypes.DOCTOR,
        is_default: true,
      },
    }
    dispatchAction(postApiDataAddDefaultBrandName(postData))
      .unwrap()
      .then((res: any) => {
        setDefaultBrandName(res.name)
      })
  }

  useEffect(() => {
    if (hasValue(formik.values.treatment_planning_link) && !isDraft) {
      formik.setFieldValue('link_display_patient', true)
    } else {
      formik.setFieldValue('link_display_patient', false)
    }
  }, [formik.values.treatment_planning_link])

  useEffect(() => {
    if ((areObjectValuesEmpty(videoFileUrls) || hasValue(pdfFileUrl)) && !isDraft) {
      formik.setFieldValue('video_display_to_patient', true)
    } else {
      formik.setFieldValue('video_display_to_patient', false)
    }
  }, [videoFileUrls, pdfFileUrl])

  useEffect(() => {
    if (hasValue(pdfFileUrl) && !isDraft) {
      formik.setFieldValue('video_display_to_patient', true)
    } else {
      formik.setFieldValue('video_display_to_patient', false)
    }
  }, [pdfFileUrl])

  const getRoute = () => {
    if (serviceConfig?.PLANNING) {
      return `/profile/${patientId}/plans`
    } else {
      return backNavigationRoute ?? `/profile/${patientId}/plans-list`
    }
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <Page
          title={!existingCase ? 'Set-up treatment plan' : 'Treatment plan'}
          showBorder
          loading={getTreatmentPlanLoading}
          showBackButton={!existingCase ? true : false}
          backNavigationRoute={getRoute()}
          exitConfirmPredicate={formik.dirty || hasValue(treatmentPlan)}
        >
          <Spin spinning={createTreatmentPlanLoading} loadingText='Plan is creating...'>
            <form onSubmit={formik.handleSubmit}>
              <fieldset disabled={hasActiveTreatmentPlan}>
                <When isTrue={isShowPhotos}>
                  <ImageViewer
                    setIsShowPhotos={setIsShowPhotos}
                    selectedImagesList={fileUrls?.map((file, index) => ({
                      id: index,
                      src: getImageUrl(file),
                      width: '100%',
                      height: '100%',
                    }))}
                    selectedIndex={selectedIndex}
                  />
                </When>
                <When isTrue={openDraftModal}>
                  <DraftConfirmationModal {...{toBeCloned}} />
                </When>
                <When isTrue={isCancelModalOpen}>
                  <CancelModal {...{setIsCancelModalOpen}} />
                </When>
                <When isTrue={showSendForApprovalModal}>
                  <SendForApprovalModal
                    {...{
                      setShowSendForApprovalModal,
                      toBeCloned,
                    }}
                  />
                </When>
                <div
                  className={`flex flex-col gap-3 overflow-scroll ${
                    existingCase ? 'pb-28 sm:pb-28 md:pb-12' : ''
                  }`}
                >
                  <When isTrue={hideAlignerDetails}>
                    <InfoCard
                      className='border border-primaryColor bg-primarySupport text-sm font-medium'
                      titleClassName='text-black font-semibold text-base'
                      title={`Add brand name, aligner wear days and hours to send it ahead.`}
                      content={
                        'This a cloned treatment plan with the same details. Feel free to edit if needed.'
                      }
                      showButton={false}
                    />
                    {/* <BorderedCard header={{title: 'Aligner details'}}>
                    <AlignerDetails isReceivedPlan />
                  </BorderedCard> */}
                  </When>
                  <BorderedCard
                    header={{
                      title: 'Basic details',
                      icon: 1,
                    }}
                    className='bg-primaryColor text-white'
                  >
                    <div className='flex flex-wrap items-start gap-3  justify-between '>
                      <div className='flex flex-col justify-between gap-3 w-full md:w-auto'>
                        <InputText
                          label='Treatment name'
                          name='treatment_plan_tag_name'
                          formik={formik}
                          className='rounded-lg md:mt-0 mt-2 md:min-w-[400px]'
                          maxLength={100}
                        />
                        <When isTrue={isValidToAddBrandDetails}>
                          <div className='md:mt-5'>
                            <DropdownPrimaryNormal
                              name='days_to_wear_each_aligner'
                              label='Days to wear each aligner '
                              classNameLabel='text-textColor text-lg font-medium'
                              formik={formik}
                              required={true}
                              className=' md:min-w-[400px] '
                              options={wearDaysList}
                              placeholder='Choose from the list'
                            />
                          </div>
                        </When>
                      </div>
                      <When isTrue={isValidToAddBrandDetails}>
                        <div className='flex flex-col justify-between gap-3 w-full md:w-auto'>
                          {/* <When isTrue={!toBeCloned}> */}
                          <div>
                            <DropdownPrimaryCreatable
                              name='brand_name'
                              className=' md:min-w-[400px]'
                              label='Brand name'
                              placeholder=''
                              classNameLabel='text-textColor text-lg font-medium'
                              formik={formik}
                              required={true}
                              options={dataProductionLabList ? dataProductionLabList : []}
                              handleOnCreate={handleOnCreateBrandName}
                              handleOnChange={(selectedOption) => {
                                setChecked(false)
                                formik.setFieldValue('brand_name', selectedOption)
                              }}
                              // disable={!is_your_patient}
                            />
                            <div className='flex gap-2 flex-wrap items-center'>
                              <input
                                type='checkbox'
                                checked={checked}
                                onChange={() => {
                                  setChecked(!checked)
                                  if (!checked) {
                                    handleDefaultBrandName()
                                  }
                                }}
                                disabled={
                                  checked ||
                                  formik?.values?.brand_name === undefined ||
                                  formik?.values?.brand_name === null ||
                                  (formik?.values?.brand_name !== null &&
                                    formik?.values?.brand_name.label == defaultBrandName)
                                }
                                onBlur={formik.handleBlur}
                                className={clsx(
                                  'min-w-[18px] min-h-[18px] cursor-pointer green-checkbox',
                                  !hasValue(formik?.values?.brand_name) ||
                                    (formik?.values?.brand_name?.label == defaultBrandName &&
                                      'bg-lightGray')
                                  // !is_your_patient && 'bg-lightGray'
                                )}
                              />
                              <div className='flex items-center gap-1'>
                                <div className='text-sm font-medium text-textColor pt-1'>
                                  Set the brand name as default
                                </div>
                                <Popover
                                  title='Default brand name'
                                  trigger='click'
                                  placement='bottom'
                                  content={
                                    <div className='text-sm font-normal md:w-[350px] w-[220px] break-words text-textColor'>
                                      When enabled, the brand name will be automatically pre-filled
                                      the next time you complete a treatment plan form. You can
                                      remove it and add another name if needed.{' '}
                                    </div>
                                  }
                                >
                                  <div>
                                    <InfoIcon width='14' height='14' />
                                  </div>
                                </Popover>
                              </div>
                            </div>
                          </div>
                          {/* </When> */}
                          <DropdownPrimaryNormal
                            name='recommended_hours_to_wear_aligners'
                            label='Recommended daily wear hours'
                            classNameLabel='text-textColor text-lg font-medium'
                            className=' md:min-w-[400px]'
                            formik={formik}
                            required={true}
                            options={dailyWearHoursList}
                            placeholder='Choose from the list'
                          />
                        </div>
                      </When>
                    </div>
                  </BorderedCard>
                  <BorderedCard
                    header={{
                      title: 'Aligner details',
                      icon: 2,
                    }}
                    className='bg-primaryColor text-white'
                  >
                    <div className='flex flex-col gap-4'>
                      <HowToUse />
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center '>
                          <input
                            type='checkbox'
                            checked={formik.values.upperJaw}
                            onChange={(e) => {
                              formik.handleChange(e)
                              formik.setFieldValue('upperJawStartsWith', '')
                              formik.setFieldValue('upperJawEndsWith', '')
                              setInitialUpperBoxes([])
                              setUpperOptions([])
                              setSelectedUpperBoxes([])
                              formik.setTouched({}, false)
                              formik.setFieldTouched('upperJaw', false, false)
                            }}
                            className='mr-3 cursor-pointer green-checkbox'
                            id='green-checkbox-setup'
                            name='upperJaw'
                          />
                          <label className='text-base md:text-xl font-semibold  md:font-medium'>
                            Upper Jaw
                          </label>
                        </div>
                        <p
                          className={`${
                            formik.values.upperJaw ? 'text-neutralBlack' : 'text-textColor'
                          } font-medium text-xl hidden md:block`}
                        >
                          Aligner range
                        </p>
                        <div className='flex flex-wrap  gap-2'>
                          <div className='w-[44%] md:w-48'>
                            <InputText
                              label='Starts with'
                              name='upperJawStartsWith'
                              formik={formik}
                              className='rounded-lg border-0 '
                              classNameLabel={`${
                                formik.values.upperJaw ? 'text-textColor' : 'text-grayDisabled'
                              } font-medium md:text-lg text-base`}
                              labelColor=''
                              prefix='Aligner'
                              disabled={!formik.values.upperJaw}
                              type='number'
                              onChange={handleInputChange}
                            />
                          </div>
                          <p className='text-textColor text-base font-medium mt-10'>to</p>
                          <div className='w-[44%] md:w-48'>
                            <InputText
                              label='Ends with'
                              name='upperJawEndsWith'
                              formik={formik}
                              className='rounded-lg border-0 '
                              classNameLabel={`${
                                formik.values.upperJaw ? 'text-textColor' : 'text-grayDisabled'
                              } font-medium md:text-lg text-base`}
                              prefix='Aligner'
                              disabled={!formik.values.upperJaw}
                              type='number'
                              onChange={handleInputChange}
                              labelColor=''
                            />
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-1 md:gap-0'>
                          {formik.values.upperJaw &&
                            upperOptions.map((option, index) => (
                              <BoxComponent
                                key={index}
                                option={option}
                                selectedBoxes={selectedUpperBoxes}
                                handleBoxClick={handleBoxClick}
                                isUpperJaw={true}
                              />
                            ))}
                        </div>
                      </div>
                      <hr />
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center '>
                          <input
                            type='checkbox'
                            id='green-checkbox-setup'
                            checked={formik.values.lowerJaw}
                            onChange={(e) => {
                              formik.handleChange(e)
                              formik.setFieldValue('lowerJawStartsWith', '')
                              formik.setFieldValue('lowerJawEndsWith', '')
                              setInitialLowerBoxes([])
                              setLowerOptions([])
                              setSelectedLowerBoxes([])
                              formik.setTouched({}, false)
                              formik.setFieldTouched('upperJaw', false, false)
                            }}
                            className='mr-3 cursor-pointer green-checkbox'
                            name='lowerJaw'
                          />
                          <label className='text-base md:text-xl font-semibold  md:font-medium'>
                            Lower Jaw
                          </label>
                        </div>
                        <p
                          className={`${
                            formik.values.lowerJaw ? 'text-neutralBlack' : 'text-textColor'
                          } font-medium text-xl hidden md:block`}
                        >
                          Aligner range
                        </p>

                        <div className='flex flex-wrap  gap-2'>
                          <div className='w-[44%] md:w-48'>
                            <InputText
                              label='Starts with'
                              name='lowerJawStartsWith'
                              formik={formik}
                              className='rounded-lg border-0 '
                              classNameLabel={`${
                                formik.values.lowerJaw ? 'text-textColor' : 'text-grayDisabled'
                              } font-medium md:text-lg text-base`}
                              prefix='Aligner'
                              disabled={!formik.values.lowerJaw}
                              type='number'
                              onChange={handleInputChange}
                              labelColor=''
                            />
                          </div>
                          <p className='text-textColor text-base font-medium mt-10'>to</p>
                          <div className='w-[44%] md:w-48'>
                            <InputText
                              label='Ends with'
                              name='lowerJawEndsWith'
                              formik={formik}
                              className='rounded-lg border-0 '
                              classNameLabel={`${
                                formik.values.lowerJaw ? 'text-textColor' : 'text-grayDisabled'
                              } font-medium md:text-lg text-base`}
                              prefix='Aligner'
                              disabled={!formik.values.lowerJaw}
                              type='number'
                              onChange={handleInputChange}
                              labelColor=''
                            />
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-1 md:gap-0'>
                          {formik.values.lowerJaw &&
                            lowerOptions.map((option, index) => (
                              <BoxComponent
                                key={index}
                                option={option}
                                selectedBoxes={selectedLowerBoxes}
                                handleBoxClick={handleBoxClick}
                                className='bg-primarySupport text-primaryColor border border-primaryColor'
                                isUpperJaw={false}
                              />
                            ))}
                        </div>
                      </div>
                      {formik.errors.isAnyJawSelected && formik.touched.isAnyJawSelected && (
                        <div className='text-red text-xs flex '>
                          {formik.errors.isAnyJawSelected}
                        </div>
                      )}
                      <hr />
                      <When isTrue={hasValue(selectedLowerBoxes) || hasValue(selectedUpperBoxes)}>
                        <AlignersTable
                          selectedUpperBoxes={selectedUpperBoxes}
                          selectedLowerBoxes={selectedLowerBoxes}
                        />
                      </When>
                    </div>
                  </BorderedCard>

                  <BorderedCard
                    header={{
                      title: 'Treatment Plan',
                      icon: !hideAlignerDetails ? 3 : 2,
                    }}
                    className='bg-primaryColor text-white'
                  >
                    <div className='flex flex-col gap-7' ref={treatmentDetailsRef}>
                      <RadioGroupIcon
                        options={uploadTreatmentPlanTypes}
                        onOptionChange={(option) => {
                          formik.setFieldValue('video_files', null)
                          formik.setFieldValue('video_files_to_save', null)
                          formik.setFieldValue('pdf_file', null)
                          formik.setFieldValue('treatment_planning_link', '')
                          setPdfFileUrl(null)
                          setVideoFileUrls({
                            SINGLE_VIDEO: null,
                            TOP: null,
                            BOTTOM: null,
                            RIGHT: null,
                            LEFT: null,
                            FRONT: null,
                          })

                          formik.setFieldValue('treatment_plan_upload_type', option)
                        }}
                        selectedOption={formik.values.treatment_plan_upload_type}
                        wrapperClassName='flex-wrap'
                        label={
                          <div className='flex flex-col '>
                            <p>Upload Treatment Plan</p>
                            <p className='text-sm'>(Choose one option)</p>
                          </div>
                        }
                        labelClassName='text-textColor flex'
                        required
                        className='text-center text-sm font-medium rounded-md md:rounded-lg sm:px-4 w-full md:w-auto'
                      />
                      <When
                        isTrue={
                          formik.values.treatment_plan_upload_type ===
                          uploadTreatmentPlanConstants.TREATMENT_PLANNING_LINK
                        }
                      >
                        <div>
                          <InputText
                            label='Treatment planning link'
                            name='treatment_planning_link'
                            placeholder='Ex: https://www.mdpi.com/2075-4426/13/7/1028'
                            formik={formik}
                            className='rounded-lg md:mt-0 mt-2'
                          />
                          <div className='text-xs text-red mt-1'>
                            {formik?.touched.link_display_patient &&
                              formik?.errors.link_display_patient && (
                                <div className='text-red'>
                                  {formik?.errors.link_display_patient as string}
                                </div>
                              )}
                          </div>
                        </div>
                      </When>

                      <When
                        isTrue={
                          formik.values.treatment_plan_upload_type ===
                          uploadTreatmentPlanConstants.UPLOAD_SINGLE_VIDEO
                        }
                      >
                        <div>
                          <p className='text-textColor text-base font-medium'>
                            Single video <span className='text-red ml-1'>*</span>
                          </p>
                          <div className='flex gap-1 items-start text-textColor md:my-1 mt-2'>
                            <div className=' text-sm '>
                              Please upload videos in 1920x1080 format for the best viewing
                              experience
                            </div>
                          </div>
                        </div>
                        <div className='mt-2'>
                          {!hasValue(videoFileUrls.SINGLE_VIDEO) ? (
                            <div className='h-16 bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
                              <input
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  opacity: 0,
                                }}
                                type='file'
                                id='input'
                                name='video_file'
                                accept='video/mp4, video/mov, video/avi, video/mkv, video/webm, video/flv, video/wmv, video/3gp'
                                onChange={(e) => handleVideoFileChange('SINGLE_VIDEO', e)}
                              />
                              <label
                                htmlFor='image'
                                className='p-3 cursor-pointer flex-col justify-center items-center'
                              >
                                <div className='flex justify-center items-center gap-2'>
                                  <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                                  <p className='text-base font-semibold text-primaryColor'>
                                    Tap to upload files
                                  </p>
                                </div>
                              </label>
                            </div>
                          ) : (
                            <CommonVideoView
                              videoKey='SINGLE_VIDEO'
                              videoFileUrls={videoFileUrls}
                              handleVideoFileRemove={handleVideoFileRemove}
                            />
                          )}
                          {formik.errors.video_files && formik.touched.video_files && (
                            <div className='text-red text-xs flex mt-2'>
                              {formik.errors.video_files}
                            </div>
                          )}
                        </div>
                      </When>
                      <When
                        isTrue={
                          formik.values.treatment_plan_upload_type ===
                          uploadTreatmentPlanConstants.UPLOAD_MULTIPLE_VIDEOS
                        }
                      >
                        <div>
                          <div>
                            <p className='text-textColor text-base font-medium'>
                              Multiple videos <span className='text-red ml-1'>*</span>
                            </p>
                            <div className='flex gap-1 items-start text-textColor md:my-1 mt-2'>
                              <div className=' text-sm '>
                                Please upload videos in 1920x1080 format for the best viewing
                                experience
                              </div>
                            </div>
                          </div>
                          <div className='flex justify-start gap-8 mt-4 flex-wrap'>
                            {videoFileUrls.FRONT === null ? (
                              <CommonVideoInput
                                title='Front'
                                icon={FRONT_VIEW}
                                handleVideoFileChange={(
                                  videoType: string,
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoFileChange(videoType as VideoPositionKey, e)}
                              />
                            ) : (
                              <CommonVideoView
                                videoKey='FRONT'
                                videoFileUrls={videoFileUrls}
                                handleVideoFileRemove={handleVideoFileRemove}
                              />
                            )}

                            {videoFileUrls.TOP === null ? (
                              <CommonVideoInput
                                title='Top'
                                icon={TOP_VIEW}
                                handleVideoFileChange={(
                                  videoType: string,
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoFileChange(videoType as VideoPositionKey, e)}
                              />
                            ) : (
                              <CommonVideoView
                                videoKey='TOP'
                                videoFileUrls={videoFileUrls}
                                handleVideoFileRemove={handleVideoFileRemove}
                              />
                            )}
                            {videoFileUrls.BOTTOM === null ? (
                              <CommonVideoInput
                                title='Bottom'
                                icon={BOTTOM_VIEW}
                                handleVideoFileChange={(
                                  videoType: string,
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoFileChange(videoType as VideoPositionKey, e)}
                              />
                            ) : (
                              <CommonVideoView
                                videoKey='BOTTOM'
                                videoFileUrls={videoFileUrls}
                                handleVideoFileRemove={handleVideoFileRemove}
                              />
                            )}
                            {videoFileUrls.LEFT === null ? (
                              <CommonVideoInput
                                title='Left'
                                icon={LEFT_SIDE_VIEW}
                                handleVideoFileChange={(
                                  videoType: string,
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoFileChange(videoType as VideoPositionKey, e)}
                              />
                            ) : (
                              <CommonVideoView
                                videoKey='LEFT'
                                videoFileUrls={videoFileUrls}
                                handleVideoFileRemove={handleVideoFileRemove}
                              />
                            )}
                            {videoFileUrls.RIGHT === null ? (
                              <CommonVideoInput
                                title='Right'
                                icon={RIGHT_SIDE_VIEW}
                                handleVideoFileChange={(
                                  videoType: string,
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handleVideoFileChange(videoType as VideoPositionKey, e)}
                              />
                            ) : (
                              <CommonVideoView
                                videoKey='RIGHT'
                                videoFileUrls={videoFileUrls}
                                handleVideoFileRemove={handleVideoFileRemove}
                              />
                            )}
                          </div>

                          {/* <div className='flex justify-evenly gap-8 mt-4 flex-wrap'>
                    {videoPositions.map(({key, title, icon}) => (
                      <div key={key}>{renderVideoInput(key as VideoPositionKey, title, icon)} </div>
                    ))}
                  </div> */}
                          {formik.errors.video_files && formik.touched.video_files && (
                            <div className='text-red text-xs flex mt-7'>
                              {formik.errors.video_files}
                            </div>
                          )}
                        </div>
                      </When>
                      <When
                        isTrue={
                          formik.values.treatment_plan_upload_type ===
                          uploadTreatmentPlanConstants.UPLOAD_PDF
                        }
                      >
                        <div>
                          <div className='flex flex-col mb-2'>
                            <p className='text-textColor text-base font-medium'>
                              Upload PDF <span className='text-red ml-1'>*</span>
                            </p>
                          </div>
                          <When isTrue={!hasValue(pdfFileUrl)}>
                            <div className='h-16 bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
                              <input
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  opacity: 0,
                                }}
                                type='file'
                                id='pdf'
                                accept='.pdf'
                                onChange={handlePdfFileChange}
                                className='cursor-pointer'
                              />
                              <label
                                htmlFor='pdf'
                                className='p-3 cursor-pointer flex-col justify-center items-center'
                              >
                                <div className='flex justify-center items-center gap-2'>
                                  <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                                  <p className='text-base font-semibold text-primaryColor'>
                                    Tap to upload files
                                  </p>
                                </div>
                              </label>
                            </div>
                          </When>
                          <When isTrue={hasValue(pdfFileUrl)}>
                            <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between '>
                              <div className='flex items-center md:w-[42.5%] gap-2 flex-shrink justify-between'>
                                <div
                                  className='flex items-center justify-between gap-4 cursor-pointer'
                                  onClick={() => {
                                    pdfFileUrl?.[0]?.url && handleOpenPDF(pdfFileUrl?.[0]?.url)
                                  }}
                                >
                                  <Image
                                    className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                                    onClick={() => {
                                      pdfFileUrl?.[0]?.url && handleOpenPDF(pdfFileUrl?.[0]?.url)
                                    }}
                                    size={20}
                                    src={pdfPng}
                                  />
                                  <p className='break-all'>{formik.values.pdf_file?.name} </p>
                                </div>
                                <div
                                  className='cursor-pointer'
                                  onClick={() => {
                                    handleRemovePdfFile()
                                  }}
                                >
                                  <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                                </div>
                              </div>
                            </div>
                          </When>
                          {formik.errors.pdf_file && formik.touched.pdf_file && (
                            <div className='text-red text-xs flex mt-2'>
                              {typeof formik.errors.pdf_file === 'string' && formik.errors.pdf_file}
                            </div>
                          )}
                        </div>
                      </When>

                      {/* <DropdownPrimaryNormal
                name='treatment_planning_software'
                label='Treatment Planning Software (Optional)'
                formik={formik}
                options={treatmentSoftwareList}
                placeholder='Select the software'
                defaultValue={formik.values.treatment_planning_software}
              /> */}

                      {/* End */}
                    </div>
                  </BorderedCard>
                  <BorderedCard
                    header={{
                      title: 'Clinical Procedures',
                      subTitle: 'Upload IPR charts, define clinical procedures',
                      icon: !toBeCloned ? 4 : 3,
                    }}
                    className='bg-primaryColor text-white '
                  >
                    <div className='mb-4'>
                      <div className='flex justify-between mb-2 items-center'>
                        <p className='text-lg text-textColor'>IPR/ Attachment charts (Optional)</p>
                        <When isTrue={fileUrls?.length > 0}>
                          <button
                            type='button'
                            className='text-secondaryColor text-sm font-medium text-right'
                            onClick={() => {
                              formik.setFieldValue('files', [])
                              setFileUrls([])
                              formik.setFieldValue('file_ids_to_clone', [])
                            }}
                          >
                            Clear all
                          </button>
                        </When>
                      </div>

                      <When isTrue={!hasValue(fileUrls)}>
                        <div className='h-16 bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
                          <input
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              opacity: 0,
                            }}
                            type='file'
                            id='image'
                            multiple
                            accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                            onChange={handleFileChange}
                            className='cursor-pointer'
                          />
                          <label
                            htmlFor='image'
                            className='p-3 cursor-pointer flex-col justify-center items-center'
                          >
                            <div className='flex justify-center items-center gap-2'>
                              <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                              <p className='text-base font-semibold text-primaryColor'>
                                Tap to upload files
                              </p>
                            </div>
                          </label>
                        </div>
                      </When>
                      <When isTrue={hasValue(fileUrls)}>
                        <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between '>
                          {fileUrls?.map((file, index) => (
                            <div
                              key={index}
                              className='flex items-center md:w-[42.5%] gap-2 flex-shrink justify-between'
                            >
                              <div
                                className='flex items-center justify-between gap-4 cursor-pointer'
                                onClick={() => {
                                  if (file.extension === 'mp4' || file.extension === 'pdf') {
                                    handleOpenPDF(file.url ?? '')
                                  } else {
                                    setIsShowPhotos(true)
                                    setSelectedIndex(index)
                                  }
                                }}
                              >
                                <When
                                  isTrue={
                                    file.type !== 'application/pdf' &&
                                    file.type !== 'video/mp4' &&
                                    file.extension !== 'mp4' &&
                                    file.extension !== 'pdf'
                                  }
                                >
                                  <Image
                                    src={getImageUrl(file)}
                                    alt='Uploaded file '
                                    className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                                    onClick={() => {
                                      setIsShowPhotos(true)
                                      setSelectedIndex(index)
                                    }}
                                    size={20}
                                    fileName={formik.values.files[index]?.name}
                                    showFileName={true}
                                    showLoading={true}
                                  />
                                </When>
                                <When
                                  isTrue={file.type === 'video/mp4' || file.extension === 'mp4'}
                                >
                                  <Image
                                    className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                                    onClick={() => handleOpenPDF(file?.url ?? '')}
                                    size={20}
                                    src={mp4Png}
                                  />
                                  <TextWithTooltip>
                                    {formik.values.files[index]?.name}
                                  </TextWithTooltip>
                                </When>
                                <When
                                  isTrue={
                                    file.type === 'application/pdf' || file.extension === 'pdf'
                                  }
                                >
                                  <Image
                                    className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                                    onClick={() => handleOpenPDF(file.url ?? '')}
                                    size={20}
                                    src={pdfPng}
                                  />
                                  <p className='break-all'>{formik.values.files[index]?.name} </p>
                                </When>
                              </div>
                              <div
                                className='cursor-pointer'
                                onClick={() => {
                                  handleRemoveFile(index)
                                }}
                              >
                                <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                              </div>
                            </div>
                          ))}
                        </div>
                        <When isTrue={formik.values.files.length < 5}>
                          <div className='w-[139px] h-10 border border-primaryColor rounded-lg flex justify-center items-center cursor-pointer relative mt-3'>
                            <input
                              style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                opacity: 0,
                              }}
                              type='file'
                              id='image'
                              multiple
                              accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                              onChange={handleFileChange}
                            />
                            <label
                              htmlFor='image'
                              className='p-3 cursor-pointer flex-col justify-center items-center'
                            >
                              <div className='flex flex-row gap-2 justify-center items-center '>
                                <CommonSVG svg={SVG_CLOUD} width='22' height='18' />
                                <p className='text-sm font-semibold text-primaryColor'>
                                  Upload file
                                </p>
                              </div>
                            </label>
                          </div>
                        </When>
                      </When>
                    </div>
                    <InputTextArea
                      label='Remarks (Optional)'
                      name='remarks'
                      placeholder='Write your thoughts'
                      formik={formik}
                      className='py-2 rounded-lg  h-14 card-wrapper '
                      classNameLabel='font-medium md:text-lg text-base text-textColor mt-15'
                      maxLength={2000}
                    />
                  </BorderedCard>

                  <BorderedCard
                    header={{
                      title: 'Other files',
                      subTitle: '',
                      icon: !toBeCloned ? 5 : 4,
                    }}
                    className='bg-primaryColor text-white '
                  >
                    <div className='mb-4'>
                      <div className='flex justify-between mb-2 items-center'>
                        <p className='text-lg text-textColor'>Other files (Optional)</p>
                        <When isTrue={otherFileUrls?.length > 0}>
                          <button
                            type='button'
                            className='text-secondaryColor text-sm font-medium text-right'
                            onClick={() => {
                              formik.setFieldValue('other_files', [])
                              setOtherFileUrls([])
                              formik.setFieldValue('file_ids_to_clone', [])
                            }}
                          >
                            Clear all
                          </button>
                        </When>
                      </div>

                      <When isTrue={!hasValue(otherFileUrls)}>
                        <div className='h-16 bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
                          <input
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              right: 0,
                              opacity: 0,
                            }}
                            type='file'
                            id='image'
                            multiple
                            accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                            onChange={handleOtherFileChange}
                            className='cursor-pointer'
                          />
                          <label
                            htmlFor='image'
                            className='p-3 cursor-pointer flex-col justify-center items-center'
                          >
                            <div className='flex justify-center items-center gap-2'>
                              <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                              <p className='text-base font-semibold text-primaryColor'>
                                Tap to upload files
                              </p>
                            </div>
                          </label>
                        </div>
                      </When>
                      <When isTrue={hasValue(otherFileUrls)}>
                        <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between '>
                          {otherFileUrls?.map((file, index) => (
                            <div
                              key={index}
                              className='flex items-center md:w-[42.5%] gap-2 flex-shrink justify-between'
                            >
                              <div
                                className='flex items-center justify-between gap-4 cursor-pointer'
                                onClick={() => {
                                  if (file.extension === 'mp4' || file.extension === 'pdf') {
                                    handleOpenPDF(file.url ?? '')
                                  } else {
                                    setIsShowPhotos(true)
                                    setSelectedIndex(index)
                                  }
                                }}
                              >
                                <When
                                  isTrue={
                                    file.type !== 'application/pdf' &&
                                    file.type !== 'video/mp4' &&
                                    file.extension !== 'mp4' &&
                                    file.extension !== 'pdf'
                                  }
                                >
                                  <Image
                                    src={file.url ?? ''}
                                    alt='Uploaded file '
                                    className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                                    onClick={() => {
                                      setIsShowPhotos(true)
                                      setSelectedIndex(index)
                                    }}
                                    size={20}
                                    fileName={formik.values.other_files[index]?.name}
                                    showFileName={true}
                                    showLoading={true}
                                  />
                                </When>
                                <When
                                  isTrue={file.type === 'video/mp4' || file.extension === 'mp4'}
                                >
                                  <Image
                                    className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                                    onClick={() => handleOpenPDF(file?.url ?? '')}
                                    size={20}
                                    src={mp4Png}
                                  />
                                  <TextWithTooltip>
                                    {formik.values.other_files[index]?.name}
                                  </TextWithTooltip>
                                </When>
                                <When
                                  isTrue={
                                    file.type === 'application/pdf' || file.extension === 'pdf'
                                  }
                                >
                                  <Image
                                    className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                                    onClick={() => handleOpenPDF(file.url ?? '')}
                                    size={20}
                                    src={pdfPng}
                                  />
                                  <p className='break-all'>
                                    {formik.values.other_files[index]?.name}{' '}
                                  </p>
                                </When>
                              </div>
                              <div
                                className='cursor-pointer'
                                onClick={() => {
                                  handleRemoveOtherFile(index)
                                }}
                              >
                                <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                              </div>
                            </div>
                          ))}
                        </div>
                        <When isTrue={formik.values.other_files.length < 5}>
                          <div className='w-[139px] h-10 border border-primaryColor rounded-lg flex justify-center items-center cursor-pointer relative mt-3'>
                            <input
                              style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                opacity: 0,
                              }}
                              type='file'
                              id='image'
                              multiple
                              accept='.jpg, .jpeg, .png, .pdf, .mp4, .mov'
                              onChange={handleOtherFileChange}
                            />
                            <label
                              htmlFor='image'
                              className='p-3 cursor-pointer flex-col justify-center items-center'
                            >
                              <div className='flex flex-row gap-2 justify-center items-center '>
                                <CommonSVG svg={SVG_CLOUD} width='22' height='18' />
                                <p className='text-sm font-semibold text-primaryColor'>
                                  Upload file
                                </p>
                              </div>
                            </label>
                          </div>
                        </When>
                      </When>
                    </div>
                  </BorderedCard>
                </div>
                {!isStepperMode && !existingCase ? (
                  <div className='font-semibold text-base flex flex-col-reverse md:flex-row gap-3 mt-3 justify-end '>
                    <button
                      className='text-grayDisabled'
                      type='button'
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      Cancel
                    </button>
                    {!toBeCloned && (
                      <button
                        type='button'
                        className={`  rounded-lg p-3 cursor-pointer bg-primarySupport border border-primaryColor text-primaryColor`}
                        onClick={() => {
                          if (!formik.isValid) {
                            formik.setTouched(
                              Object.keys(formik.values).reduce(
                                (acc, key) => ({...acc, [key]: true}),
                                {}
                              )
                            )
                            return
                          }
                          const values = formik?.values
                          const alignerDetails = {
                            upper_jaw: {
                              starts_with: values.upperJawStartsWith,
                              ends_with: values.upperJawEndsWith,
                              range: selectedUpperBoxes,
                            },
                            lower_jaw: {
                              starts_with: values.lowerJawStartsWith,
                              ends_with: values.lowerJawEndsWith,
                              range: selectedLowerBoxes,
                            },
                          }

                          const treatmentPlanToSave = {
                            treatment_plan_tag_name: values.treatment_plan_tag_name,
                            aligner_treatment_details: alignerDetails,
                            treatment_plan_id: treatmentPlan?.treatment_plan_id ?? null,
                            treatment_sub_type: treatmentTypeMain.ALIGNERS,
                            production_lab_details: {
                              production_lab_id: values.brand_name?.value,
                              brand_name: values.brand_name?.label,
                            },
                            status: 'DRAFT',
                            days_to_wear_each_aligner: values.days_to_wear_each_aligner?.value,
                            recommended_hours_to_wear_aligners:
                              values.recommended_hours_to_wear_aligners?.value,
                            treatment_planning_software:
                              values.treatment_planning_software?.value ?? '',
                            treatment_planning_link: values.treatment_planning_link,
                            remarks: values.remarks,
                            filesToSave: values.files ?? [],
                            otherFilesToSave: values.other_files ?? [],
                            files: fileUrls,
                            other_files: otherFileUrls,
                            video_files: videoFileUrls,
                            video_files_to_save: values.video_files ?? [],
                            doctor_id: safeParseInt(userId),
                            patient_id: safeParseInt(patientId),
                            aligner_details_meta_data: alignerDetails,
                            is_link_display_patient: values.link_display_patient,
                            is_video_display_patient: values.video_display_to_patient,
                            approved_by_patient_at: null,
                            ...((hasValue(treatmentPlan.order_id) ||
                              (hasValue(orderId) && orderId !== 'null')) && {
                              order_id: orderId ?? treatmentPlan.order_id,
                            }),
                            pdf_file_to_save: values.pdf_file,
                            pdf_files: pdfFileUrl,
                            treatment_plan_upload_type: values.treatment_plan_upload_type,
                            created_at: treatmentPlan?.created_at ? treatmentPlan.created_at : null,
                            file_ids_to_clone: values.file_ids_to_clone,
                          }
                          dispatchAction(setTreatmentPlan(treatmentPlanToSave))

                          dispatchAction(setOpenDraftModal(true))
                        }}
                      >
                        Save as draft
                      </button>
                    )}
                    <AntdButton
                      onClick={(e) => {
                        e.stopPropagation()
                        formik.handleSubmit()
                      }}
                      className='md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
                      disabled={createTreatmentPlanLoading}
                      loading={createTreatmentPlanLoading}
                      text={hideAlignerDetails ? 'Send for approval' : 'Save & Continue'}
                    />
                  </div>
                ) : null}
              </fieldset>
            </form>
          </Spin>
          {existingCase && (
            <FooterForExisting
              {...{
                text: 'Save & Continue',
                loading: createTreatmentPlanLoading,
                onNext: () => {
                  if (hasActiveTreatmentPlan) return
                  formik.handleSubmit()
                },
                disabled: hasActiveTreatmentPlan,
              }}
            />
          )}

          {isStepperMode && (
            <FooterForStarterPlan
              {...{
                nextButtonText:
                  treatmentPlan?.status === treatmentPlanStatusConstants.ACTIVE
                    ? 'Next'
                    : 'Save & Continue',
                onNext: () => {
                  if (treatmentPlan?.status === treatmentPlanStatusConstants.ACTIVE) {
                    dispatchAction(setCurrentStep('4'))
                  } else {
                    formik.handleSubmit()
                  }
                },
              }}
            />
          )}
        </Page>
      )}
    </>
  )
}

export default SetupTreatmentPlan
