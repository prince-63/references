import {useContext, useEffect, useRef, useState} from 'react'
import {useParams} from 'react-router'
import moment from 'moment'
import heic2any from 'heic2any'
import {
  createPhotoFileOnly,
  formatTime,
  generateRandomAlphanumeric,
  identifyUser,
  isAllowedFileExtension,
  isObjectEmpty,
  openDocument,
  safeParseInt,
  validateList,
} from 'utils/ConstFunctions'
import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import When from 'components/when/When'
import TimeLineTag from 'screens/Patients/Chat/components/TimeLineTag'
import hasValue from 'utils/hasValue'
import ChatMessage from 'screens/Patients/Chat/components/ChatMessage'
import AttachmentsContainer from 'screens/Patients/Chat/components/AttachmentsContainer'
import TextMessageContainer from 'screens/Patients/Chat/components/TextMessageContainer'
import userTypes from '@constants/userTypes'
import fileFormatType from '@staticData/fileFormatType'
import IconPin from 'assets/icons/IconPin'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import useDispatchAction from '@hooks/useDispatchAction'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import getColorPalette from 'utils/getColorPalette'
import {AuthContext} from 'context/AuthContext'
import {URL_CHAT_SEND} from 'redux/Endpoints/apiEndpoints'
import {IMAGE_DEFAULT_PATIENT, IMAGE_PDF} from 'utils/ImageConst'
import {TEXT_CHAT_PHOTO_VALIDATION, fieldErrorMessages} from 'utils/MessageConstant'
import {SVG_CHAT_EMPTY_STATE, SVG_PIN} from 'utils/SvgConstants'
import validateAndProcessPhotos from 'screens/Patients/Chat/helpers/checkPhotosValidation'
import {Image} from 'assets/images/Images/Image'
import Spinner from 'components/spinner/Spinner'
import AlignerChangedCard from 'screens/Patients/Chat/components/AlignerChangedCard'
import AlignerReviewCard from 'screens/Patients/Chat/components/AlignerReviewCard'
import ReportIssueCard from 'screens/Patients/Chat/components/ReoprtIssueCard'

type ChatObject = {
  chat_id: number
  message: string
  doctor_id: number
  patient_id: number
  image_name: string[]
  created_date: string
  created_by: string
  role_name: string
  profile_image: string | null
  patient_name: string
  aligner_journey_id: number
  additional_data?: {
    eventType: string
    eventMetadata: any
  }
  files?: any[] // Can be array of strings or objects
}

interface Props {
  message: string
  setMessage: (message: string) => void
  messageList: ChatObject[]
  patient: any
  onClick: (userId: string | number) => void
  chatList: any[]
  getChatList: () => void
  chatListLoading: boolean
  messageListLoading: boolean
  patientId?: number | string
}

