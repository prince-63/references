import actionTypes from '@constants/actionTypes'
import {TimePicker} from 'antd'
import {Image} from 'assets/images/Images/Image'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import When from 'components/when/When'
import {useFormik} from 'formik'
import {useEffect, useState} from 'react'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {SVG_CLOUD, SVG_CORRECT_GREEN, SVG_CROSS, SVG_SWITCH_ARROW} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import * as Yup from 'yup'
import {
  disabledTime,
  getFirstLetterCapitalOfWord,
  getImageUrl,
  openDocument,
} from 'utils/ConstFunctions'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import fileFormatType from '@staticData/fileFormatType'
import pdfPng from 'assets/images/Pdf.png'
import mp4Png from 'assets/images/mp4.png'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import Button from 'components/atom/Buttons/Button'
import moment from 'moment'
import {
  setDataForceAlignerData,
  IForceAlignerProps,
} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import PDFWebview from '../../files/components/PDFWebview'

dayjs.extend(utc)
dayjs.extend(timezone)

interface IForceAlignerData {
  handleOnClose: (option: ActionItem) => void
  handleActionOnClick: (option: ActionItem) => void
}

const schema = Yup.object().shape({
  changeDate: Yup.string().required('Please select a value'),
  changeTime: Yup.string().required('Please select a value'),
})

const initialValues = {
  changeTime: dayjs().tz('Asia/Kolkata').format('h:mm A'),
  changeDate: '',
  files: [],
}

interface FormValues {
  changeTime: string
  changeDate: string
  files: File[]
}

const ForceAlignerChange = (props: IForceAlignerData) => {
  const {handleOnClose, handleActionOnClick} = props
  const dispatch = useDispatch()
  const [fileUrls, setFileUrls] = useState<Array<{url: string; type: string}>>([])
  const [minChangeDate, setMinChangeDate] = useState('2024-01-11')
  const [startJawType, setStartJawType] = useState('')
  const [endJawType, setEndJawType] = useState('')
  const [startAlignerNumber, setStartAlignerNumber] = useState(0)
  const [endAlignerNumber, setEndAlignerNumber] = useState(0)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {loading: loadingTreatmentPlan, data: dataTreatmentPlan}: any = useSelector(
    (state: RootState) => state.apiTreatmentPlan
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
  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      const now = dayjs()
      const selectedDateTime = dayjs(
        `${dayjs().format('YYYY-MM-DD')} ${values.changeTime}`,
        'YYYY-MM-DD h:mm A'
      )

      if (selectedDateTime.isBefore(now)) {
        values.changeTime = now.format('h:mm A')
        formik.setFieldValue('changeTime', values.changeTime)
      }

      if (values.changeDate && values.changeTime) {
        dispatch(
          setDataForceAlignerData({
            startJawType,
            endJawType,
            startAlignerNumber,
            endAlignerNumber,
            changeDate: values.changeDate,
            changeTime: values.changeTime,
            alignerJourneyId: dataTreatmentPlan?.aligner_journeys[0]?.aligner_journey_id,
            files: values.files,
          })
        )

        if (dayjs(values.changeDate).isSame(now, 'day')) {
          handleActionOnClick(actionTypes.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL)
        } else {
          handleActionOnClick(actionTypes.FORCE_CHANGE_ALIGNER_WARNING_MODAL)
        }
      }
    },
  })

  useEffect(() => {
    if (!loadingTreatmentPlan && hasValue(dataTreatmentPlan?.aligner_journeys[0])) {
      const alignerJourneyData = dataTreatmentPlan?.aligner_journeys[0]
      alignerJourneyData?.aligners.forEach((aligner: any) => {
        if (aligner.sr_no === alignerJourneyData.current_aligner_no) {
          setMinChangeDate(moment(aligner?.start_date).add(1, 'days').format('YYYY-MM-DD'))
          setStartJawType(getFirstLetterCapitalOfWord(aligner.jaw_type))
          setStartAlignerNumber(aligner.sr_no)
        } else if (aligner.sr_no === alignerJourneyData.current_aligner_no + 1) {
          setEndJawType(getFirstLetterCapitalOfWord(aligner.jaw_type))
          setEndAlignerNumber(aligner.sr_no)
        }
      })
    }
  }, [dataTreatmentPlan])

  // const onChange: TimePickerProps['onChange'] = (time, timeString) => {
  //   formik.setFieldValue('changeTime', timeString)
  // }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...formik.values.files]
    newFiles.splice(index, 1)
    formik.setFieldValue('files', newFiles)

    const newFileUrls = [...fileUrls]
    newFileUrls.splice(index, 1)
    setFileUrls(newFileUrls)
  }
  const {subscriptionData} = useSubscriptionDetails()

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
      }))
      setFileUrls(urls)
    }
  }

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <ModalLayout isResponsive className='md:!w-[45rem] max-h-[95%] overflow-auto'>
          <When isTrue={isShowPhotos}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={fileUrls
                .filter((file) => file.type !== 'application/pdf')
                .map((file, index) => ({
                  id: index,
                  src: getImageUrl(file),
                  width: '100%',
                  height: '100%',
                }))}
              selectedIndex={selectedIndex}
            />
          </When>
          <form className='p-3' onSubmit={formik.handleSubmit}>
            <div className='flex justify-end items-center mb-2'></div>
            <div className='max-h-[70vh] overflow-y-auto flex justify-between'>
              <div>
                <div className='font-semibold text-[24px] mt-'>Manual aligner change</div>
                <div className='font-[16px]'>
                  Log an aligner change done in person or not updated by the patient.{' '}
                </div>
              </div>
              <div
                className='cursor-pointer'
                onClick={() => {
                  handleOnClose(actionTypes.FORCE_CHANGE_ALIGNER)
                }}
              >
                <CommonSVG svg={SVG_CROSS} width='47' height='47' />
              </div>
            </div>
            <InstructionBoard />
            <AlignerSwitch
              startJawType={startJawType}
              endJawType={endJawType}
              endAlignerNumber={endAlignerNumber}
              startAlignerNumber={startAlignerNumber}
            />

            <div className='w-full flex mt-7 gap-4'>
              <div className='w-1/2'>
                <LabelTitle required={true} title='Change date' className='' />
                <InputDateFormik
                  {...{
                    name: 'changeDate',
                    label: '',
                    className: ' py-3',
                    required: false,
                    minDate: dayjs(minChangeDate),
                    maxDate: dayjs(),
                    onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                      formik?.setFieldValue('changeDate', dateString)
                    },
                  }}
                  dateValue={formik?.values?.changeDate}
                  formik={formik}
                />
              </div>
              <div className='w-1/2'>
                <LabelTitle required={true} title='Change time' className='' />

                <TimePicker
                  name='changeTime'
                  use12Hours
                  format='h:mm A'
                  onChange={(time) => {
                    formik.setFieldValue('changeTime', time ? time.format('h:mm A') : null)
                  }}
                  value={
                    formik.values.changeTime ? dayjs(formik.values.changeTime, 'h:mm A') : null
                  }
                  size='large'
                  className='custom-time-input w-full px-2 h-12 rounded-lg border border-mediumGray z-4'
                  disabledTime={disabledTime}
                />
                <div className='text-xs text-red mt-1'>
                  {formik.touched.changeTime && formik.errors.changeTime && (
                    <div className='text-red'>{formik.errors.changeTime}</div>
                  )}
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <div className='flex justify-between mb-2 items-center'>
                <div>
                  <LabelTitle
                    required={false}
                    title='Upload photos (Optional)'
                    className='text-[18px] font-medium text-textColor'
                  />
                  <div className='text-[14px] font-medium text-textColor'>
                    (The photos will be visible in the {startJawType + ' ' + startAlignerNumber}{' '}
                    folder)
                  </div>
                </div>
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
              <When isTrue={!hasValue(fileUrls)}>
                <div className='h-[90px] bg-primarySupport flex justify-center items-center cursor-pointer relative border border-primaryColor rounded-lg'>
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
                        Tap to upload files
                      </p>
                    </div>
                  </label>
                </div>
              </When>
              <When isTrue={hasValue(fileUrls)}>
                <div className='flex flex-wrap w-full gap-8 justify-between '>
                  {fileUrls?.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center w-[42.5%] gap-2 flex-shrink justify-between'
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <When isTrue={file.type !== 'application/pdf' && file.type !== 'video/mp4'}>
                          <Image
                            src={file.url ?? ''}
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
                        <When isTrue={file.type === 'video/mp4'}>
                          <Image
                            className='w-12 h-12 rounded-[4px] object-cover cursor-pointer'
                            onClick={() => openDocument(file?.url ?? '')}
                            size={20}
                            src={mp4Png}
                          />
                          <p className='break-all'>{formik.values.files[index].name} </p>
                        </When>
                        <When isTrue={file.type === 'application/pdf'}>
                          <Image
                            className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                            onClick={() => handleOpenPDF(file.url ?? '')}
                            size={20}
                            src={pdfPng}
                          />

                          <p className='break-all'>{formik.values.files[index].name} </p>
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
            </div>
            <div className='mt-8 w-full'>
              <Button
                className='bg-primaryColor text-white font-semibold text-base w-full h-[56px]'
                text={'Change aligner'}
                // onClick={formik.handleSubmit}
              />
              {/* <AntdButton
            className='bg-primaryColor text-white font-semibold text-base w-full h-[56px]'
            text={'Change aligner'}
            onClick={() => formik.handleSubmit}
          /> */}
            </div>
          </form>
        </ModalLayout>
      )}
    </>
  )
}

