import BorderedCard from 'components/BorderedCard/BorderedCard'
import {useFormik} from 'formik'
import FieldContainerForRadioGroups from './components/FieldContainerForRadioGroups'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import * as Yup from 'yup'
import MultiSelect from 'components/multiSelect/MultiSelect'
import toothNumbers from '@staticData/toothNumbers'
import {TagRenderForMissingToothDropdown} from 'components/tags/TagRenderForMissingToothDropdown'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {CaseInfo, setCaseInformation} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import Page from 'components/page/Page'
import InputText from 'components/atom/Inputs/InputText'
import {useMediaQuery} from 'react-responsive'
import {useEffect, useState} from 'react'
import {getImageUrl, identifyUser} from 'utils/ConstFunctions'
import clsx from 'clsx'
import InfoIcon from 'assets/icons/InfoIcon'
import allergiesList from '@staticData/allergiesList'
import medicalCondition from '@staticData/medicalCondition'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import fileFormatType from '@staticData/fileFormatType'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_CLOUD, SVG_CROSS} from 'utils/SvgConstants'
import When from 'components/when/When'
import {Image} from 'assets/images/Images/Image'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {IFile} from '../treatment/types/treatmentPlan.types'
import dentalHistory from '@staticData/dentalHistory'
import PDFWebview from '../files/components/PDFWebview'
export const caseInfoEmptyData = {
  cheif_complaint: '',
  missing_teeth: [],
  allergy: [],
  medical_condition: [],
  dental_history: [],
  relations: {
    molar: null,
    canine: null,
    incisor: null,
    skeletal: null,
  },
  overjet: '',
  deep_bite: '',
  deep_bite_in_percentage: '',
  open_bite: '',
  midline: '',
  remarks: '',
  extra_oral_remarks: '',
  cephalometric_analysis: '',
  diagnosis: '',
  treatment_objective: '',
  files: [],
  filesToSave: [],
}
const validationSchema = Yup.object().shape({
  overjet: Yup.number()
    .min(-25.0, 'Please enter a value between -25.00 to 25.00')
    .max(25.0, 'Please enter a value between -25.00 to 25.00')
    .notRequired()
    .nullable()
    .typeError('Please enter a value between -25.00 to 25.00'),
  deep_bite: Yup.number()
    .min(-30.0, 'Please enter a value between -30.00 to 30.00')
    .max(30.0, 'Please enter a value between -30.00 to 30.00')
    .notRequired()
    .nullable()
    .typeError('Please enter a value between -30.00 to 30.00'),
  deep_bite_in_percentage: Yup.number()
    .min(0.0, 'Please enter a value between 0 to 100')
    .max(100.0, 'Please enter a value between 0 to 100')
    .notRequired()
    .nullable()
    .typeError('Please enter a value between 0 to 100'),
  open_bite: Yup.number()
    .min(-30.0, 'Please enter a value between -30.00 to 30.00')
    .max(30.0, 'Please enter a value between -30.00 to 30.00')
    .notRequired()
    .nullable()
    .typeError('Please enter a value between -30.00 to 30.00'),
  cheif_complaint: Yup.string().nullable().max(500, 'Remarks must be at most 200 characters'),
  remarks: Yup.string().nullable().max(200, 'Remarks must be at most 200 characters'),
  extra_oral_remarks: Yup.string().nullable().max(200, 'Remarks must be at most 200 characters'),
  treatment_objective: Yup.string()
    .nullable()
    .max(200, 'Treatment objective must be at most 200 characters'),
  diagnosis: Yup.string().nullable().max(200, ' diagnosis must be at most 200 characters'),
  cephalometric_analysis: Yup.string()
    .nullable()
    .max(200, 'Cephalometric analysis must be at most 200 characters'),
})