const ChatNewBody = ({
  message,
  setMessage,
  messageList,
  patient,
  onClick,
  chatList,
  getChatList,
  chatListLoading,
  messageListLoading,
  patientId: overridePatientId,
}: Props) => {
  const params = useParams<{id?: string; patientId?: string}>()
  const resolvedPatientId = overridePatientId ?? params.id ?? params.patientId ?? ''
  const patientUserId = `${resolvedPatientId}`

  const [photos, setPhotos] = useState<any[]>([])
  const {userId, userDetail, demoModeStatus} = useContext(AuthContext)
  const [messageSending, setMessageSending] = useState<boolean>(false)
  const userData: any = userDetail
  const {dispatchAction} = useDispatchAction()
  const onChangeMessageTyping = (m: string) => setMessage(m)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      const {scrollHeight, clientHeight} = containerRef.current
      containerRef.current.scrollTop = scrollHeight - clientHeight
    }
  }, [messageList])

  const chatSend = async () => {
    const trimmedMessage = message.replace(/\s+/g, ' ')
    if (trimmedMessage.length < 2) {
      ErrorToast(fieldErrorMessages.TEXT_MESSAGE)
    } else if (trimmedMessage.length >= 5000) {
      ErrorToast(fieldErrorMessages.CHAT_MESSAGE_LENGTH_EXCEEDED)
    } else {
      setMessageSending(true)
      const details = {
        message: message,
        patientId: safeParseInt(patientUserId),
        doctorId: safeParseInt(userId),
        imageName: null,
        roleName: 'Doctor',
        createdBy: `${userData.first_name} ${userData.last_name}`,
        doctorName: `Dr ${userData.first_name} ${userData.last_name}`,
        patientName: patient.patientName,
      }
      setMessage('')
      const formData = new FormData()
      formData.append('createChatAddRequest', JSON.stringify(details))
      try {
        await apiHelper(URL_CHAT_SEND, HttpMethod.POST, formData)
          .then(() => {
            setMessage('')
            onClick(patientUserId)
            identifyUser()
            getChatList()
            setMessageSending(false)
          })
          .catch((error) => {
            setMessageSending(false)
            console.error(error)
          })
      } catch (error) {
        setMessageSending(false)
        console.error(error)
      }
    }
  }

  const chatFileFormats = fileFormatType.CHAT_FILE_EXTENSIONS
  const [attachmentsFormData, setAttachmentsFormData] = useState<FormData>(new FormData())
  const {subscriptionData} = useSubscriptionDetails()

  const photoUpload = async (files: FileList) => {
    const validatedImageList = validateAndProcessPhotos({
      files,
      filesAlreadySelected: photos,
      availableStorage: subscriptionData?.total_storage_gb,
      usedStorage: subscriptionData?.used_storage_gb,
    })
    const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '')
    const fileNameWithoutExtension = `${patientUserId}${todayDate}${generateRandomAlphanumeric(10)}`
    const photoArrayList: any = []
    for (let i = 0; i < validatedImageList.length; i++) {
      const photo = validatedImageList[i]
      if (isAllowedFileExtension(photo.name, chatFileFormats)) {
        const photoNameLowerCase = photo?.name
        if (photoNameLowerCase.endsWith('heic')) {
          try {
            const blob: any = await heic2any({blob: photo, toType: 'image/jpeg'})
            const imageFile = new File([blob], `${fileNameWithoutExtension}.jpeg`, {
              type: 'image/jpeg',
            })
            const url = URL.createObjectURL(imageFile)
            photoArrayList.push({file: imageFile, url})
          } catch (error) {
            console.error('Error converting HEIC to JPEG:', error)
          }
        } else {
          const fileName = photo.name
          const convertedImage = createPhotoFileOnly(fileName, photo)
          if (convertedImage !== undefined) {
            photoArrayList.push(convertedImage)
          }
        }
      } else {
        ErrorToast(TEXT_CHAT_PHOTO_VALIDATION)
      }
    }
    attachmentsFormData.delete('imagesNames')
    attachmentsFormData.delete('createChatAddRequest')
    const selectedPhotosList = photoArrayList.map((element: any) => element.file)
    const updatedPhotos = [...photos, ...photoArrayList.map((element: any) => element)]

    setPhotos(updatedPhotos)
    const details = {
      message: '',
      patientId: safeParseInt(patientUserId),
      doctorId: safeParseInt(userId),
      imageName: null,
      roleName: 'Doctor',
      createdBy: `${userData.first_name} ${userData.last_name}`,
      doctorName: `Dr ${userData.first_name} ${userData.last_name}`,
      patientName: patient.patientName,
    }

    attachmentsFormData.append('createChatAddRequest', JSON.stringify(details))
    selectedPhotosList.forEach(async (photo: any) => {
      attachmentsFormData.append('imageNames', photo)
    })
    setAttachmentsFormData(attachmentsFormData)

    const inputElement: any = document.getElementById('image')
    if (inputElement) inputElement.value = ''
  }

  const imageUploadAPiCall = async (formData: FormData) => {
    try {
      setMessageSending(true)
      await apiHelper(URL_CHAT_SEND, HttpMethod.POST, formData)
        .then(() => {
          setMessage('')
          onClick(patientUserId)
          identifyUser()
          setPhotos([])
          getChatList()
          setMessageSending(false)
          attachmentsFormData.delete('imagesNames')
          attachmentsFormData.delete('createChatAddRequest')
        })
        .catch((error) => {
          setMessageSending(false)
          console.error(error)
        })
    } catch (error) {
      setMessageSending(false)
      console.error(error)
    }
  }

  const handleDelete = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    const formData = new FormData()
    const details = {
      message: '',
      patientId: safeParseInt(patientUserId),
      doctorId: safeParseInt(userId),
      imageName: null,
      roleName: 'Doctor',
      createdBy: `${userData.first_name} ${userData.last_name}`,
      doctorName: `Dr ${userData.first_name} ${userData.last_name}`,
      patientName: patient.patientName,
    }
    formData.append('createChatAddRequest', JSON.stringify(details))
    updatedPhotos.forEach(({file}) => {
      formData.append('imageNames', file)
    })
    setAttachmentsFormData(formData)
    setPhotos(updatedPhotos)
  }

  const handleKeyMessageFunctions = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault()
      chatSend()
    }
    if (event.keyCode === 13 && event.shiftKey) {
      onChangeMessageTyping(`${message}\n`)
    }
  }

  const viewChatImage = (image: string) => {
    setSelectedImage(image)
    setSelectedPreviewImages(null)
    setSelectedPreviewIndex(undefined)
    setPhotoViewerOpen(true)
  }

  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPreviewImages, setSelectedPreviewImages] = useState<any[] | null>(null)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | undefined>()

  const formatImageForViewer = (image: string) => ({
    src: image,
    alt: 'chat-image',
    title: 'chat-image',
    width: '100%',
    height: '100%',
  })

  const setPhotoViewerOpen = (isOpen: boolean) => {
    setIsShowPhotos(isOpen)
    if (!isOpen) {
      setSelectedPreviewImages(null)
      setSelectedPreviewIndex(undefined)
    }
  }

  const formatDate = (dateString: string) => moment(dateString).format('DD MMM YYYY')
  const displayedDateTags: {[key: string]: boolean} = {}

  // Fixed getImagesList function to handle both strings and objects
  const getImagesList = (list: any[]) => {
    const isImage = (img: any) => {
      // Check if img is a string
      if (typeof img === 'string') {
        return img && !['pdf', 'mp4', 'stl'].some((ext) => img.toLowerCase().endsWith(ext))
      }
      // Check if img is an object with url property (from files array)
      if (typeof img === 'object' && img !== null) {
        const url = img.url || img.imageUrl || ''
        if (typeof url === 'string') {
          return url && !['pdf', 'mp4', 'stl'].some((ext) => url.toLowerCase().endsWith(ext))
        }
      }
      return false
    }

    const getImageUrlFromItem = (img: any) => {
      if (typeof img === 'string') return img
      if (typeof img === 'object' && img !== null) {
        return img.url || img.imageUrl || ''
      }
      return ''
    }

    const allImages = list.flatMap((m) => {
      const images = m.image_name || []
      const files = m.files || []
      // Process image_name array (strings)
      const imageUrls = images.filter(isImage).map(getImageUrlFromItem)
      // Process files array (objects)
      const fileUrls = files.filter(isImage).map(getImageUrlFromItem)
      return [...imageUrls, ...fileUrls]
    })

    const otherImages = allImages.filter((image) => image !== selectedImage).reverse()
    const orderedImages = selectedImage ? [selectedImage, ...otherImages] : otherImages
    return orderedImages.map(formatImageForViewer)
  }

  useEffect(() => {
    dispatchAction(setIsBottomBarOpen(hasValue(chatList) && patientUserId ? false : true))
  }, [chatList, dispatchAction, patientUserId])

  // Helper function to format date from array format [year, month, day]
  const formatDateFromArray = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return ''
    return moment([dateArray[0], dateArray[1] - 1, dateArray[2]]).format('DD MMM YYYY')
  }

  // Helper function to format issue text
  const formatIssue = (issue: string) => {
    if (!issue) return 'Not provided'
    return issue
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Helper function to get URL from item (string or object)
  const getMediaUrl = (item: any): string => {
    if (typeof item === 'string') return item
    if (typeof item === 'object' && item !== null) {
      return item.url || item.imageUrl || ''
    }
    return ''
  }

  // Helper function to render event cards
  const renderEventCard = (chat: ChatObject) => {
    const additionalData = chat.additional_data
    if (!additionalData || !additionalData.eventType) return null

    const eventType = additionalData.eventType
    const eventMetadata = additionalData.eventMetadata || {}
    const timeLabel = formatTime(chat.created_date)

    // Handle ALIGNER_CHECK_IN event
    if (eventType === 'ALIGNER_CHECK_IN') {
      // Check if it's an ALIGNER_CHANGE type inside ALIGNER_CHECK_IN
      if (eventMetadata.type === 'ALIGNER_CHANGE') {
        // This is an ALIGNER_CHANGE event
        const alignerNo = eventMetadata.newAlignerNo || eventMetadata.alignerNo
        const trayLabel = alignerNo ? `Tray #${alignerNo}` : ''
        const jawType = eventMetadata.newAlignerJawType || eventMetadata.alignerJawType || ''

        // Determine change status
        let changeStatus = 'ON_TIME'
        if (eventMetadata.previousAlignerChangeStatus === 'EARLY') {
          changeStatus = 'EARLY'
        } else if (eventMetadata.previousAlignerChangeStatus === 'DELAYED') {
          changeStatus = 'DELAYED'
        }

        const description = `${jawType} Aligner #${alignerNo} is now active.`

        return (
          <AlignerChangedCard
            title='ALIGNER CHANGED'
            trayLabel={trayLabel}
            timeLabel={timeLabel}
            description={description}
            changeStatus={changeStatus}
            metadata={{
              previous_aligner_change_date: formatDateFromArray(
                eventMetadata.previousAlignerChangeDate
              ),
              previous_aligner_end_date: formatDateFromArray(eventMetadata.previousAlignerEndDate),
              days_gap_from_end_date_to_change_date: eventMetadata.daysGapFromEndDateToChangeDate,
            }}
          />
        )
      }
      // Handle regular ALIGNER_CHECK_IN with feedback
      else if (eventMetadata.feedback) {
        // This is an ALIGNER_REVIEW event
        const alignerNo = eventMetadata.alignerNo
        const trayLabel = alignerNo ? `Tray #${alignerNo}` : ''
        const jawType = eventMetadata.alignerJawType || 'BOTH'

        // Extract fit feedback from the feedback object
        const fitFeedback: any = {}
        const comfortIssues: any = {
          upper: [],
          lower: [],
          other: eventMetadata.feedback.other_issues || '',
        }

        if (eventMetadata.feedback.feedbacks) {
          const feedbacks = eventMetadata.feedback.feedbacks

          // Upper jaw feedback
          if (feedbacks.UPPER) {
            if (feedbacks.UPPER.fitting_feedback?.fittings) {
              fitFeedback.upper = feedbacks.UPPER.fitting_feedback.fittings[0]
            }
            if (feedbacks.UPPER.changing_feedback?.aligner_changing_issues) {
              comfortIssues.upper = feedbacks.UPPER.changing_feedback.aligner_changing_issues
            }
          }

          // Lower jaw feedback
          if (feedbacks.LOWER) {
            if (feedbacks.LOWER.fitting_feedback?.fittings) {
              fitFeedback.lower = feedbacks.LOWER.fitting_feedback.fittings[0]
            }
            if (feedbacks.LOWER.changing_feedback?.aligner_changing_issues) {
              comfortIssues.lower = feedbacks.LOWER.changing_feedback.aligner_changing_issues
            }
          }
        }

        // Format photos for the card
        const photos = (eventMetadata.alignerPhotos || []).map((photo: any) => ({
          imageUrl: photo.imageUrl,
          withAligner: photo.withAligner,
          jawType: photo.jawType,
          fileType: photo.fileType,
        }))

        return (
          <AlignerReviewCard
            title='ALIGNER REVIEW'
            trayLabel={trayLabel}
            timeLabel={timeLabel}
            jawType={jawType}
            fitFeedback={fitFeedback}
            comfortIssues={comfortIssues}
            photos={photos}
            onPhotoPress={(index: number, cardPhotos) => {
              const selectedPhotoUrl = cardPhotos[index]?.imageUrl
              if (selectedPhotoUrl) {
                const viewerPhotos = cardPhotos.filter((photo) => hasValue(photo.imageUrl))
                const viewerIndex = viewerPhotos.findIndex(
                  (photo) => photo.imageUrl === selectedPhotoUrl
                )
                setSelectedImage(selectedPhotoUrl)
                setSelectedPreviewImages(
                  viewerPhotos.map((photo) => formatImageForViewer(photo.imageUrl))
                )
                setSelectedPreviewIndex(Math.max(viewerIndex, 0))
                setPhotoViewerOpen(true)
              }
            }}
          />
        )
      }
    }

    // Handle ISSUE_REPORTED event
    if (eventType === 'ISSUE_REPORTED') {
      const alignerNo = eventMetadata.alignerNo
      const trayLabel = alignerNo ? `Tray #${alignerNo}` : ''
      const jawType = eventMetadata.jawType || ''

      const feedbackValue = formatIssue(eventMetadata.alignerIssue)
      const otherIssueValue = eventMetadata.otherIssue || 'None'

      return (
        <ReportIssueCard
          title='ISSUE REPORTED'
          trayLabel={trayLabel}
          timeLabel={timeLabel}
          feedbackValue={feedbackValue}
          otherIssueValue={otherIssueValue}
          jawType={jawType}
        />
      )
    }

    // Handle legacy ALIGNER_CHANGED event (if any)

    return null
  }

  return (
    <div className='flex flex-col h-full w-full min-h-0 box-border'>
      <When isTrue={isShowPhotos && hasValue(selectedImage)}>
        <ImageViewer
          setIsShowPhotos={setPhotoViewerOpen}
          selectedImagesList={selectedPreviewImages ?? getImagesList(messageList)}
          selectedIndex={selectedPreviewIndex}
        />
      </When>

      <div className='flex-1 min-h-0 overflow-y-auto' ref={containerRef}>
        <When isTrue={messageListLoading}>
          <div className='flex h-full items-center justify-center'>
            <Spinner loading />
          </div>
        </When>

        <When isTrue={messageList.length > 0}>
          {!isObjectEmpty(patient) && (
            <div className='w-full flex flex-col gap-3'>
              {validateList(messageList) &&
                messageList.map((chat: ChatObject, index: number) => {
                  const chatImages = Array.isArray(chat.image_name) ? chat.image_name : []
                  const chatFiles = Array.isArray(chat.files) ? chat.files : []
                  const mediaItems = chatFiles.length > 0 ? chatFiles : chatImages
                  const hasMedia =
                    mediaItems.length > 0 && (chatFiles.length > 0 || chatImages[0] !== '')
                  const formattedDate = formatDate(chat.created_date)
                  const displayDateTag = !displayedDateTags[formattedDate]
                  displayedDateTags[formattedDate] = true

                  return (
                    <div className='px-4' key={`${chat.chat_id}-${index}`}>
                      <When isTrue={displayDateTag}>
                        <div className='sticky top-0 flex items-center justify-center z-10'>
                          <TimeLineTag {...{timeline: formattedDate}} />
                        </div>
                      </When>

                      <div className='mt-2 flex flex-col gap-2'>
                        {/* Check if this is an event message */}
                        {chat.additional_data && chat.additional_data.eventType ? (
                          renderEventCard(chat)
                        ) : (
                          <>
                            {/* Patient Message */}
                            {chat.role_name?.toUpperCase() === userTypes.PATIENT && (
                              <div className='flex items-start mb-2 w-full gap-3'>
                                <Image
                                  src={chat.profile_image ?? IMAGE_DEFAULT_PATIENT}
                                  alt='User Avatar'
                                  className='w-8 h-8 rounded-full bg-mediumGray shadow-lg'
                                />
                                <div className='max-w-[80%]'>
                                  {chat.message !== '' && chat.message !== null && (
                                    <div>
                                      <div className='bg-primarySupport px-3 py-2 rounded-tr-lg rounded-bl-lg rounded-br-lg break-words max-w-[30rem]'>
                                        <p className='text-sm text-textColor whitespace-pre-line'>
                                          {chat.message}
                                        </p>
                                      </div>
                                      <div className='text-right text-textColor text-xs font-normal mt-1'>
                                        {formatTime(chat.created_date)}
                                      </div>
                                    </div>
                                  )}

                                  {hasMedia && (
                                    <div className='w-fit mt-1'>
                                      <div className='bg-primarySupport rounded-lg flex gap-2 p-2 cursor-pointer flex-wrap'>
                                        {validateList(mediaItems) &&
                                          mediaItems.map((item: any, i: number) => {
                                            const rawUrl = getMediaUrl(item)
                                            const isPdf =
                                              typeof rawUrl === 'string' &&
                                              rawUrl.toLowerCase().includes('.pdf')
                                            return (
                                              <div key={i}>
                                                {isPdf ? (
                                                  <img
                                                    className='w-13 object-cover h-16 rounded-lg'
                                                    src={IMAGE_PDF}
                                                    alt='Doc'
                                                    onClick={() => openDocument(rawUrl)}
                                                  />
                                                ) : (
                                                  <Image
                                                    className='w-16 object-cover h-16 rounded-lg'
                                                    src={rawUrl}
                                                    alt='photo'
                                                    onClick={() => viewChatImage(rawUrl)}
                                                    showLoading={true}
                                                  />
                                                )}
                                              </div>
                                            )
                                          })}
                                      </div>
                                      <div className='text-right text-textColor text-xs font-normal mt-1'>
                                        {formatTime(chat.created_date)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Doctor Message */}
                            {chat.role_name?.toUpperCase() === userTypes.DOCTOR && (
                              <div className='flex items-start justify-end w-full'>
                                <div className='max-w-[80%]'>
                                  <When isTrue={hasValue(chat.message)}>
                                    <ChatMessage {...{message: chat.message}} />
                                    <div className='text-right text-textColor text-xs font-normal mt-1'>
                                      {formatTime(chat.created_date)}
                                    </div>
                                  </When>

                                  {hasMedia && (
                                    <div className='w-fit ml-auto mt-1'>
                                      <div className='bg-lightGray rounded-lg flex gap-2 p-2 cursor-pointer flex-wrap'>
                                        {validateList(mediaItems) &&
                                          mediaItems.map((item: any, i: number) => {
                                            const rawUrl = getMediaUrl(item)
                                            const isPdf =
                                              typeof rawUrl === 'string' &&
                                              rawUrl.toLowerCase().includes('.pdf')
                                            return (
                                              <div key={i}>
                                                {isPdf ? (
                                                  <img
                                                    className='w-13 object-cover h-16 rounded-lg'
                                                    src={IMAGE_PDF}
                                                    alt='Doc'
                                                    onClick={() => openDocument(rawUrl)}
                                                  />
                                                ) : (
                                                  <Image
                                                    className='w-16 object-cover h-16 rounded-lg'
                                                    src={rawUrl}
                                                    alt='photo'
                                                    onClick={() => viewChatImage(rawUrl)}
                                                    showLoading={true}
                                                  />
                                                )}
                                              </div>
                                            )
                                          })}
                                      </div>
                                      <div className='text-right text-textColor text-xs font-normal mt-1'>
                                        {formatTime(chat.created_date)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </When>

        <When isTrue={!chatListLoading && !hasValue(chatList)}>
          <div className='flex flex-col justify-center items-center gap-6 w-full md:mt-0 mt-20'>
            <BackGroundSVG
              svg={SVG_CHAT_EMPTY_STATE}
              width=''
              height=''
              className='md:w-1/4 w-[160px]'
            />
            <p className='text-textColor md:w-1/4 w-full break-words text-center'>
              No chats yet! Click on '+ New Chat' to initiate a conversation with your patients
            </p>
          </div>
        </When>

        <When isTrue={!messageListLoading && !hasValue(messageList) && hasValue(chatList)}>
          <div className='flex flex-col justify-center items-center gap-6 w-full h-full md:mt-0 mt-20'>
            <BackGroundSVG
              svg={SVG_CHAT_EMPTY_STATE}
              width=''
              height=''
              className='md:w-1/4 w-[160px]'
            />
            <p className='text-textColor md:w-1/4 break-words text-center'>
              No chats yet! Start by sending a message.
            </p>
          </div>
        </When>
      </div>

      <When isTrue={!isObjectEmpty(patient)}>
        <div
          className={`w-full md:hidden fixed bottom-0 left-0 right-0 flex items-center md:border-none border-t bg-white z-20 ${
            demoModeStatus ? 'pointer-events-none' : ''
          }`}
        >
          <div className='w-full flex items-center gap-2 p-3'>
            <label className='min-w-10'>
              <div className='min-w-10 h-10 flex justify-center items-center bg-primarySupport cursor-pointer rounded-full'>
                <IconPin color={getColorPalette().primaryColor} width='20' height='22' />
              </div>
              <input
                style={{display: 'none'}}
                type='file'
                id='image'
                multiple
                accept='.jpg, .jpeg, .png, .pdf, .heic'
                onChange={(e: any) => photoUpload(e.target.files)}
              />
            </label>

            <When isTrue={!hasValue(photos)}>
              <div className='flex-1 min-w-0'>
                <TextMessageContainer
                  {...{
                    message,
                    onChangeMessageTyping,
                    handleKeyMessageFunctions,
                    chatSend,
                    messageSending,
                  }}
                />
              </div>
            </When>
            <When isTrue={hasValue(photos)}>
              <div className='flex w-full flex-1 min-w-0'>
                <AttachmentsContainer
                  {...{
                    photos,
                    imageUploadAPiCall,
                    attachmentsFormData,
                    handleDelete,
                    messageSending,
                  }}
                />
              </div>
            </When>
          </div>
        </div>

        <div
          className={`w-full bg-white mt-3 md:block hidden ${
            demoModeStatus ? 'pointer-events-none' : ''
          }`}
        >
          <div className='px-8 items-center flex gap-2'>
            <div className='w-11 h-10 bg-primarySupport rounded-3xl flex justify-center items-center hover:bg-mediumGray cursor-pointer'>
              <label className='p-3 cursor-pointer'>
                <CommonSVG svg={SVG_PIN} width='20' height='22' />
                <input
                  style={{display: 'none'}}
                  type='file'
                  id='image'
                  multiple
                  accept='.jpg, .jpeg, .png, .pdf, .heic'
                  onChange={(e: any) => photoUpload(e.target.files)}
                />
              </label>
            </div>

            <When isTrue={!hasValue(photos)}>
              <div className='flex-1 min-w-0'>
                <TextMessageContainer
                  {...{
                    message,
                    onChangeMessageTyping,
                    handleKeyMessageFunctions,
                    chatSend,
                    messageSending,
                  }}
                />
              </div>
            </When>
            <When isTrue={hasValue(photos)}>
              <div className='flex w-full flex-1 min-w-0'>
                <AttachmentsContainer
                  {...{
                    photos,
                    imageUploadAPiCall,
                    attachmentsFormData,
                    handleDelete,
                    messageSending,
                  }}
                />
              </div>
            </When>
          </div>
        </div>
      </When>
    </div>
  )
}

export default ChatNewBody
