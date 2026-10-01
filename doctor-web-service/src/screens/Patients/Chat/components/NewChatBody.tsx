import {useContext, useEffect, useRef, useState} from 'react'
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
} from '../../../../utils/ConstFunctions'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import apiHelper from '../../../../@utils/apiHelper'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import ErrorToast from '../../../../components/modal/Alert/ErrorToast'
import {AuthContext} from '../../../../context/AuthContext'
import {URL_CHAT_SEND} from '../../../../redux/Endpoints/apiEndpoints'
import {IMAGE_DEFAULT_PATIENT, IMAGE_PDF} from '../../../../utils/ImageConst'
import {TEXT_CHAT_PHOTO_VALIDATION, fieldErrorMessages} from '../../../../utils/MessageConstant'
import {SVG_CHAT_EMPTY_STATE, SVG_PIN} from '../../../../utils/SvgConstants'
import validateAndProcessPhotos from '../helpers/checkPhotosValidation'
import {Image} from '../../../../assets/images/Images/Image'
import heic2any from 'heic2any'
import BackGroundSVG from '../../../../components/atom/SVG/BackGroundSVG'
import When from '../../../../components/when/When'
import TimeLineTag from './TimeLineTag'
import moment from 'moment'
import hasValue from '../../../../utils/hasValue'
import ChatMessage from './ChatMessage'
import AttachmentsContainer from './AttachmentsContainer'
import TextMessageContainer from './TextMessageContainer'
import userTypes from '../../../../@constants/userTypes'
import fileFormatType from '../../../../@staticData/fileFormatType'
import alertType from '@constants/alertType'
import {eventEmitter} from '@utils/eventEmitter'
import IconPin from 'assets/icons/IconPin'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import useDispatchAction from '@hooks/useDispatchAction'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import getColorPalette from 'utils/getColorPalette'

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
}

interface Props {
  message: string
  setMessage: any
  messageList: any
  patient: any
  onClick: (userId: string) => void
  chatList: ChatObject[]
  getChatList: () => void
  chatListLoading: boolean
  messageListLoading: boolean
  data: any
}