const AddCaseInformation = () => {
  const navigation = useNavigate()
  const dispatch = useDispatch()
  const {patientId} = useParams()
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  const {
    caseInformation: allCaseInfoData,
    gettingCaseInformation,
    reviewCaseInfoData,
  } = useSelector((state: RootState) => state.leadsProfile)

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
    getInitialValues()
  }, [])

  const caseInformation: CaseInfo =
    allCaseInfoData?.metadata !== null
      ? {
          ...allCaseInfoData.metadata,
          files: allCaseInfoData.files,
          cheif_complaint: allCaseInfoData?.metadata.cheif_complaint ?? '',
        }
      : reviewCaseInfoData

  const {subscriptionData} = useSubscriptionDetails()
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('isEdit')
  const [fileUrls, setFileUrls] = useState<Partial<IFile>[]>(
    isEdit !== 'true' ? reviewCaseInfoData.files : allCaseInfoData?.files
  )

  const onSubmit = (values: CaseInfo) => {
    const allFieldsEmpty = Object.values(values).every((val) => {
      if (Array.isArray(val)) {
        return val.length === 0
      } else if (typeof val === 'object' && val !== null) {
        return Object.values(val).every((v) => v === '' || v === null || v === undefined)
      } else {
        return !val
      }
    })

    if (allFieldsEmpty) {
      formik.setStatus('Please fill details in any one of the fields to move ahead')
    } else {
      if (caseInformation) {
        identifyUser()
      } else {
        identifyUser()
      }

      formik.setStatus(null)

      const valueList = {...values, filesToSave: values.files ?? [], files: fileUrls}
      dispatch(setCaseInformation(valueList))
      const queryParams = new URLSearchParams({
        new: 'true',
      }).toString()
      formik.resetForm()
      navigation(`/profile/${patientId}/details/case-files?${queryParams}`)
    }
  }

  const getInitialValues = () => {
    if (hasValue(caseInformation) || isEdit !== 'true') {
      return caseInformation
    } else {
      return reviewCaseInfoData
    }
  }

  const formik = useFormik<CaseInfo>({
    initialValues: getInitialValues(),
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  })

  const onOptionChange = (key: string, value: string, toggle: boolean = false) => {
    if (!toggle && value === formik.getFieldProps(key).value) {
      return
    }
    formik.setFieldValue(key, value === formik.getFieldProps(key).value ? null : value)
  }

  const relationOptions = [
    {value: 1, label: '|'},
    {value: 2, label: '||'},
    {value: 3, label: '|||'},
  ]
  const midlineOptions = [
    {value: 'Coinciding', label: 'Coinciding'},
    {value: 'Not Coinciding', label: 'Not Coinciding'},
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files?.length > 0) {
      const validatedFileList = validateAndProcessPhotos({
        files: event.currentTarget.files,
        fileCount: 6,
        toastMessage: 'You can upload a maximum of 5 files at a time',
        chatFileFormats: fileFormatType.TREATMENT_PLAN_EXTENSIONS,
        maxFileSize: 50,
        availableStorage: subscriptionData?.total_storage_gb,
        usedStorage: subscriptionData?.used_storage_gb,
      })
      const files = Array.from(validatedFileList)
      formik.setFieldValue('files', files)

      const urls = files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        extension: file.name.split('.').pop(),
      }))
      setFileUrls(urls)
    }
    event.currentTarget.value = ''
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...formik.values.files]
    newFiles.splice(index, 1)
    formik.setFieldValue('files', newFiles)

    const newFileUrls = [...fileUrls]
    newFileUrls.splice(index, 1)
    setFileUrls(newFileUrls)
  }

  return (
    <>
      {/* PDF Webview Modal - Add this */}
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <Page
          title={<span className='text-xl'>Case information</span>}
          showBorder
          showBackButton={isTabletAndBelow}
          backNavigationRoute={`/profile/${patientId}`}
          loading={gettingCaseInformation}
          exitConfirmPredicate={formik.dirty || hasValue(caseInformation)}
        >
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

          <form onSubmit={formik.handleSubmit}>
            <div className='flex flex-col gap-3'>
              <BorderedCard
                header={{
                  title: 'Chief complaint',
                  icon: 1,
                }}
              >
                <div className=''>
                  <InputTextArea
                    name='cheif_complaint'
                    className='p-2'
                    classNameLabel='text-sm text-textColor font-medium'
                    placeholder="Enter the patient's chief complaint here"
                    formik={formik}
                    maxLength={2000}
                  />
                </div>
              </BorderedCard>
              <BorderedCard
                header={{
                  title: 'Medical history',
                  icon: 2,
                }}
              >
                <div className=''>
                  <LabelWithCaseInformation
                    title='Allergies (if any)'
                    info='Choose from dropdown or search. Multiple selection is available'
                  />
                  <MultiSelect
                    handleOnChange={(value) => formik.setFieldValue('allergy', value)}
                    options={allergiesList.map((allergy) => ({value: allergy}))}
                    tagRender={TagRenderForMissingToothDropdown}
                    value={formik.values?.allergy}
                    className='md:mt-0 mt-2'
                  />
                </div>
                <div className='mt-4'>
                  <LabelWithCaseInformation
                    title='Medical conditions (if any)'
                    info='Choose from dropdown or search. Multiple selection is available'
                  />
                  <MultiSelect
                    handleOnChange={(value) => formik.setFieldValue('medical_condition', value)}
                    options={medicalCondition.map((medicalConditionType) => ({
                      value: medicalConditionType,
                    }))}
                    tagRender={TagRenderForMissingToothDropdown}
                    value={formik.values?.medical_condition}
                    className='md:mt-0 mt-2'
                  />
                </div>
              </BorderedCard>
              <BorderedCard
                header={{
                  title: 'Dental examination',
                  icon: 3,
                }}
              >
                <div className={clsx(' text-[20px] font-semibold')}>Intra-oral examination</div>

                <div className='mt-2'>
                  <LabelWithCaseInformation
                    title='Dental history (if any)'
                    info='Choose from dropdown or search. Multiple selection is available'
                  />
                  <MultiSelect
                    handleOnChange={(value) => formik.setFieldValue('dental_history', value)}
                    options={dentalHistory.map((dentalHistoryVar) => ({value: dentalHistoryVar}))}
                    tagRender={TagRenderForMissingToothDropdown}
                    value={formik.values?.dental_history}
                    className='md:mt-0 mt-2'
                  />
                </div>
                <div className='mt-4'>
                  <LabelWithCaseInformation
                    title='Missing tooth (if any)'
                    info='Choose from dropdown or search. Multiple selection is available'
                  />
                  <MultiSelect
                    handleOnChange={(value) => formik.setFieldValue('missing_teeth', value)}
                    options={toothNumbers.map((num) => ({value: num}))}
                    tagRender={TagRenderForMissingToothDropdown}
                    value={formik.values?.missing_teeth}
                    className='md:mt-0 mt-2'
                  />
                </div>

                <div className='text-[16px] text-textColor font-bold mt-5'>
                  Examination of teeth in occlusion
                </div>
                <div className='flex flex-col gap-3'>
                  <div className='w-full flex flex-col md:flex-row md:justify-between gap-3 '>
                    <FieldContainerForRadioGroups
                      labelClassName={'!text-[16px] font-medium'}
                      selectedOption={formik.getFieldProps('relations.molar').value}
                      onOptionChange={onOptionChange}
                      options={relationOptions}
                      name='relations.molar'
                      label='Molar relation'
                      radioGroupClassName='md:w-[50px] w-[40px] md:rounded-md rounded-lg'
                    />
                    <FieldContainerForRadioGroups
                      labelClassName={'!text-[16px] font-medium'}
                      selectedOption={formik.getFieldProps('relations.incisor').value}
                      onOptionChange={onOptionChange}
                      options={relationOptions}
                      name='relations.incisor'
                      label='Incisor relation'
                      radioGroupClassName='md:w-[50px] w-[40px] md:rounded-md rounded-lg'
                    />
                  </div>
                  <div className='w-full  flex md:flex-row md:justify-between flex-col gap-3 '>
                    <FieldContainerForRadioGroups
                      labelClassName={'!text-[16px] font-medium'}
                      selectedOption={formik.getFieldProps('relations.canine').value}
                      onOptionChange={onOptionChange}
                      options={relationOptions}
                      name='relations.canine'
                      label='Canine relation'
                      radioGroupClassName='md:w-[50px] w-[40px] md:rounded-md rounded-lg'
                    />
                    <FieldContainerForRadioGroups
                      labelClassName={'!text-[16px] font-medium'}
                      selectedOption={formik.getFieldProps('relations.skeletal').value}
                      onOptionChange={onOptionChange}
                      options={relationOptions}
                      name='relations.skeletal'
                      label='Skeletal relation'
                      radioGroupClassName='md:w-[50px] w-[40px] md:rounded-md rounded-lg'
                    />
                  </div>
                </div>

                <div className='flex flex-col gap-6 mt-3'>
                  <div className='flex flex-col md:flex-row flex-wrap justify-between gap-2'>
                    <InputText
                      label='Over jet'
                      name='overjet'
                      formik={formik}
                      placeholder='Enter value'
                      unit='mm'
                      className='md:min-w-[471px] w-full rounded-lg '
                      classNameLabel={clsx('text-textColor text-[16px] text-medium')}
                      maxLength={6}
                    />
                    <InputText
                      label='Deep bite'
                      name='deep_bite'
                      formik={formik}
                      placeholder='Enter value'
                      unit='mm'
                      className='md:min-w-[471px] w-full rounded-lg'
                      classNameLabel={clsx('text-textColor text-[16px] text-medium')}
                      maxLength={6}
                    />
                    <InputText
                      label='Deep bite (%)'
                      name='deep_bite_in_percentage'
                      formik={formik}
                      placeholder='Enter value'
                      unit='mm'
                      className='md:min-w-[471px] w-full rounded-lg'
                      classNameLabel={clsx('text-textColor text-[16px] text-medium')}
                      maxLength={6}
                    />
                    <InputText
                      label='Open bite'
                      name='open_bite'
                      formik={formik}
                      placeholder='Enter value'
                      unit='mm'
                      className='md:min-w-[471px] w-full rounded-lg'
                      classNameLabel={clsx('text-textColor text-[16px] text-medium')}
                      maxLength={6}
                    />
                  </div>

                  <FieldContainerForRadioGroups
                    selectedOption={formik.getFieldProps('midline').value}
                    onOptionChange={onOptionChange}
                    options={midlineOptions}
                    name='midline'
                    label='Midline'
                    radioGroupClassName=' rounded-[4px] w-[130px] h-[44px]'
                    showTopLabel
                    showSideLabel={false}
                    topLabelClassName=' text-lg -mb-[0.34rem] text-textColor'
                    className='text-[16px] font-medium'
                  />
                  <InputTextArea
                    label='Remarks (if any)'
                    name='remarks'
                    placeholder='Type your remarks'
                    formik={formik}
                    className='py-2 rounded-lg border border-mediumGray'
                    classNameLabel={clsx('text-textColor text-[16px]  font-medium')}
                  />
                </div>
                <hr className='my-3' />
                <div className={clsx(' text-[20px] font-semibold')}>Extra-oral examination</div>
                <InputTextArea
                  label='Remarks (if any)'
                  name='extra_oral_remarks'
                  formik={formik}
                  placeholder='Type your remarks'
                  className='py-2 rounded-lg border  border-mediumGray'
                  classNameLabel={clsx('text-textColor text-[16px] font-medium')}
                />
                <div className={clsx(' text-[20px] font-semibold')}>Cephalometric analysis</div>
                <InputTextArea
                  label='Analysis (if any)'
                  name='cephalometric_analysis'
                  formik={formik}
                  className='py-2 rounded-lg border border-mediumGray'
                  placeholder='Type analysis'
                  classNameLabel={clsx('text-textColor text-[16px] font-medium')}
                />
                <p className='text-textColor text-[16px] my-2'>Upload image/pdf</p>
                <When isTrue={fileUrls?.length > 0}>
                  <button
                    type='button'
                    className='text-secondaryColor text-sm font-medium float-right'
                    onClick={() => {
                      formik.setFieldValue('files', [])
                      setFileUrls([])
                    }}
                  >
                    Clear all
                  </button>
                </When>
                <When isTrue={hasValue(fileUrls)}>
                  <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-4 md:gap-10 justify-between'>
                    {fileUrls?.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center md:w-[42.5%] gap-2 flex-shrink justify-between'
                      >
                        <div
                          className='flex items-center justify-between gap-4 cursor-pointer'
                          onClick={() => {
                            if (file.extension === 'mp4' || file.extension === 'pdf') {
                              handleOpenPDF(file.url ?? '', file.name)
                            } else {
                              setIsShowPhotos(true)
                              setSelectedIndex(index)
                            }
                          }}
                        >
                          <When isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}>
                            <Image
                              src={getImageUrl(file)}
                              alt='Uploaded file '
                              className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                              size={20}
                              fileName={formik.values.files[index]?.name}
                              showFileName={true}
                              showLoading={true}
                            />
                          </When>
                          <When isTrue={file.extension === 'mp4'}>
                            <Image
                              className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                              size={20}
                              src={mp4Png}
                            />
                            <p className='break-all'>{formik.values.files[index]?.name} </p>
                          </When>
                          <When isTrue={file.extension === 'pdf'}>
                            <Image
                              className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
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
                </When>
                <When isTrue={!hasValue(fileUrls)}>
                  <div className='h-[71px] bg-primarySupport flex justify-center items-center cursor-pointer relative border rounded-lg border-primaryColor'>
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
                      <div className='flex flex-row justify-center items-center gap-2'>
                        <CommonSVG svg={SVG_CLOUD} width='24' height='19' />
                        <p className='text-sm font-semibold text-primaryColor'>
                          Upload or choose from files
                        </p>
                      </div>
                    </label>
                  </div>
                </When>
              </BorderedCard>
              <BorderedCard
                header={{
                  title: 'Diagnosis',
                  icon: 4,
                }}
              >
                <InputTextArea
                  name='diagnosis'
                  formik={formik}
                  className='py-2 rounded-lg border border-mediumGray h-[112px]'
                  classNameLabel={clsx('text-textColor text-[16px]')}
                />
              </BorderedCard>
              <BorderedCard
                header={{
                  title: 'Treatment objective',
                  icon: 5,
                }}
              >
                <InputTextArea
                  name='treatment_objective'
                  formik={formik}
                  className='py-2 rounded-lg border border-mediumGray h-[112px]'
                  classNameLabel={clsx('text-textColor text-[16px]')}
                />
              </BorderedCard>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='font-semibold text-base flex flex-col-reverse md:flex-row gap-3 mt-3 justify-end'>
                <button
                  className='md:text-grayDisabled md:border-none rounded-lg p-3 border border-mediumGray text-black'
                  type='button'
                  onClick={() => {
                    navigation(`/profile/${patientId}`)
                    dispatch(setCaseInformation(reviewCaseInfoData))
                  }}
                >
                  Cancel
                </button>
                <button type='submit' className='bg-primaryColor rounded-lg p-3 text-white'>
                  Continue
                </button>
              </div>
              {formik.status && (
                <div className='text-red text-xs flex md:justify-end justify-center'>
                  {formik.status}
                </div>
              )}
            </div>
          </form>
        </Page>
      )}
    </>
  )
}

export default AddCaseInformation

interface LabelWithCaseInformationProps {
  title: string
  info: string
}

const LabelWithCaseInformation: React.FC<LabelWithCaseInformationProps> = ({title, info}) => {
  return (
    <div className='flex flex-wrap md:gap-0 gap-1 justify-between items-center'>
      <div>
        <div className={clsx('text-textColor text-[16px] font-medium')}>{title}</div>
      </div>
      <div className='flex md:items-center items-start gap-1'>
        <div className='md:mt-0 mt-1'>
          <InfoIcon height='16' width='16' />
        </div>
        <div>
          <div className={clsx('text-textColor text-[16px] text-medium')}>{info}</div>
        </div>
      </div>
    </div>
  )
}
