import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import Page from 'components/page/Page'
import {useFormik} from 'formik'
import {Image} from 'assets/images/Images/Image'
import appointmentJawsOptionList from '@staticData/appointmentJawsOptionList'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useRef, useState} from 'react'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {ApiGetData, getImageUrl, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import productTypes from '@constants/productTypes'
import {TagRenderForMissingToothDropdown} from 'components/tags/TagRenderForMissingToothDropdown'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import jawType from '@constants/jawType'
import hasValue from 'utils/hasValue'

import RadioGroups from 'components/RadioGroup/RadioGroups'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_CLOUD, SVG_CROSS, SVG_PLUS_GRAY, SVG_PLUS_PRIMARY} from 'utils/SvgConstants'
import InputText from 'components/atom/Inputs/InputText'
import Spinner from 'components/spinner/Spinner'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import fileFormatType from '@staticData/fileFormatType'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import MultiSelectTags from 'components/multiSelect/MultiSelectTags'
import {
  getBracesNotesDetails,
  getBracesTreatmentMaterialNameList,
  getBracesTreatmentMaterialShapeList,
  getBracesTreatmentMaterialSizeList,
  getBracesTreatmentStageList,
  getSpaceClosureToolAndAccessoriesList,
  postAddAccessories,
  postAttachBracesNotes,
  postAddMaterialName,
  postAddMaterialSize,
  postAddPhotos,
  postAddSpaceAndClosure,
  postUpdateAttachedBracesNotes,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {AddAppointmentData, AppointmentPostData, jawTypeDetail} from './types/appointments.types'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import {getBracesTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {convertYYYYMMDDTOddddDDMMMMYY} from './utils/DateConversion'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {deleteFiles} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import userTypes from '@constants/userTypes'
import {Button} from 'antd'
import dayjs from 'dayjs'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {addAppointmentEvent} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {AxiosError} from 'axios'

type FilterOption = {
  value: string
  label: string
}

interface AddAppointmentProps {
  isInline?: boolean
  onCancel?: () => void
  onSuccess?: () => void
  propAppointmentId?: string
}

const EMPTY_JAW_TYPE = {
  jaw_type: '',
  treatment_stage_type: '',
  shape: '',
  material_name: '',
  material_size: '',
  space_enclosure_tools: [],
  accessories: [],
  note: '',
  input_material_name: '',
  input_material_size: '',
  input_space_enclosure_tools: '',
  input_accessories: '',
}

const formatAppointmentDetails = (details: jawTypeDetail) => ({
  jaw_type: details.jaw_type,
  treatment_stage_type: details.treatment_stage_type,
  shape: details.shape,
  material_name: details.material_name,
  material_size: details.material_size,
  space_enclosure_tools: details.space_enclosure_tools,
  accessories: details.accessories,
  note: details.note,
  input_material_name: '',
  input_material_size: '',
  input_space_enclosure_tools: '',
  input_accessories: '',
})

const AddAppointment: React.FC<AddAppointmentProps> = ({
  onCancel,
  onSuccess,
  propAppointmentId,
}) => {
  const navigation = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const {userId} = useContext(AuthContext)

  const {patientId, bracesJourneyId} = useParams()
  const appointmentId = propAppointmentId || searchParams.get('appointmentId')
  const reminderId = searchParams.get('reminderId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const jawTypeSmall = {
    UPPER: 'upper',
    LOWER: 'lower',
    BOTH: 'both',
  }

  const multipleSelectTypes = {
    SPACE_CLOSURE_TOOLS: 'Space closure tools',
    ACCESSORIES: 'Accessories',
  }

  const multipleSelectTypeList = {
    SPACE_CLOSURE_TOOLS: 'SPACE_CLOSURE_TOOL',
    ACCESSORIES: 'ACCESSORIES',
  }

  const {
    getBracesTreatmentStageListLoading,
    bracesTreatmentStageList,
    bracesTreatmentMaterialShapeList,
    getBracesTreatmentMaterialShapeListLoading,
    bracesTreatmentMaterialNameList,
    getBracesTreatmentMaterialNameListLoading,
    bracesTreatmentMaterialSizeList,
    getBracesTreatmentMaterialSizeListLoading,
    spaceClosureToolList,
    accessoriesList,
    postAddMaterialNameLoading,
    postAddMaterialSizeLoading,
    bracesNotesDetails: appointmentDetails,
    postAddAppointmentLoading,
  } = useSelector((state: RootState) => state.bracesNotes)

  const [isInputAddMaterialVisible, setIsInputAddMaterialVisible] = useState(false)
  const [isInputAddMaterialSizeVisible, setIsInputAddMaterialSizeVisible] = useState(false)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [fileUrls, setFileUrls] = useState<Array<{url: string; type: string}>>([])
  const [practiceLocationList, setPracticeLocationList] = useState<any>([])

  // 👇 put these inside the AddAppointment component, before getInitialValues
  const initialStartDateRef = useRef(startDate || dayjs().format('YYYY-MM-DD HH:mm'))
  const initialEndDateRef = useRef(endDate || dayjs().format('YYYY-MM-DD HH:mm'))

  const getInitialValues = (): AddAppointmentData => {
    // ✅ Use appointmentDetails only when EDITING (appointmentId present)
    if (hasValue(appointmentId) && hasValue(appointmentDetails)) {
      return {
        braces_journey_id: safeParseInt(bracesJourneyId),
        amount: 0,
        status: treatmentPlanStatusConstants.DRAFT,
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        start_date: appointmentDetails?.start_date,
        end_date: appointmentDetails?.end_date,
        product_type_name: productTypes.BRACES,
        jaw_main_type: appointmentDetails.jaw_main_type,
        both: formatAppointmentDetails(appointmentDetails.both),
        upper: formatAppointmentDetails(appointmentDetails.upper),
        lower: formatAppointmentDetails(appointmentDetails.lower),
        files: [],
        draft_files: [],
        reminder_id: safeParseInt(reminderId),
      }
    }

    // ✅ New appointment → always fresh form, but fixed for this mount
    return {
      braces_journey_id: safeParseInt(bracesJourneyId),
      amount: 0,
      status: treatmentPlanStatusConstants.ACTIVE,
      doctor_id: safeParseInt(userId),
      patient_id: safeParseInt(patientId),
      start_date: initialStartDateRef.current,
      end_date: initialEndDateRef.current,
      product_type_name: productTypes.BRACES,
      jaw_main_type: appointmentJawTypes.BOTH,
      both: EMPTY_JAW_TYPE,
      upper: EMPTY_JAW_TYPE,
      lower: EMPTY_JAW_TYPE,
      files: [],
      draft_files: [],
      reminder_id: safeParseInt(reminderId),
    }
  }

  const formik = useFormik<AddAppointmentData>({
    initialValues: getInitialValues(),
    enableReinitialize: true,
    onSubmit: async (values) => {
      identifyUser()

      const appointmentDetailsToSave: AddAppointmentData & {reminder_id: number} = {
        braces_journey_id: safeParseInt(bracesJourneyId),
        amount: 0,
        status:
          appointmentDetails?.status === treatmentPlanStatusConstants.ACTIVE
            ? treatmentPlanStatusConstants.ACTIVE
            : treatmentPlanStatusConstants.DRAFT,
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        reminder_id:
          values.reminder_id === 0 && appointmentDetails
            ? appointmentDetails.reminder_id
            : values.reminder_id,
        start_date: values.start_date,
        end_date: values.end_date,
        product_type_name: productTypes.BRACES,
        jaw_main_type: values.jaw_main_type,
        both: {
          jaw_type: appointmentJawTypes.BOTH,
          treatment_stage_type: values.both.treatment_stage_type,
          shape: values.both.shape,
          material_name: values.both.material_name,
          material_size: values.both.material_size,
          space_enclosure_tools: values.both.space_enclosure_tools,
          accessories: values.both.accessories,
          note: values.both.note,
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        },
        upper: {
          jaw_type: jawType.UPPER,
          treatment_stage_type: values.upper.treatment_stage_type,
          shape: values.upper.shape,
          material_name: values.upper.material_name,
          material_size: values.upper.material_size,
          space_enclosure_tools: values.upper.space_enclosure_tools,
          accessories: values.upper.accessories,
          note: values.upper.note,
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        },
        lower: {
          jaw_type: jawType.LOWER,
          treatment_stage_type: values.lower.treatment_stage_type,
          shape: values.lower.shape,
          material_name: values.lower.material_name,
          material_size: values.lower.material_size,
          space_enclosure_tools: values.lower.space_enclosure_tools,
          accessories: values.lower.accessories,
          note: values.lower.note,
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        },
        local_files: fileUrls,
        new_files: values.files,
        files:
          appointmentDetails?.files && appointmentDetails?.files.length > 0
            ? appointmentDetails?.files
            : values.files,
        draft_files:
          appointmentDetails?.draft_files && appointmentDetails?.draft_files?.length > 0
            ? appointmentDetails?.draft_files
            : [],
      }

      dispatchAction(setAppointmentDetails(appointmentDetailsToSave))
      let queryParams: string

      if (hasValue(appointmentId)) {
        queryParams = new URLSearchParams({
          appointmentId: String(appointmentId),
          new: !hasValue(appointmentId) ? 'true' : 'false',
          isEditAppointment: 'true',
        }).toString()
      } else {
        queryParams = new URLSearchParams({
          new: 'true',
          isEditAppointment: 'true',
        }).toString()
      }

      navigation(`/profile/${patientId}/${bracesJourneyId}/bracesNotes/viewNotes?${queryParams}`)
    },
  })
  useEffect(() => {
    getClinics()
  }, [])
  const getClinics = () => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
      },
    }
    dispatchAction(postApiDataListActivePracticeLocation(postData) as any)
      .unwrap()
      .then((res: any) => {
        const clinicList: any = []
        res?.practice_location_list?.forEach((element: any) => {
          clinicList.push({
            value: element.practice_location_id.toString(),
            label: element.practice_location_name,
            country: element.country,
            state: element.state,
            city: element.city,
          })
        })

        setPracticeLocationList(clinicList)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  const onSubmitHandler = async (
    values: AddAppointmentData,
    treatmentPlanStatus: keyof typeof treatmentPlanStatusConstants = treatmentPlanStatusConstants.ACTIVE
  ) => {
    try {
      // Check if this is an edit operation
      const isEdit = hasValue(appointmentId)

      if (isEdit) {
        // EDIT MODE: Only call postUpdateAttachedBracesNotes (NO addAppointmentEvent)
        const appointmentUpdateDetails: AppointmentPostData = {
          appointment_id: safeParseInt(appointmentId),
          braces_journey_id: values.braces_journey_id,
          reminder_id: appointmentDetails?.reminder_id,
          amount: values.amount,
          status: treatmentPlanStatusConstants.ACTIVE,
          doctor_id: values.doctor_id,
          patient_id: values.patient_id,
          start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          product_type_name: values.product_type_name,
          jaw_details:
            values.jaw_main_type === appointmentJawTypes.BOTH
              ? [
                  {
                    jaw_type: appointmentJawTypes.BOTH,
                    treatment_stage_type: values.both.treatment_stage_type,
                    shape: values.both.shape,
                    material_name: values.both.material_name,
                    material_size: values.both.material_size,
                    space_enclosure_tools: values.both.space_enclosure_tools,
                    accessories: values.both.accessories,
                    note: values.both.note,
                  },
                ]
              : [
                  {
                    jaw_type: appointmentJawTypes.UPPER,
                    treatment_stage_type: values.upper.treatment_stage_type,
                    shape: values.upper.shape,
                    material_name: values.upper.material_name,
                    material_size: values.upper.material_size,
                    space_enclosure_tools: values.upper.space_enclosure_tools,
                    accessories: values.upper.accessories,
                    note: values.upper.note,
                  },
                  {
                    jaw_type: appointmentJawTypes.LOWER,
                    treatment_stage_type: values.lower.treatment_stage_type,
                    shape: values.lower.shape,
                    material_name: values.lower.material_name,
                    material_size: values.lower.material_size,
                    space_enclosure_tools: values.lower.space_enclosure_tools,
                    accessories: values.lower.accessories,
                    note: values.lower.note,
                  },
                ],
          files: values.files,
        }

        await dispatchAction(postUpdateAttachedBracesNotes(appointmentUpdateDetails)).unwrap()

        // Handle photos for edit mode
        const postAddPhoto = {
          doctor_id: safeParseInt(userId),
          appointment_id: safeParseInt(appointmentId),
          files: values.files,
        }
        await dispatchAction(postAddPhotos(postAddPhoto))

        identifyUser()

        SuccessToast('Notes updated successfully')
        navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
      } else {
        if (!practiceLocationList || practiceLocationList.length === 0) {
          ErrorToast('No practice location found. Please contact support.')
          return
        }

        const payload = {
          practice_location_id: null,
          start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          notes: '',
          amount: values.amount,
          patient_id: values.patient_id,
          doctor_id: safeParseInt(userId),
        }

        const res: any = await dispatchAction(addAppointmentEvent(payload as any)).unwrap()
        const reminderId = res?.reminder_id

        const appointmentSaveDetails: AppointmentPostData = {
          braces_journey_id: values.braces_journey_id,
          amount: values.amount,
          reminder_id: reminderId,
          status: treatmentPlanStatus,
          doctor_id: values.doctor_id,
          patient_id: values.patient_id,
          start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          product_type_name: values.product_type_name,
          jaw_details:
            values.jaw_main_type === appointmentJawTypes.BOTH
              ? [
                  {
                    jaw_type: appointmentJawTypes.BOTH,
                    treatment_stage_type: values.both.treatment_stage_type,
                    shape: values.both.shape,
                    material_name: values.both.material_name,
                    material_size: values.both.material_size,
                    space_enclosure_tools: values.both.space_enclosure_tools,
                    accessories: values.both.accessories,
                    note: values.both.note,
                  },
                ]
              : [
                  {
                    jaw_type: appointmentJawTypes.UPPER,
                    treatment_stage_type: values.upper.treatment_stage_type,
                    shape: values.upper.shape,
                    material_name: values.upper.material_name,
                    material_size: values.upper.material_size,
                    space_enclosure_tools: values.upper.space_enclosure_tools,
                    accessories: values.upper.accessories,
                    note: values.upper.note,
                  },
                  {
                    jaw_type: appointmentJawTypes.LOWER,
                    treatment_stage_type: values.lower.treatment_stage_type,
                    shape: values.lower.shape,
                    material_name: values.lower.material_name,
                    material_size: values.lower.material_size,
                    space_enclosure_tools: values.lower.space_enclosure_tools,
                    accessories: values.lower.accessories,
                    note: values.lower.note,
                  },
                ],
          files: values.files,
        }

        await dispatchAction(postAttachBracesNotes(appointmentSaveDetails)).unwrap()

        if (onSuccess) {
          onSuccess()
          return
        }

        SuccessToast('Appointment Added successfully')
        navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
      }
    } catch (error: any) {
      console.error('onSubmitHandler error:', error)
      if (error === 'AP003') {
        ErrorToast('Appointment already exists. Please choose another date')
      } else {
        ErrorToast('An error occurred. Please try again.')
      }
    }
  }

  const getValueByLabel = (arrayList: FilterOption[], label: string): string =>
    arrayList ? (arrayList.find((item: FilterOption) => item.label === label)?.value ?? '0') : '0'

  const onClickAddMaterial = (jawTypeName: keyof typeof jawType) => {
    const inputValue = formik.getFieldProps(`${jawTypeName}.input_material_name`).value
    setIsInputAddMaterialVisible(true)

    if (!hasValue(inputValue)) return

    const getShapeId = () => {
      const shapeList =
        jawTypeName === jawType.LOWER
          ? bracesTreatmentMaterialShapeList.lower
          : bracesTreatmentMaterialShapeList.upper
      const shapeValue =
        jawTypeName === jawType.LOWER
          ? formik.values.lower.shape
          : formik.values[jawTypeName === jawType.UPPER ? 'upper' : 'both'].shape
      return safeParseInt(getValueByLabel(shapeList, shapeValue))
    }

    const payload = {
      id: getShapeId(),
      doctor_id: safeParseInt(userId),
      material_name: inputValue,
    }

    dispatchAction(postAddMaterialName(payload))
      .unwrap()
      .then((res: any) => {
        if (res) {
          dispatchAction(
            getBracesTreatmentMaterialNameList({
              doctor_id: safeParseInt(userId),
              treatmentMaterialShapeId: getShapeId(),
              jawType: jawTypeName,
            })
          )
            .unwrap()
            .then(() => {
              formik.setFieldValue(`${jawTypeName}.material_name`, inputValue)
              dispatchAction(
                getBracesTreatmentMaterialSizeList({
                  doctor_id: safeParseInt(userId),
                  treatmentMaterialNameId: safeParseInt(
                    getValueByLabel(
                      jawTypeName === jawType.LOWER
                        ? bracesTreatmentMaterialNameList.lower
                        : bracesTreatmentMaterialNameList.upper,
                      inputValue
                    )
                  ),
                  jawType: jawTypeName,
                })
              )
            })
        }
      })
      .catch((error: string) => {
        if (error === 'M00001') ErrorToast('Material with this name already present')
      })
  }

  const onClickAddMaterialSize = (jawTypeName: keyof typeof jawType) => {
    setIsInputAddMaterialSizeVisible(true)

    const inputValue = formik.getFieldProps(`${jawTypeName}.input_material_size`).value
    if (!hasValue(inputValue)) return

    const getMaterialName = () => {
      const materialName =
        jawTypeName === jawType.LOWER
          ? formik.values.lower.material_name
          : formik.values[jawTypeName === jawType.UPPER ? 'upper' : 'both'].material_name
      const nameList =
        jawTypeName === jawType.LOWER
          ? bracesTreatmentMaterialNameList.lower
          : bracesTreatmentMaterialNameList.upper
      return safeParseInt(getValueByLabel(nameList, materialName))
    }

    const payload = {
      id: getMaterialName(),
      doctor_id: safeParseInt(userId),
      material_name: inputValue,
    }

    dispatchAction(postAddMaterialSize(payload))
      .unwrap()
      .then((res: any) => {
        if (res) {
          dispatchAction(
            getBracesTreatmentMaterialSizeList({
              doctor_id: safeParseInt(userId),
              treatmentMaterialNameId: getMaterialName(),
              jawType: jawTypeName,
            })
          )
            .unwrap()
            .then(() => {
              formik.setFieldValue(`${jawTypeName}.material_size`, inputValue)
            })
        }
      })
      .catch((error: string) => {
        if (error === 'M00001') ErrorToast('Material size with this name already present')
      })
  }

  useEffect(() => {
    dispatchAction(
      getBracesTreatmentPlanList({
        doctor_id: String(userId),
        patient_id: String(patientId),
        braces_treatment_stage: bracesTreatmentStages.ACTIVE,
      })
    )

    dispatchAction(getBracesTreatmentStageList({data: null}))
    dispatchAction(getSpaceClosureToolAndAccessoriesList({doctor_id: safeParseInt(userId)}))

    if (hasValue(appointmentDetails)) {
      if (appointmentDetails.jaw_main_type === jawType.BOTH) {
        prefillAppointmentTypeDetails(jawType.BOTH)
      } else {
        prefillAppointmentTypeDetails(jawType.UPPER)
        prefillAppointmentTypeDetails(jawType.LOWER)
      }
    }
  }, [appointmentDetails])

  const {subscriptionData} = useSubscriptionDetails()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files?.length > 0) {
      const validatedFileList = validateAndProcessPhotos({
        files: event.currentTarget.files,
        fileCount: 16,
        toastMessage: 'You can upload a maximum of 15 files at a time',
        chatFileFormats: fileFormatType.TREATMENT_PLAN_EXTENSIONS,
        maxFileSize: 15,
        availableStorage: subscriptionData?.total_storage_gb,
        usedStorage: subscriptionData?.used_storage_gb,
      })

      const files = Array.from(validatedFileList).map((file) => {
        const timestamp = Date.now()
        const newFile = new File([file], `${timestamp}-${file.name}`, {
          type: file.type,
        })
        return newFile
      })
      const currentFiles = formik.values.files
      const updatedFiles = [...currentFiles, ...files]
      formik.setFieldValue('files', updatedFiles)

      const urls = files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
      }))
      setFileUrls((prevUrls) => [...prevUrls, ...urls])
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...formik.values.files]
    newFiles.splice(index, 1)
    formik.setFieldValue('files', newFiles)

    const newFileUrls = [...fileUrls]
    newFileUrls.splice(index, 1)
    setFileUrls(newFileUrls)
  }

  const handleRemoveFileUploaded = async (file: any) => {
    if (!appointmentId) return
    const payloadForDeleteFiles = {
      deleter: {
        user_id: safeParseInt(userId),
        user_type: userTypes.DOCTOR,
      },
      owner: {
        user_id: safeParseInt(patientId),
        user_type: userTypes.PATIENT,
      },
      files_to_delete_by_id: [file?.file_id],
    }
    try {
      await dispatchAction(deleteFiles(payloadForDeleteFiles)).unwrap()
      await viewAppointment(safeParseInt(appointmentId), {skipNavigation: true})
    } catch (error) {
      ErrorToast('Unable to delete file. Please try again.')
    }
  }

  const multipleSelectCreateOption = (type: string, value: string[], jawTypeName: string) => {
    if (type === multipleSelectTypes.SPACE_CLOSURE_TOOLS) {
      if (value.length === 0) {
        return formik.setFieldValue(`${jawTypeName}.space_enclosure_tools`, value)
      }
      const typedValue = value[value.length - 1].trim()

      if (hasValue(typedValue)) {
        const isItemExists = spaceClosureToolList.includes(typedValue)
        formik.setFieldValue(`${jawTypeName}.space_enclosure_tools`, value)

        if (!isItemExists) {
          dispatchAction(
            postAddSpaceAndClosure({
              doctor_id: safeParseInt(userId),
              material_tool_type: multipleSelectTypeList.SPACE_CLOSURE_TOOLS,
              material_name: value[0],
            })
          )
            .unwrap()
            .then((res: any) => {
              if (res) {
                dispatchAction(
                  getSpaceClosureToolAndAccessoriesList({
                    doctor_id: safeParseInt(userId),
                  })
                )
              }
            })
            .catch((error: any) => {
              console.error(error)
            })
        }
      }
    } else {
      if (value.length === 0) {
        return formik.setFieldValue(`${jawTypeName}.accessories`, value)
      }
      const typedValue = value[value.length - 1].trim()

      if (hasValue(typedValue)) {
        const isItemExists = accessoriesList.includes(typedValue)
        formik.setFieldValue(`${jawTypeName}.accessories`, value)

        if (!isItemExists) {
          dispatchAction(
            postAddAccessories({
              doctor_id: safeParseInt(userId),
              material_tool_type: multipleSelectTypeList.ACCESSORIES,
              material_name: value[0],
            })
          )
            .unwrap()
            .then((res: any) => {
              if (res) {
                dispatchAction(
                  getSpaceClosureToolAndAccessoriesList({
                    doctor_id: safeParseInt(userId),
                  })
                )
              }
            })
        }
      }
    }
  }

  const changeAppointmentType = (option: string) => {
    if (option === appointmentJawTypes.BOTH) {
      formik.setFieldValue('jaw_main_type', appointmentJawTypes.BOTH)
      formik.setFieldValue('both.jaw_type', appointmentJawTypes.BOTH)
      formik.setFieldValue('both.note', '')
      formik.setFieldValue('both.treatment_stage_type', '')
      formik.setFieldValue('both.shape', '')
      formik.setFieldValue('both.material_name', '')
      formik.setFieldValue('both.space_enclosure_tools', [])
      formik.setFieldValue('both.accessories', [])
    } else {
      formik.setFieldValue('jaw_main_type', appointmentJawTypes.SEPARATE)
      formik.setFieldValue('lower.jaw_type', appointmentJawTypes.LOWER)
      formik.setFieldValue('lower.note', '')
      formik.setFieldValue('lower.treatment_stage_type', '')
      formik.setFieldValue('lower.shape', '')
      formik.setFieldValue('lower.material_name', '')
      formik.setFieldValue('lower.space_enclosure_tools', [])
      formik.setFieldValue('lower.accessories', [])

      formik.setFieldValue('upper.jaw_type', appointmentJawTypes.UPPER)
      formik.setFieldValue('upper.note', '')
      formik.setFieldValue('upper.treatment_stage_type', '')
      formik.setFieldValue('upper.shape', '')
      formik.setFieldValue('upper.material_name', '')
      formik.setFieldValue('upper.space_enclosure_tools', [])
      formik.setFieldValue('upper.accessories', [])
    }

    dispatchAction(getBracesTreatmentStageList({data: null}))
  }

  const prefillAppointmentTypeDetails = (option: string) => {
    if (!hasValue(formik.values)) return

    const formikData = formik.values

    if (option === jawType.BOTH) {
      formik.setFieldValue('jaw_main_type', appointmentJawTypes.BOTH)
      formik.setFieldValue('both.jaw_type', appointmentJawTypes.BOTH)

      if (hasValue(formikData.both.treatment_stage_type)) {
        dispatchAction(getBracesTreatmentStageList({data: null}))
          .unwrap()
          .then((res: FilterOption[]) => {
            if (!res) return
            dispatchAction(
              getBracesTreatmentMaterialShapeList({
                treatmentMaterialStageId: safeParseInt(
                  getValueByLabel(res, formikData.both.treatment_stage_type)
                ),
                jawType: appointmentJawTypes.UPPER,
              })
            )
              .unwrap()
              .then((shapeRes: FilterOption[]) => {
                if (!shapeRes) return
                dispatchAction(
                  getBracesTreatmentMaterialNameList({
                    doctor_id: safeParseInt(userId),
                    treatmentMaterialShapeId: safeParseInt(
                      getValueByLabel(shapeRes, formikData.both.shape)
                    ),
                    jawType: appointmentJawTypes.UPPER,
                  })
                )
                  .unwrap()
                  .then((nameRes: FilterOption[]) => {
                    if (!nameRes) return
                    dispatchAction(
                      getBracesTreatmentMaterialSizeList({
                        doctor_id: safeParseInt(userId),
                        treatmentMaterialNameId: safeParseInt(
                          getValueByLabel(nameRes, formikData.both.material_name)
                        ),
                        jawType: appointmentJawTypes.UPPER,
                      })
                    )
                  })
              })
          })
      }
      return
    }

    if (option === jawTypeSmall.LOWER) {
      formik.setFieldValue('jaw_main_type', appointmentJawTypes.SEPARATE)
      formik.setFieldValue('lower.jaw_type', appointmentJawTypes.LOWER)

      if (hasValue(formikData.lower.treatment_stage_type)) {
        dispatchAction(getBracesTreatmentStageList({data: null}))
          .unwrap()
          .then((res: FilterOption[]) => {
            if (!res) return
            dispatchAction(
              getBracesTreatmentMaterialShapeList({
                treatmentMaterialStageId: safeParseInt(
                  getValueByLabel(res, formikData.lower.treatment_stage_type)
                ),
                jawType: appointmentJawTypes.LOWER,
              })
            )
              .unwrap()
              .then((shapeRes: FilterOption[]) => {
                if (!shapeRes) return
                dispatchAction(
                  getBracesTreatmentMaterialNameList({
                    doctor_id: safeParseInt(userId),
                    treatmentMaterialShapeId: safeParseInt(
                      getValueByLabel(shapeRes, formikData.lower.shape)
                    ),
                    jawType: appointmentJawTypes.LOWER,
                  })
                )
                  .unwrap()
                  .then((nameRes: FilterOption[]) => {
                    if (!nameRes) return
                    dispatchAction(
                      getBracesTreatmentMaterialSizeList({
                        doctor_id: safeParseInt(userId),
                        treatmentMaterialNameId: safeParseInt(
                          getValueByLabel(nameRes, formikData.lower.material_name)
                        ),
                        jawType: appointmentJawTypes.LOWER,
                      })
                    )
                  })
              })
          })
      }
      return
    }

    // UPPER
    formik.setFieldValue('jaw_main_type', appointmentJawTypes.SEPARATE)
    formik.setFieldValue('upper.jaw_type', appointmentJawTypes.UPPER)

    if (hasValue(formikData.upper.treatment_stage_type)) {
      dispatchAction(getBracesTreatmentStageList({data: null}))
        .unwrap()
        .then((res: FilterOption[]) => {
          if (!res) return
          dispatchAction(
            getBracesTreatmentMaterialShapeList({
              treatmentMaterialStageId: safeParseInt(
                getValueByLabel(res, formikData.upper.treatment_stage_type)
              ),
              jawType: appointmentJawTypes.UPPER,
            })
          )
            .unwrap()
            .then((shapeRes: FilterOption[]) => {
              if (!shapeRes) return
              dispatchAction(
                getBracesTreatmentMaterialNameList({
                  doctor_id: safeParseInt(userId),
                  treatmentMaterialShapeId: safeParseInt(
                    getValueByLabel(shapeRes, formikData.upper.shape)
                  ),
                  jawType: appointmentJawTypes.UPPER,
                })
              )
                .unwrap()
                .then((nameRes: FilterOption[]) => {
                  if (!nameRes) return
                  dispatchAction(
                    getBracesTreatmentMaterialSizeList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialNameId: safeParseInt(
                        getValueByLabel(nameRes, formikData.upper.material_name)
                      ),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                })
            })
        })
    }
  }

  const viewAppointment = async (
    appointment_id: number,
    options?: {
      skipNavigation?: boolean
    }
  ) => {
    const {skipNavigation = false} = options || {}
    try {
      const res = await dispatchAction(
        getBracesNotesDetails({
          appointment_id: appointment_id.toString() ?? '',
        })
      ).unwrap()

      const createJawDetails = (jaw: jawTypeDetail) => ({
        jaw_type: jaw.jaw_type,
        treatment_stage_type: jaw.treatment_stage_type,
        shape: jaw.shape,
        material_name: jaw.material_name,
        material_size: jaw.material_size,
        space_enclosure_tools: jaw.space_enclosure_tools,
        accessories: jaw.accessories,
        note: jaw.note,
        input_material_name: '',
        input_material_size: '',
        input_space_enclosure_tools: '',
        input_accessories: '',
      })

      const bothJaw = res.jaws.find(
        (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.BOTH
      )
      const upperJaw = res.jaws.find(
        (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.UPPER
      )
      const lowerJaw =
        res.jaws.length === 2
          ? res.jaws.find((jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.LOWER)
          : null

      const bothJawsDetails = bothJaw ? createJawDetails(bothJaw) : EMPTY_JAW_TYPE
      const upperJawsDetails = upperJaw ? createJawDetails(upperJaw) : EMPTY_JAW_TYPE
      const lowerJawsDetails = lowerJaw ? createJawDetails(lowerJaw) : EMPTY_JAW_TYPE

      const getAppointmentDetailsData: AddAppointmentData = {
        braces_journey_id: safeParseInt(bracesJourneyId),
        amount: 0,
        status: res.status,
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        start_date: convertYYYYMMDDTOddddDDMMMMYY(res.current_appointment_date),
        end_date: convertYYYYMMDDTOddddDDMMMMYY(res.end_date),
        reminder_id: safeParseInt(res.reminder_details?.reminder_id),
        product_type_name: productTypes.BRACES,
        jaw_main_type:
          res.jaws[0].jaw_type === appointmentJawTypes.BOTH
            ? appointmentJawTypes.BOTH
            : appointmentJawTypes.SEPARATE,
        both: bothJawsDetails,
        upper: upperJawsDetails,
        lower: lowerJawsDetails,
        files: res.files,
        draft_files: res.draft_files,
      }

      dispatchAction(setAppointmentDetails(getAppointmentDetailsData))

      if (skipNavigation) return

      navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)

      setTimeout(() => {
        const queryParams = new URLSearchParams({
          appointmentId: String(appointment_id),
        }).toString()

        navigation(
          `/profile/${patientId}/${bracesJourneyId}/bracesNotes/attachNotes?${queryParams}`
        )
      }, 100)
    } catch (error) {
      // Silently ignore; consumer handles navigation flow
    }
  }

  const uniqueSpaceClosureToolList = Array.from(new Set(spaceClosureToolList)).map(
    (item, index) => ({
      id: `option_${index}`,
      value: item,
      label: item,
    })
  )

  const uniqueAccessoriesList = Array.from(new Set(accessoriesList)).map((item, index) => ({
    id: `option_${index}`,
    value: item,
    label: item,
  }))

  return (
    <Page
      title={'Appointment notes'}
      showBorder
      showBackButton
      loading={false}
      backNavigationRoute={`/profile/${patientId}/bracesNotes/${bracesJourneyId}`}
      exitConfirmPredicate={formik.dirty}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className='w-fit flex flex-col md:flex-row justify-between gap-4 mt-2'>
          <InputDateFormik
            {...{
              name: 'start_date',
              label: 'Appointment date',
              classNameLabel: 'font-medium',
              format: 'DD/MM/YYYY', // display format only
              className: ' py-3',
              needConfirm: false,
              showTime: false,
              required: true,
              disabled: !!appointmentId,
              minDate: dayjs(), // prevent past dates
              onChange: (date: dayjs.Dayjs | null) => {
                if (!date) {
                  formik.setFieldValue('start_date', '')
                  return
                }

                // ✅ store in a stable ISO format
                const iso = date.format('YYYY-MM-DD')
                formik.setFieldValue('start_date', iso)
              },
            }}
            formik={formik}
            // ✅ DatePicker / InputDateFormik should receive a dayjs object
            dateValue={
              formik.values.start_date
                ? dayjs(formik.values.start_date) // expects 'YYYY-MM-DD'
                : null
            }
          />
          {/* End date intentionally hidden as per your earlier requirement */}
        </div>

        <div className='text-textColor text-base font-medium leading-normal mt-2'>
          Add details for
        </div>

        <RadioGroupIcon
          options={appointmentJawsOptionList}
          onOptionChange={(option) => {
            changeAppointmentType(option)
          }}
          selectedOption={formik.values.jaw_main_type}
          label=''
          className='text-center rounded-md md:rounded-lg w-36 sm:px-4'
        />

        {/* SEPARATE JAWS */}
        <When isTrue={formik.getFieldProps('jaw_main_type').value === appointmentJawTypes.SEPARATE}>
          {/* UPPER JAW */}
          <div className='relative flex flex-col mt-6 border border-mediumGray rounded-lg md:p-4 p-2'>
            <div className='w-[167px] absolute top-0 text-center px-9 py-2 font-semibold bg-primaryColor text-white rounded-b-xl'>
              UPPER JAW
            </div>
            {/* 1 - Notes */}
            <div className='flex flex-row items-center gap-3 mt-12'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  1
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>Notes</div>
            </div>
            <div className='mt-4'>
              <div className="text-stone-500 text-base font-medium font-['Figtree'] leading-normal">
                Add notes
              </div>
              <textarea
                name={'upper.note'}
                className='w-full px-2 rounded mt-1 max-h-40 h-40 p-2 border border-gray-400'
                title='Add notes'
                placeholder='Add notes for this appointment or the next appointment'
                value={formik.values.upper.note}
                minLength={2}
                maxLength={500}
                onChange={(value) => formik.setFieldValue('upper.note', value.target.value)}
              />
            </div>

            {/* 2 - Treatment Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  2
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Treatment details
              </div>
            </div>

            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Treatment stage
              </div>
            </div>

            <div className='flex w-full gap-4 justify-between'>
              <RadioGroups
                options={bracesTreatmentStageList}
                onOptionChange={(option: {label: string; value: string}) => {
                  formik.setFieldValue('upper.treatment_stage_type', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialShapeList({
                      treatmentMaterialStageId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('upper.shape', '')
                  formik.setFieldValue('upper.material_name', '')
                  formik.setFieldValue('upper.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentStageList &&
                  getValueByLabel(
                    bracesTreatmentStageList,
                    formik.values.upper.treatment_stage_type
                  )
                }
                label=''
                loading={getBracesTreatmentStageListLoading}
                className='w-full justify-start md:justify-center md:text-center rounded-md md:rounded-lg md:w-fit md:min-w-[120px]'
              />
            </div>

            {/* 3 - Material Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  3
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Material details
              </div>
            </div>

            {/* Shape */}
            <When isTrue={hasValue(formik.values.upper.treatment_stage_type)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select shape
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialShapeList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('upper.shape', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialNameList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialShapeId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('upper.material_name', '')
                  formik.setFieldValue('upper.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialShapeList.upper &&
                  getValueByLabel(bracesTreatmentMaterialShapeList.upper, formik.values.upper.shape)
                }
                label=''
                loading={getBracesTreatmentMaterialShapeListLoading}
              />
            </When>

            {/* Material */}
            <When isTrue={hasValue(formik.values.upper.shape)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Material
              </div>
              <div className='text-stone-500 text-sm font-normal leading-tight'>
                (Select material you are using)
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialNameList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('upper.material_name', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialSizeList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialNameId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('upper.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialNameList.upper &&
                  getValueByLabel(
                    bracesTreatmentMaterialNameList.upper,
                    formik.values.upper.material_name
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialNameListLoading}
              />
              <When isTrue={!isInputAddMaterialVisible}>
                <button
                  type='button'
                  className='md:w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other materials
                </button>
              </When>
              <When isTrue={isInputAddMaterialVisible && !postAddMaterialNameLoading}>
                <div className='flex flex-row gap-4'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'upper.input_material_name'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>

                  <Spinner loading={postAddMaterialNameLoading} />
                  <div
                    className='w-14 h-12 px-4 mt-2 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                    onClick={() => onClickAddMaterial(appointmentJawTypes.UPPER)}
                  >
                    <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                  </div>
                </div>
              </When>
            </When>

            {/* Size */}
            <When isTrue={hasValue(formik.values.upper.material_name)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select size of material
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialSizeList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('upper.material_size', option.label)
                }}
                selectedOption={
                  bracesTreatmentMaterialSizeList.upper &&
                  getValueByLabel(
                    bracesTreatmentMaterialSizeList.upper,
                    formik.values.upper.material_size
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialSizeListLoading}
              />
              <When
                isTrue={
                  !isInputAddMaterialSizeVisible && hasValue(formik.values.upper.material_name)
                }
              >
                <button
                  type='button'
                  className='w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialSizeVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other sizes
                </button>
              </When>
              <When isTrue={isInputAddMaterialSizeVisible && !postAddMaterialSizeLoading}>
                <div className='flex flex-row gap-4 items-center mt-3'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'upper.input_material_size'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials size'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>
                  <Spinner loading={postAddMaterialSizeLoading} />
                  <When isTrue={hasValue(formik.values.upper.material_name)}>
                    <div
                      className='w-14 h-14 px-4 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                      onClick={() => onClickAddMaterialSize(appointmentJawTypes.UPPER)}
                    >
                      <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                    </div>
                  </When>
                </div>
              </When>
            </When>

            {/* Space closure tools */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Space closure tools
              </div>
              <div className='flex flex-row h-auto md:w-[83%] gap-4'>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.SPACE_CLOSURE_TOOLS}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(
                      multipleSelectTypes.SPACE_CLOSURE_TOOLS,
                      value,
                      'upper'
                    )
                  }}
                  options={uniqueSpaceClosureToolList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.upper.space_enclosure_tools ?? null}
                />
              </div>
            </div>

            {/* Accessories */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>Accessories</div>
              <div className='flex flex-row md:w-[83%] h-auto gap-4 '>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.ACCESSORIES}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(multipleSelectTypes.ACCESSORIES, value, 'upper')
                  }}
                  options={uniqueAccessoriesList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.upper.accessories}
                />
              </div>
            </div>
          </div>

          {/* LOWER JAW */}
          <div className='relative flex flex-col mt-6 border border-mediumGray rounded-lg md:p-4 p-2'>
            <div className='w-[167px] absolute top-0 text-center px-9 py-2 font-semibold bg-primaryColor text-white rounded-b-xl'>
              LOWER JAW
            </div>
            {/* 1 - Notes */}
            <div className='flex flex-row items-center gap-3 mt-12'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  1
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>Notes</div>
            </div>
            <div className='mt-4'>
              <div className="text-stone-500 text-base font-medium font-['Figtree'] leading-normal">
                Add notes
              </div>
              <textarea
                name={'lower.note'}
                className='w-full px-2 rounded mt-1 max-h-40 h-40 p-2 border border-gray-400'
                title='Add notes'
                placeholder='Add notes for this appointment or the next appointment'
                value={formik.values.lower.note}
                minLength={2}
                maxLength={500}
                onChange={(value) => formik.setFieldValue('lower.note', value.target.value)}
              />
            </div>

            {/* 2 - Treatment Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  2
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Treatment details
              </div>
            </div>

            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Treatment stage
              </div>
            </div>

            <div className='flex w-full gap-4 justify-between'>
              <RadioGroups
                options={bracesTreatmentStageList}
                onOptionChange={(option: {label: string; value: string}) => {
                  formik.setFieldValue('lower.treatment_stage_type', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialShapeList({
                      treatmentMaterialStageId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.LOWER,
                    })
                  )
                  formik.setFieldValue('lower.shape', '')
                  formik.setFieldValue('lower.material_name', '')
                  formik.setFieldValue('lower.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentStageList &&
                  getValueByLabel(
                    bracesTreatmentStageList,
                    formik.values.lower.treatment_stage_type
                  )
                }
                label=''
                loading={getBracesTreatmentStageListLoading}
                className='w-full justify-start md:justify-center md:text-center rounded-md md:rounded-lg md:w-fit md:min-w-[120px]'
              />
            </div>

            {/* 3 - Material Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  3
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Material details
              </div>
            </div>

            {/* Shape */}
            <When isTrue={hasValue(formik.values.lower.treatment_stage_type)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select shape
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialShapeList.lower}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('lower.shape', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialNameList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialShapeId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.LOWER,
                    })
                  )
                  formik.setFieldValue('lower.material_name', '')
                  formik.setFieldValue('lower.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialShapeList.lower &&
                  getValueByLabel(bracesTreatmentMaterialShapeList.lower, formik.values.lower.shape)
                }
                label=''
                loading={getBracesTreatmentMaterialShapeListLoading}
              />
            </When>

            {/* Material */}
            <When isTrue={hasValue(formik.values.lower.shape)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Material
              </div>
              <div className='text-stone-500 text-sm font-normal leading-tight'>
                (Select material you are using)
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialNameList.lower}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('lower.material_name', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialSizeList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialNameId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.LOWER,
                    })
                  )
                  formik.setFieldValue('lower.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialNameList.lower &&
                  getValueByLabel(
                    bracesTreatmentMaterialNameList.lower,
                    formik.values.lower.material_name
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialNameListLoading}
              />
              <When isTrue={!isInputAddMaterialVisible}>
                <button
                  type='button'
                  className='md:w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other materials
                </button>
              </When>
              <When isTrue={isInputAddMaterialVisible && !postAddMaterialNameLoading}>
                <div className='flex flex-row gap-4'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'lower.input_material_name'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>

                  <Spinner loading={postAddMaterialNameLoading} />
                  <div
                    className='w-14 h-12 px-4 mt-2 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                    onClick={() => onClickAddMaterial(appointmentJawTypes.LOWER)}
                  >
                    <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                  </div>
                </div>
              </When>
            </When>

            {/* Size */}
            <When isTrue={hasValue(formik.values.lower.material_name)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select size of material
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialSizeList.lower}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('lower.material_size', option.label)
                }}
                selectedOption={
                  bracesTreatmentMaterialSizeList.lower &&
                  getValueByLabel(
                    bracesTreatmentMaterialSizeList.lower,
                    formik.values.lower.material_size
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialSizeListLoading}
              />
              <When
                isTrue={
                  !isInputAddMaterialSizeVisible && hasValue(formik.values.lower.material_name)
                }
              >
                <button
                  type='button'
                  className='w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialSizeVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other sizes
                </button>
              </When>
              <When isTrue={isInputAddMaterialSizeVisible && !postAddMaterialSizeLoading}>
                <div className='flex flex-row gap-4 items-center mt-3'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'lower.input_material_size'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials size'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>
                  <Spinner loading={postAddMaterialSizeLoading} />
                  <When isTrue={hasValue(formik.values.lower.material_name)}>
                    <div
                      className='w-14 h-14 px-4 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                      onClick={() => onClickAddMaterialSize(appointmentJawTypes.LOWER)}
                    >
                      <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                    </div>
                  </When>
                </div>
              </When>
            </When>

            {/* Space closure tools */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Space closure tools
              </div>
              <div className='flex flex-row h-auto md:w-[83%] gap-4'>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.SPACE_CLOSURE_TOOLS}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(
                      multipleSelectTypes.SPACE_CLOSURE_TOOLS,
                      value,
                      'lower'
                    )
                  }}
                  options={uniqueSpaceClosureToolList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.lower.space_enclosure_tools ?? null}
                />
              </div>
            </div>

            {/* Accessories */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>Accessories</div>
              <div className='flex flex-row md:w-[83%] h-auto gap-4 '>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.ACCESSORIES}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(multipleSelectTypes.ACCESSORIES, value, 'lower')
                  }}
                  options={uniqueAccessoriesList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.lower.accessories}
                />
              </div>
            </div>
          </div>
        </When>

        {/* BOTH JAWS */}
        <When isTrue={formik.getFieldProps('jaw_main_type').value === appointmentJawTypes.BOTH}>
          <div className='flex flex-col mt-6 border border-mediumGray rounded-lg md:p-4 p-2'>
            {/* 1 - Notes */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  1
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>Notes</div>
            </div>
            <div className='mt-4'>
              <div className="text-stone-500 text-base font-medium font-['Figtree'] leading-normal">
                Add notes
              </div>
              <textarea
                name={'both.note'}
                className='w-full px-2 rounded mt-1 max-h-40 h-40 p-2 border border-gray-400'
                title='Add notes'
                placeholder='Add notes for this appointment or the next appointment'
                value={formik.values.both.note}
                minLength={2}
                maxLength={500}
                onChange={(value) => formik.setFieldValue('both.note', value.target.value)}
              />
            </div>

            {/* 2 - Treatment Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  2
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Treatment details
              </div>
            </div>

            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Treatment stage
              </div>
            </div>

            <div className='flex w-full gap-4 justify-between'>
              <RadioGroups
                options={bracesTreatmentStageList}
                onOptionChange={(option: {label: string; value: string}) => {
                  formik.setFieldValue('both.treatment_stage_type', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialShapeList({
                      treatmentMaterialStageId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('both.shape', '')
                  formik.setFieldValue('both.material_name', '')
                  formik.setFieldValue('both.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentStageList &&
                  getValueByLabel(bracesTreatmentStageList, formik.values.both.treatment_stage_type)
                }
                label=''
                loading={getBracesTreatmentStageListLoading}
                className='w-full justify-start md:justify-center md:text-center rounded-md md:rounded-lg md:w-fit md:min-w-[120px]'
              />
            </div>

            {/* 3 - Material Details */}
            <div className='flex flex-row items-center gap-3 mt-4'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  3
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>
                Material details
              </div>
            </div>

            {/* Shape */}
            <When isTrue={hasValue(formik.values.both.treatment_stage_type)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select shape
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialShapeList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('both.shape', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialNameList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialShapeId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('both.material_name', '')
                  formik.setFieldValue('both.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialShapeList.upper &&
                  getValueByLabel(bracesTreatmentMaterialShapeList.upper, formik.values.both.shape)
                }
                label=''
                loading={getBracesTreatmentMaterialShapeListLoading}
              />
            </When>

            {/* Material */}
            <When isTrue={hasValue(formik.values.both.shape)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Material
              </div>
              <div className='text-stone-500 text-sm font-normal leading-tight'>
                (Select material you are using)
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialNameList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('both.material_name', option.label)
                  dispatchAction(
                    getBracesTreatmentMaterialSizeList({
                      doctor_id: safeParseInt(userId),
                      treatmentMaterialNameId: safeParseInt(option?.value),
                      jawType: appointmentJawTypes.UPPER,
                    })
                  )
                  formik.setFieldValue('both.material_size', '')
                }}
                selectedOption={
                  bracesTreatmentMaterialNameList.upper &&
                  getValueByLabel(
                    bracesTreatmentMaterialNameList.upper,
                    formik.values.both.material_name
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialNameListLoading}
              />
              <When isTrue={!isInputAddMaterialVisible}>
                <button
                  type='button'
                  className='md:w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other materials
                </button>
              </When>
              <When isTrue={isInputAddMaterialVisible && !postAddMaterialNameLoading}>
                <div className='flex flex-row gap-4'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'both.input_material_name'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>

                  <Spinner loading={postAddMaterialNameLoading} />
                  <div
                    className='w-14 h-12 px-4 mt-2 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                    onClick={() => onClickAddMaterial(appointmentJawTypes.BOTH)}
                  >
                    <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                  </div>
                </div>
              </When>
            </When>

            {/* Size */}
            <When isTrue={hasValue(formik.values.both.material_name)}>
              <div className='text-textColor text-base font-medium leading-normal mt-4'>
                Select size of material
              </div>
              <RadioGroups
                options={bracesTreatmentMaterialSizeList.upper}
                onOptionChange={(option: FilterOption) => {
                  formik.setFieldValue('both.material_size', option.label)
                }}
                selectedOption={
                  bracesTreatmentMaterialSizeList.upper &&
                  getValueByLabel(
                    bracesTreatmentMaterialSizeList.upper,
                    formik.values.both.material_size
                  )
                }
                label=''
                loading={getBracesTreatmentMaterialSizeListLoading}
              />
              <When
                isTrue={
                  !isInputAddMaterialSizeVisible && hasValue(formik.values.both.material_name)
                }
              >
                <button
                  type='button'
                  className='w-[50%] rounded-lg py-2 h-9 px-4 bg-lightGray justify-center items-center gap-1 inline-flex text-sm text-stone-700 mt-3'
                  onClick={() => setIsInputAddMaterialSizeVisible(true)}
                >
                  <CommonSVG svg={SVG_PLUS_GRAY} width='12' height='12' />
                  Add any other sizes
                </button>
              </When>
              <When isTrue={isInputAddMaterialSizeVisible && !postAddMaterialSizeLoading}>
                <div className='flex flex-row gap-4 items-center mt-3'>
                  <div className='md:w-[60%] w-full mt-2'>
                    <InputText
                      name={'both.input_material_size'}
                      className=''
                      label=''
                      maxLength={13}
                      placeholder='+ Add any other materials size'
                      classNameLabel='text-sm text-textColor font-medium'
                      formik={formik}
                      required={false}
                      disabled={false}
                    />
                  </div>
                  <Spinner loading={postAddMaterialSizeLoading} />
                  <When isTrue={hasValue(formik.values.both.material_name)}>
                    <div
                      className='w-14 h-14 px-4 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
                      onClick={() => onClickAddMaterialSize(appointmentJawTypes.BOTH)}
                    >
                      <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
                    </div>
                  </When>
                </div>
              </When>
            </When>

            {/* Space closure tools */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>
                Space closure tools
              </div>
              <div className='flex flex-row h-auto md:w-[83%] gap-4'>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.SPACE_CLOSURE_TOOLS}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(
                      multipleSelectTypes.SPACE_CLOSURE_TOOLS,
                      value,
                      'both'
                    )
                  }}
                  options={uniqueSpaceClosureToolList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.both.space_enclosure_tools ?? null}
                />
              </div>
            </div>

            {/* Accessories */}
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>Accessories</div>
              <div className='flex flex-row md:w-[83%] h-auto gap-4 '>
                <MultiSelectTags
                  MultiSelectType={multipleSelectTypes.ACCESSORIES}
                  handleOnChange={(value) => {
                    multipleSelectCreateOption(multipleSelectTypes.ACCESSORIES, value, 'both')
                  }}
                  options={uniqueAccessoriesList}
                  tagRender={TagRenderForMissingToothDropdown}
                  value={formik.values.both.accessories}
                />
              </div>
            </div>
          </div>
        </When>

        {/* 4 - Photos */}
        <div>
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
          <div className='mt-4'>
            <div className='flex flex-row items-center gap-3'>
              <div className='w-7 h-7 bg-primarySupport rounded-3xl justify-center items-center gap-2 inline-flex'>
                <div className='text-center text-primaryColor text-base font-semibold leading-none'>
                  4
                </div>
              </div>
              <div className='w-fit text-black text-xl font-semibold leading-7'>Photos</div>
            </div>
            <div className='mt-4'>
              <div className='text-textColor text-base font-medium leading-normal'>Add photos</div>
            </div>
          </div>
          <div>
            <div className='flex mb-2 items-center justify-end'>
              <When isTrue={fileUrls?.length > 0}>
                <button
                  type='button'
                  className='text-secondaryColor text-sm font-medium text-right'
                  onClick={() => {
                    formik.setFieldValue('files', [])
                    setFileUrls([])
                  }}
                >
                  Clear all
                </button>
              </When>
            </div>
            <When isTrue={appointmentDetails?.files?.length > 0}>
              <div className='flex flex-wrap w-full gap-5 justify-between mt-4'>
                {appointmentDetails?.files?.map((file: any, index) => (
                  <div
                    key={index}
                    className='flex items-center md:w-[42.5%] w-full gap-2 flex-shrink justify-between'
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <Image
                        src={getImageUrl(file)}
                        alt='Uploaded file '
                        className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                        onClick={() => {
                          setIsShowPhotos(true)
                          setSelectedIndex(index)
                        }}
                        size={20}
                        fileName={file?.name}
                        showFileName={true}
                        showLoading={true}
                      />
                    </div>
                    <div
                      className='cursor-pointer'
                      onClick={() => {
                        handleRemoveFileUploaded(file)
                      }}
                    >
                      <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                    </div>
                  </div>
                ))}
              </div>
            </When>
            <When
              isTrue={
                appointmentDetails?.files?.length === 0
                  ? appointmentDetails?.draft_files?.length > 0
                  : false
              }
            >
              <div className='flex flex-wrap w-full gap-5 justify-between mt-4'>
                {appointmentDetails?.draft_files?.map((file: any, index) => (
                  <div
                    key={index}
                    className='flex items-center w-[42.5%] gap-2 flex-shrink justify-between'
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <Image
                        src={getImageUrl(file)}
                        alt='Uploaded file '
                        className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                        onClick={() => {
                          setIsShowPhotos(true)
                          setSelectedIndex(index)
                        }}
                        size={20}
                        fileName={file?.name}
                        showFileName={true}
                        showLoading={true}
                      />
                    </div>
                    <div
                      className='cursor-pointer'
                      onClick={() => {
                        handleRemoveFileUploaded(file)
                      }}
                    >
                      <CommonSVG svg={SVG_CROSS} width='40' height='40' />
                    </div>
                  </div>
                ))}
              </div>
            </When>
            <When isTrue={hasValue(fileUrls)}>
              <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between '>
                {fileUrls?.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center md:w-[42.5%] gap-2 flex-shrink justify-between'
                  >
                    <div className='flex items-center justify-between gap-4'>
                      <When isTrue={file.type !== 'application/pdf' && file.type !== 'video/mp4'}>
                        <Image
                          src={file.url ?? ''}
                          alt='Uploaded file '
                          className='w-16 h-16 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                          onClick={() => {
                            setIsShowPhotos(true)
                            setSelectedIndex(index)
                          }}
                          size={20}
                          fileName={formik.values.files[index].name}
                          showFileName={true}
                          showLoading={true}
                        />
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
            </When>
            <div className='h-16 mt-4 bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
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
                accept='.jpg, .jpeg, .png'
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
                    {fileUrls.length === 0 ? 'Tap to upload photos' : 'Add more photos'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className='flex flex-row gap-4 justify-end mt-4'>
          <button
            type='button'
            className='h-11 bg-primaryColor rounded-lg p-3 text-white'
            onClick={() => {
              if (onCancel) {
                onCancel()
              } else {
                navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
              }
            }}
          >
            Cancel
          </button>

          <When isTrue={true}>
            <Button
              className='h-11 rounded-lg p-3 cursor-pointer bg-white border !border-primaryColor text-primaryColor hover:!bg-white hover:!text-primaryColor'
              loading={postAddAppointmentLoading}
              onClick={() => {
                identifyUser()
                onSubmitHandler(formik.values, treatmentPlanStatusConstants.ACTIVE)
              }}
            >
              Save
            </Button>
          </When>
        </div>
      </form>
    </Page>
  )
}

export default AddAppointment