export default ForceAlignerChange

const AlignerSwitch = (props: IForceAlignerProps) => {
  const {startJawType, endJawType, startAlignerNumber, endAlignerNumber} = props

  return (
    <div className='mt-4'>
      <div className='relative rounded-lg w-full border border-mediumGray flex h-[86px]'>
        <div className='flex flex-col items-center justify-center w-1/2 border-r'>
          <div className='text-[16px] font-medium'>{startJawType + ' ' + startAlignerNumber}</div>
          <div className='text-[14px] text-textColor font-medium'>Changed from</div>
        </div>
        <div className='flex flex-col items-center justify-center w-1/2 '>
          <div className='text-[16px] font-medium'>{endJawType + ' ' + endAlignerNumber}</div>
          <div className='text-[14px] text-textColor font-medium'>Changed to</div>
        </div>
        <div className='absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2'>
          <BackGroundSVG
            className='w-[48px] h-[48px] bg-lightGray rounded-full'
            svg={SVG_SWITCH_ARROW}
            width='34'
            height='34'
          />
        </div>
      </div>
    </div>
  )
}

const InstructionBoard = () => {
  return (
    <div className='rounded-lg  w-full p-4 border border-textColor flex flex-col mt-5'>
      <div className='text-[16px] text-textColor font-medium'>
        When should you manually change aligner?
      </div>
      <div className='flex gap-2 items-center text-[14px] text-black mt-1 font-medium'>
        <CommonSVG svg={SVG_CORRECT_GREEN} width='16' height='16' />
        <div>Patient changed aligners during a clinic visit</div>
      </div>
      <div className='flex gap-2 items-center text-[14px] text-black font-medium'>
        <CommonSVG svg={SVG_CORRECT_GREEN} width='16' height='16' />
        <div>Patient forgot to update the app</div>
      </div>
    </div>
  )
}