export const NewChatBody = (props: Props) => {
  const {
    setMessage,
    message,
    messageList,
    patient,
    onClick,
    chatList,
    getChatList,
    chatListLoading,
    messageListLoading,
    data,
  } = props
  const [photos, setPhotos] = useState<any[]>([])
  const {userId, userDetail, demoModeStatus} = useContext(AuthContext)
  const [messageSending, setMessageSending] = useState<boolean>(false)
  const userData: any = userDetail
  const {dispatchAction} = useDispatchAction()
  const onChangeMessageTyping = (message: string) => {
    setMessage(message)
  }
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      const {scrollHeight, clientHeight} = containerRef.current
      containerRef.current.scrollTop = scrollHeight - clientHeight
    }
  }, [messageList])

  // Chat Send API
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
        patientId: safeParseInt(data?.patient_details?.id),
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
            onClick(data?.patient_details?.id)
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
    const fileNameWithoutExtension = `${
      data?.patient_details?.id
    }${todayDate}${generateRandomAlphanumeric(10)}`
    const photoArrayList: any = []
    for (let i = 0; i < validatedImageList.length; i++) {
      const photo = validatedImageList[i]
      if (isAllowedFileExtension(photo.name, chatFileFormats)) {
        const photoNameLowerCase = photo?.name
        if (photoNameLowerCase.endsWith('heic')) {
          try {
            // Convert HEIC to JPEG
            const blob: any = await heic2any({
              blob: photo,
              toType: 'image/jpeg',
            })

            // Create a new File object with the converted JPEG blob
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
      patientId: safeParseInt(data?.patient_details?.id),
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
    if (inputElement) {
      inputElement.value = ''
    }
  }
  const imageUploadAPiCall = async (formData: FormData) => {
    try {
      setMessageSending(true)
      await apiHelper(URL_CHAT_SEND, HttpMethod.POST, formData)
        .then(() => {
          setMessage('')
          onClick(data?.patient_details?.id)
          identifyUser()
          setPhotos([])
          setAttachmentsFormData(new FormData())
          setMessageSending(false)
        })
        .catch((error) => {
          setMessageSending(false)
          setAttachmentsFormData(new FormData())
          setPhotos([])
          eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
        })
    } catch (error: any) {
      setMessageSending(false)
      eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
    }
  }

  const handleKeyMessageFunctions = (e: any) => {
    if (e.key === 'Enter' && e.shiftKey) {
      const cursorPos = e.target.selectionStart
      const newMessage = `${message.substring(0, cursorPos)}\n${message.substring(cursorPos)}`
      setMessage(newMessage)
      e.preventDefault()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (e.key === 'Enter') {
        chatSend()
      }
    }
  }
  const formatDate = (dateString: string): string => {
    const messageDate = moment(dateString)
    const today = moment()
    const yesterday = moment().subtract(1, 'day')

    if (messageDate.isSame(today, 'day')) {
      return 'Today'
    } else if (messageDate.isSame(yesterday, 'day')) {
      return 'Yesterday'
    } else {
      return messageDate.format('DD-MMM-YYYY')
    }
  }
  const displayedDateTags: {[key: string]: boolean} = {}
  const handleDelete = (index: number) => {
    setPhotos((prevPhotos: any) => {
      const newPhotos = [...prevPhotos]
      newPhotos.splice(index, 1)

      const newFormData = new FormData()
      const details = {
        message: '',
        patientId: safeParseInt(data?.patient_details?.id),
        doctorId: safeParseInt(userId),
        imageName: null,
        roleName: 'Doctor',
        createdBy: `${userData.first_name} ${userData.last_name}`,
        doctorName: `Dr ${userData.first_name} ${userData.last_name}`,
        patientName: patient.patientName,
      }
      newFormData.append('createChatAddRequest', JSON.stringify(details))
      attachmentsFormData.delete('createChatAddRequest')

      newPhotos.forEach((photo: any) => {
        newFormData.append('imageNames', photo.file)
      })

      setAttachmentsFormData(newFormData)

      return newPhotos
    })
  }

  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  const viewChatImage = (image: string) => {
    setSelectedImage(image)
    setIsShowPhotos(true)
  }
  const getImagesList = (messageList: any[]) => {
    const isImage = (img: string) => img && !['pdf', 'mp4', 'stl'].some((ext) => img.endsWith(ext))

    const formatImage = (image: string) => ({
      src: image,
      alt: 'chat-image',
      title: 'chat-image',
      width: '100%',
      height: '100%',
    })

    const allImages = messageList.flatMap((message) => message.image_name).filter(isImage)

    const otherImages = allImages.filter((image) => image !== selectedImage).reverse()

    return [selectedImage, ...otherImages].map(formatImage)
  }

  useEffect(() => {
    dispatchAction(
      setIsBottomBarOpen(hasValue(chatList) && data?.patient_details?.id ? false : true)
    )
  }, [chatList])

  return (
    <div className='flex flex-col h-[450px] w-full'>
      <When isTrue={isShowPhotos && hasValue(selectedImage)}>
        <ImageViewer
          setIsShowPhotos={setIsShowPhotos}
          selectedImagesList={getImagesList(messageList)}
        />
      </When>

      <When isTrue={messageList.length > 0}>
        {!isObjectEmpty(patient) && (
          // Fixed: Messages container with proper overflow and flex-1
          <div className='flex-1 overflow-y-auto px-4 pb-4' ref={containerRef}>
            {validateList(messageList) &&
              messageList.map((chat: any, index: number) => {
                const formattedDate = formatDate(chat.created_date)
                dispatchAction(setIsBottomBarOpen(false))
                const displayDateTag = !displayedDateTags[formattedDate]
                displayedDateTags[formattedDate] = true
                return (
                  <div className='my-2 flex flex-col' key={index}>
                    <When isTrue={displayDateTag}>
                      <div className='sticky top-0 flex items-center justify-center z-10'>
                        <TimeLineTag {...{timeline: formattedDate}} />
                      </div>
                    </When>
                    <div>
                      {/*Chat Message by Patient Side */}
                      {chat.role_name.toUpperCase() === userTypes.PATIENT && (
                        <div className='flex items-start mb-4 w-full'>
                          <Image
                            src={
                              chat.profile_image == null
                                ? IMAGE_DEFAULT_PATIENT
                                : chat.profile_image
                            }
                            alt='User Avatar'
                            className='w-8 h-8 rounded-full bg-mediumGray shadow-lg'
                          />

                          <div className='max-w-[80%]'>
                            {chat.message !== '' ? (
                              <div>
                                <div className='ml-3 bg-primarySupport px-3 py-2 rounded-tr-lg rounded-bl-lg rounded-br-lg break-words max-w-[30rem]'>
                                  <p className='text-sm text-textColor whitespace-pre-line'>
                                    {chat.message}
                                  </p>
                                </div>
                                <div className='text-right text-textColor text-xs font-normal mt-1'>
                                  {formatTime(chat.created_date)}
                                </div>
                              </div>
                            ) : null}
                            {chat.image_name[0] != '' && (
                              <div className='w-fit ml-3'>
                                <div className='bg-primarySupport rounded-lg flex gap-1 p-2 mt-1 cursor-pointer'>
                                  {validateList(chat.image_name) &&
                                    chat.image_name.map((image: any, index: number) => (
                                      <div key={index}>
                                        {image.slice(-3) === 'pdf' ? (
                                          <img
                                            className={'w-13 object-cover h-16 rounded-lg'}
                                            src={IMAGE_PDF}
                                            alt='Doc'
                                            key={index}
                                            onClick={() => openDocument(image)}
                                          />
                                        ) : (
                                          <Image
                                            className={'w-16 object-cover h-16 rounded-lg'}
                                            src={image}
                                            alt='photo'
                                            onClick={() => viewChatImage(image)}
                                            showLoading={true}
                                          />
                                        )}
                                      </div>
                                    ))}
                                </div>

                                <div className='text-right text-textColor text-xs font-normal mt-1'>
                                  {formatTime(chat.created_date)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/*Chat Message by Doctor Side */}
                      {chat.role_name.toUpperCase() == userTypes.DOCTOR && (
                        <div className='flex items-start justify-end float-end w-full pl-[20%]'>
                          <div>
                            <div>
                              <When isTrue={hasValue(chat.message)}>
                                <ChatMessage {...{message: chat.message}} />
                                <div className='text-right text-textColor text-xs font-normal mt-1'>
                                  {formatTime(chat.created_date)}
                                </div>
                              </When>
                            </div>
                            {chat.image_name[0] != '' && (
                              <div className='w-fit ml-3' key={1}>
                                <div className='bg-lightGray rounded-lg flex gap-1 p-2 mt-1 cursor-pointer'>
                                  {validateList(chat.image_name) &&
                                    chat.image_name.map((image: any, index: number) => (
                                      <div key={index}>
                                        {image.slice(-3) === 'pdf' ? (
                                          <img
                                            className={'w-13 object-cover h-16 rounded-lg'}
                                            src={IMAGE_PDF}
                                            alt='Doc'
                                            key={index}
                                            onClick={() => openDocument(image)}
                                          />
                                        ) : (
                                          <Image
                                            className={'w-16 object-cover h-16 rounded-lg'}
                                            src={image}
                                            alt='photo'
                                            onClick={() => viewChatImage(image)}
                                            showLoading={true}
                                          />
                                        )}
                                      </div>
                                    ))}
                                </div>

                                <div className='text-right text-textColor text-xs font-normal mt-1'>
                                  {formatTime(chat.created_date)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </When>

      {/* Fixed: Empty state containers with proper centering */}
      <When isTrue={!chatListLoading && !hasValue(chatList)}>
        <div className='flex-1 flex flex-col justify-center items-center gap-6 px-4'>
          <BackGroundSVG
            svg={SVG_CHAT_EMPTY_STATE}
            width='240'
            height='240'
            className='md:w-1/4 w-[160px]'
          />
          <p className='text-textColor md:w-1/4 w-full break-words text-center'>
            No chats yet! Click on '+ New Chat' to initiate a conversation with your patients
          </p>
        </div>
      </When>

      <When isTrue={!messageListLoading && !hasValue(messageList) && hasValue(chatList)}>
        <div className='flex-1 flex flex-col justify-center items-center gap-6 px-4'>
          <BackGroundSVG
            svg={SVG_CHAT_EMPTY_STATE}
            width='240'
            height='240'
            className='md:w-1/4 w-[160px]'
          />
          <p className='text-textColor md:w-1/4 break-words text-center'>
            It's quiet here. Why not break the silence? Start a conversation by typing your first
            message!
          </p>
        </div>
      </When>

      <When isTrue={!isObjectEmpty(patient)}>
        <div
          className={`w-full md:hidden flex-shrink-0 fixed bottom-0 left-0 right-0 flex items-center border-t bg-white z-20 ${
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
              <TextMessageContainer
                {...{
                  message,
                  onChangeMessageTyping,
                  handleKeyMessageFunctions,
                  chatSend,
                  messageSending,
                }}
              />
            </When>
            <When isTrue={hasValue(photos)}>
              <div className='flex w-full'>
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
          className={`w-full flex-shrink-0 md:inline-block hidden ${
            demoModeStatus ? 'pointer-events-none' : ''
          }`}
        >
          <div className='px-8 items-center flex gap-2 py-4 bg-white border-t'>
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
              <TextMessageContainer
                {...{
                  message,
                  onChangeMessageTyping,
                  handleKeyMessageFunctions,
                  chatSend,
                  messageSending,
                }}
              />
            </When>
            <When isTrue={hasValue(photos)}>
              <div className='flex w-full'>
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
