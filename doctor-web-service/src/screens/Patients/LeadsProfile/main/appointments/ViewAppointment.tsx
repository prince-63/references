import Page from 'components/page/Page'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {
  getFirstLetterCapitalOfWord,
  getImageUrl,
  identifyUser,
  safeParseInt,
} from 'utils/ConstFunctions'
import Tag from 'components/tags/Tag'
import JustifiedBetweenDetails from '../treatment/viewTreatmentPlan/components/JustifiedBetweenDetails'
import useDispatchAction from '@hooks/useDispatchAction'
import {Key, useContext, useState} from 'react'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import CalendarIcon from 'assets/icons/CalendarIcon'
import {convertYYYYMMDDTOddddDDMMMMYY} from './utils/DateConversion'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import {Image} from 'assets/images/Images/Image'
import jawType from '@constants/jawType'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import productTypes from '@constants/productTypes'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import dayjs from 'dayjs'
import {
  getBracesNotesDetails,
  postAttachBracesNotes,
  postDeleteAppointment,
  postUpdateAttachedBracesNotes,
  postUpdateFilesAppointment,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import {AppointmentListData, AppointmentPostData} from './types/appointments.types'
import isPlanExpired from '@utils/isPlanExpired'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import UpgradePlanModal from 'components/subscription/modals/UpgradePlanModal'
import {Button, Popover} from 'antd'
import ColorIcon from 'components/colorIcon/ColorIcon'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import calendarEventsConstants from '@constants/calendarEvents.constants'

const ViewAppointment = () => {
  const navigation = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const {userId, profileId, organizationId} = useContext(AuthContext)
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false)

  const {patientId, bracesJourneyId} = useParams()

  const {
    bracesNotesDetails: appointmentDetails,
    getBracesNotesDetailsLoading,
    bracesNotesList,
    postAddAppointmentLoading,
    postUpdateAppointmentLoading,
  } = useSelector((state: RootState) => state.bracesNotes)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const isNew = searchParams.get('new') === 'true'
  const isEditAppointment = searchParams.get('isEditAppointment') === 'true'
  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()

  const appointmentId = searchParams.get('appointmentId')
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})

  const [openActionsPopover, setOpenActionsPopover] = useState(false)

  const callCreateAppointment = (appointmentStatus: string, isNewStatus: boolean = isNew) => {
    if (
      (isPlanExpired(subscriptionData) || subscriptionAlerts.patients.error) &&
      appointmentStatus !== treatmentPlanStatusConstants.DRAFT
    ) {
      setIsUpgradeModalOpen(true)
      return
    }
    const appointmentSaveDetails: AppointmentPostData = {
      braces_journey_id: appointmentDetails.braces_journey_id,
      amount: appointmentDetails.amount,
      status: appointmentStatus,
      doctor_id: appointmentDetails.doctor_id,
      patient_id: appointmentDetails.patient_id,
      start_date: appointmentDetails.start_date,
      end_date: appointmentDetails.end_date,
      reminder_id: appointmentDetails.reminder_id,
      product_type_name: appointmentDetails.product_type_name,
      jaw_details:
        appointmentDetails.jaw_main_type === appointmentJawTypes.BOTH
          ? [
              {
                jaw_type: jawType.BOTH,
                treatment_stage_type: appointmentDetails.both.treatment_stage_type,
                shape: appointmentDetails.both.shape,
                material_name: appointmentDetails.both.material_name,
                material_size: appointmentDetails.both.material_size,
                space_enclosure_tools: appointmentDetails.both.space_enclosure_tools,
                accessories: appointmentDetails.both.accessories,
                note: appointmentDetails.both.note,
              },
            ]
          : [
              {
                jaw_type: jawType.UPPER,
                treatment_stage_type: appointmentDetails.upper.treatment_stage_type,
                shape: appointmentDetails.upper.shape,
                material_name: appointmentDetails.upper.material_name,
                material_size: appointmentDetails.upper.material_size,
                space_enclosure_tools: appointmentDetails.upper.space_enclosure_tools,
                accessories: appointmentDetails.upper.accessories,
                note: appointmentDetails.upper.note,
              },
              {
                jaw_type: jawType.LOWER,
                treatment_stage_type: appointmentDetails.lower.treatment_stage_type,
                shape: appointmentDetails.lower.shape,
                material_name: appointmentDetails.lower.material_name,
                material_size: appointmentDetails.lower.material_size,
                space_enclosure_tools: appointmentDetails.lower.space_enclosure_tools,
                accessories: appointmentDetails.lower.accessories,
                note: appointmentDetails.lower.note,
              },
            ],
      files: appointmentDetails.files,
    }

    const appointmentUpdateDetails: AppointmentPostData = {
      appointment_id: safeParseInt(appointmentId),
      braces_journey_id: appointmentDetails.braces_journey_id,
      amount: appointmentDetails.amount,
      status: appointmentStatus,
      doctor_id: appointmentDetails.doctor_id,
      patient_id: appointmentDetails.patient_id,
      start_date: appointmentDetails.start_date,
      end_date: appointmentDetails.end_date,
      reminder_id: appointmentDetails.reminder_id,
      product_type_name: appointmentDetails.product_type_name,
      jaw_details:
        appointmentDetails.jaw_main_type === appointmentJawTypes.BOTH
          ? [
              {
                jaw_type: jawType.BOTH,
                treatment_stage_type: appointmentDetails.both.treatment_stage_type,
                shape: appointmentDetails.both.shape,
                material_name: appointmentDetails.both.material_name,
                material_size: appointmentDetails.both.material_size,
                space_enclosure_tools: appointmentDetails.both.space_enclosure_tools,
                accessories: appointmentDetails.both.accessories,
                note: appointmentDetails.both.note,
              },
            ]
          : [
              {
                jaw_type: jawType.UPPER,
                treatment_stage_type: appointmentDetails.upper.treatment_stage_type,
                shape: appointmentDetails.upper.shape,
                material_name: appointmentDetails.upper.material_name,
                material_size: appointmentDetails.upper.material_size,
                space_enclosure_tools: appointmentDetails.upper.space_enclosure_tools,
                accessories: appointmentDetails.upper.accessories,
                note: appointmentDetails.upper.note,
              },
              {
                jaw_type: jawType.LOWER,
                treatment_stage_type: appointmentDetails.lower.treatment_stage_type,
                shape: appointmentDetails.lower.shape,
                material_name: appointmentDetails.lower.material_name,
                material_size: appointmentDetails.lower.material_size,
                space_enclosure_tools: appointmentDetails.lower.space_enclosure_tools,
                accessories: appointmentDetails.lower.accessories,
                note: appointmentDetails.lower.note,
              },
            ],
      files: appointmentDetails.files,
    }

    dispatchAction(
      isNewStatus
        ? postAttachBracesNotes(appointmentSaveDetails)
        : postUpdateAttachedBracesNotes(appointmentUpdateDetails)
    )
      .unwrap()
      .then(() => {
        if (!appointmentId) {
          SuccessToast('Appointment created successfully')
        } else {
          if (appointmentDetails.new_files && appointmentDetails?.new_files?.length > 0) {
            dispatchAction(
              postUpdateFilesAppointment({
                appointment_id: safeParseInt(appointmentId),
                doctor_id: safeParseInt(userId),
                files: appointmentDetails.new_files ? appointmentDetails.new_files : [],
              })
            )
          }

          SuccessToast('Appointment updated successfully')
        }
        navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
      })
      .catch((error: any) => {
        if (error === 'AP003') {
          const selectedAppointmentItem: AppointmentListData[] = bracesNotesList.filter(
            (item) => dayjs(item.current_appointment_date) === dayjs(appointmentDetails.start_date)
          )
          if (selectedAppointmentItem.length != 0) {
            viewAppointment(selectedAppointmentItem[0].appointment_id)
          }
        }
      })
  }

  const viewAppointment = (appointment_id: number) => {
    dispatchAction(
      getBracesNotesDetails({
        appointment_id: appointment_id.toString() ?? '',
      })
    )
      .unwrap()
      .then((res: any) => {
        const emptyJawTypes = {
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

        const createJawDetails = (jaw: {
          note: string
          jaw_type: string
          treatment_stage_type: string
          shape: string
          material_name: string
          material_size: string
          space_enclosure_tools: string
          accessories: string
        }) => ({
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

        const bothJawsDetails = bothJaw ? createJawDetails(bothJaw) : emptyJawTypes
        const upperJawsDetails = upperJaw ? createJawDetails(upperJaw) : emptyJawTypes
        const lowerJawsDetails = lowerJaw ? createJawDetails(lowerJaw) : emptyJawTypes

        const getAppointmentDetailsData = {
          braces_journey_id: safeParseInt(bracesJourneyId),
          amount: 0,
          status: res.status,
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
          reminder_id: safeParseInt(res.reminder_details?.reminder_id),
          start_date: res?.current_appointment_date,
          end_date: res?.end_date,
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

        const queryParams = new URLSearchParams({
          appointmentId: String(appointmentId),
        }).toString()

        navigation(
          `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`
        )
      })
      .catch(() => {})
  }

  const callGoToEditAppointment = () => {
    identifyUser()

    const queryParams = new URLSearchParams({
      appointmentId: String(appointmentId),
    }).toString()

    navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`)
  }

  const onHandleBack = () => {
    if (isNew) {
      return `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes`
    } else if (appointmentDetails?.status === treatmentPlanStatusConstants.DRAFT) {
      const queryParams = new URLSearchParams({
        appointmentId: String(appointmentId),
      }).toString()
      return `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`
    } else {
      return `/profile/${patientId}/bracesNotes/${bracesJourneyId}`
    }
  }

  const actionsPopoverContent = (
    <div className='flex flex-col min-w-[120px]'>
      <button
        type='button'
        className='text-sm text-black text-left px-3 py-2 hover:bg-primarySupport rounded'
        onClick={() => {
          setOpenActionsPopover(false)
          callGoToEditAppointment()
        }}
      >
        Edit
      </button>
      <button
        type='button'
        className='text-sm text-red text-left px-3 py-2 hover:bg-primarySupport rounded'
        onClick={() => {
          setOpenActionsPopover(false)
          setDeleteEventModalVisible(true)
        }}
      >
        Delete
      </button>
    </div>
  )

  const pageTitleText =
    isNew || appointmentDetails?.status === treatmentPlanStatusConstants.DRAFT
      ? 'Review Appointment'
      : 'Appointment Notes'

  const pageTitle = (
    <div className='flex items-center justify-between w-full'>
      <span>{pageTitleText}</span>
      <When isTrue={hasValue(appointmentId)}>
        <div className='absolute right-4 rotate-90'>
          <Popover
            content={actionsPopoverContent}
            overlayInnerStyle={{padding: '4px', fontFamily: 'figtree'}}
            placement='bottomRight'
            open={openActionsPopover}
            trigger={['click']}
            onOpenChange={(open) => setOpenActionsPopover(open)}
          >
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
              }}
              className='flex gap-[1.78px] px-2 py-1'
            >
              <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
              <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
              <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
            </button>
          </Popover>
        </div>
      </When>
    </div>
  )

  return (
    <Page
      title={pageTitle}
      showBorder
      showBackButton
      loading={loadingSubscriptionData}
      backNavigationRoute={onHandleBack()}
    >
      <DeleteEvent
        visible={deleteEventModalVisible}
        setDeleteModalVisible={setDeleteEventModalVisible}
        eventType={calendarEventsConstants.APPOINTMENT}
        onOkClick={() => {
          if (!appointmentId) return
          dispatchAction(
            postDeleteAppointment({
              appointment_id: safeParseInt(appointmentId),
              doctor_id: safeParseInt(userId),
              profile_id: safeParseInt(profileId),
              organization_id: safeParseInt(organizationId),
            })
          )
            .unwrap()
            .then(() => {
              SuccessToast('Appointment deleted successfully!')
              navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
            })

          // For now just close the modal
          setDeleteEventModalVisible(false)
        }}
      />

      <When isTrue={isUpgradeModalOpen}>
        <UpgradePlanModal
          title='You’ve reached your patient limit'
          subTitle='To add more patients, please contact us to top up your limit.'
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      </When>
      <When isTrue={isShowPhotos}>
        <ImageViewer
          setIsShowPhotos={setIsShowPhotos}
          selectedImagesList={appointmentDetails?.files?.map((file, index) => ({
            id: index,
            src:
              typeof file === 'object' && file instanceof File
                ? URL.createObjectURL(file)
                : getImageUrl(file) || (file as {preview?: string})?.preview || '',
            width: '100%',
            height: '100%',
          }))}
          selectedIndex={selectedIndex}
        />
      </When>
      {!getBracesNotesDetailsLoading && hasValue(appointmentDetails) && (
        <form className='mt-6'>
          <div className='flex flex-row items-center rounded-lg w-full h-24 border border-mediumGray gap-2'>
            <div className='w-3 h-24 bg-indigo-500 rounded-tl-lg rounded-bl-lg' />
            <div className='px-2 py-2 gap-2'>
              <div className='text-stone-500 text-base font-medium leading-normal'>
                Appointment details
              </div>
              <div className='justify-start items-center gap-3 inline-flex mt-2'>
                <div className='w-10 h-10 bg-primaryColor rounded-3xl justify-center items-center inline-flex pl-1.5 pt-1.5'>
                  <CalendarIcon height='24' width='24' color='white' />
                </div>

                <div className='text-black/opacity-20 text-base font-semibold leading-normal'>
                  {convertYYYYMMDDTOddddDDMMMMYY(appointmentDetails?.start_date)}
                </div>
              </div>
            </div>
          </div>

          <When isTrue={appointmentDetails.jaw_main_type === appointmentJawTypes.BOTH}>
            {/* Both Jaw */}
            <div>
              <div className='my-4'>
                <BorderedCard>
                  <div className='flex flex-col'>
                    <div className='text-stone-500 text-lg font-semibold'>Both jaw</div>
                    <div className='w-full h-7 text-black text-xl font-semibold leading-7 mt-3'>
                      Notes
                    </div>
                    <div className='w-full mt-3 text-stone-500 text-base font-normal leading-normal'>
                      {hasValue(appointmentDetails?.both?.note)
                        ? appointmentDetails?.both?.note
                        : 'No notes added'}
                    </div>
                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Treatment details
                    </div>
                    <div className='flex flex-row justify-end md:mr-20'>
                      <div className='flex-1 flex-row mt-3 '>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Treatment stage',
                            value: appointmentDetails?.both?.treatment_stage_type && (
                              <Tag
                                value={appointmentDetails?.both?.treatment_stage_type}
                                className='text-sm bg-secondarySupport text-secondaryColor'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='flex-1 flex-row mt-3 gap-4' />
                    </div>
                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Material details
                    </div>
                    <div className='flex flex-col md:flex-row justify-between md:gap-20 gap-3'>
                      <div className='flex-1 flex-col gap-4 mt-4'>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Shape',
                            value: appointmentDetails?.both?.shape && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(appointmentDetails?.both?.shape)}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                        <div className='my-4'>
                          <JustifiedBetweenDetails
                            {...{
                              label: 'Material',
                              value: appointmentDetails?.both?.material_name && (
                                <Tag
                                  value={appointmentDetails?.both?.material_name}
                                  className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                                />
                              ),
                            }}
                          />
                        </div>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Size',
                            value: appointmentDetails?.both?.material_size && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.both?.material_size
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='w-full border border-lightGray mx-1 md:hidden block' />
                      <div className='flex-1 flex-col gap-4 md:mt-4'>
                        <div className='flex flex-col md:flex-row gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Space closure tool
                          </div>
                          <div className='flex flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.both?.space_enclosure_tools.length > 0 ? (
                              appointmentDetails?.both?.space_enclosure_tools.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex flex-col md:flex-row md:my-4 gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Accessories
                          </div>
                          <div className='flex flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.both?.accessories.length > 0 ? (
                              appointmentDetails?.both?.accessories.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </BorderedCard>
              </div>
            </div>
          </When>

          <When isTrue={appointmentDetails?.jaw_main_type === appointmentJawTypes.SEPARATE}>
            {/* Upper Jaw */}
            <div>
              <div className='my-4'>
                <BorderedCard>
                  <div className='flex flex-col'>
                    <div className='text-stone-500 text-lg font-semibold'>Upper jaw</div>
                    <div className='w-full h-7 text-black text-xl font-semibold leading-7 mt-3'>
                      Notes
                    </div>
                    <div className='w-full mt-3 text-stone-500 text-base font-normal leading-normal'>
                      {hasValue(appointmentDetails?.upper?.note)
                        ? appointmentDetails?.upper?.note
                        : 'No notes added'}
                    </div>
                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Treatment details
                    </div>

                    <div className='flex flex-row justify-end md:mr-20'>
                      <div className='flex-1 flex-row mt-3'>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Treatment stage',
                            value: appointmentDetails?.upper?.treatment_stage_type && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.upper?.treatment_stage_type
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='flex-1 flex-row mt-3 gap-4' />
                    </div>

                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Material details
                    </div>
                    <div className='flex flex-col md:flex-row justify-between md:gap-20 gap-3'>
                      <div className='flex-1 flex-col gap-4 mt-4'>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Shape',
                            value: appointmentDetails?.upper?.shape && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.upper?.shape
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                        <div className='my-4'>
                          <JustifiedBetweenDetails
                            {...{
                              label: 'Material',
                              value: appointmentDetails?.upper?.material_name && (
                                <Tag
                                  value={appointmentDetails?.upper?.material_name}
                                  className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                                />
                              ),
                            }}
                          />
                        </div>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Size',
                            value: appointmentDetails?.upper?.material_size && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.upper?.material_size
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='w-full border border-lightGray  mx-1 md:hidden block' />
                      <div className='flex-1 flex-col gap-4 md:mt-4'>
                        <div className='flex flex-col md:flex-row gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Space closure tool
                          </div>
                          <div className='flex flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.upper?.space_enclosure_tools.length > 0 ? (
                              appointmentDetails?.upper?.space_enclosure_tools.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex flex-col md:flex-row md:my-4 gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Accessories
                          </div>
                          <div className='flex flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.upper?.accessories.length > 0 ? (
                              appointmentDetails?.upper?.accessories.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </BorderedCard>
              </div>
            </div>

            {/* Lower Jaw */}
            <div>
              <div className='my-4'>
                <BorderedCard>
                  <div className='flex flex-col'>
                    <div className='text-stone-500 text-lg font-semibold'>Lower jaw</div>
                    <div className='w-full h-7 text-black text-xl font-semibold leading-7 mt-3'>
                      Notes
                    </div>
                    <div className='w-full mt-3 text-stone-500 text-base font-normal leading-normal'>
                      {hasValue(appointmentDetails?.lower?.note)
                        ? appointmentDetails?.lower?.note
                        : 'No notes added'}
                    </div>
                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Treatment details
                    </div>
                    <div className='flex flex-row justify-end md:mr-20'>
                      <div className='flex-1 flex-row mt-3'>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Treatment stage',
                            value: appointmentDetails?.lower?.treatment_stage_type && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.lower?.treatment_stage_type
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='flex-1 flex-row mt-3 gap-4' />
                    </div>
                    <div className='w-full border border-lightGray my-3 mx-1' />
                    <div className='w-full text-black text-xl font-semibold leading-7'>
                      Material details
                    </div>
                    <div className='flex flex-col md:flex-row justify-between md:gap-20 gap-3'>
                      <div className='flex-1 flex-col gap-4 mt-4'>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Shape',
                            value: appointmentDetails?.lower?.shape && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(appointmentDetails?.lower.shape)}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                        <div className='my-4'>
                          <JustifiedBetweenDetails
                            {...{
                              label: 'Material',
                              value: appointmentDetails?.lower?.material_name && (
                                <Tag
                                  value={appointmentDetails?.lower?.material_name}
                                  className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                                />
                              ),
                            }}
                          />
                        </div>
                        <JustifiedBetweenDetails
                          {...{
                            label: 'Size',
                            value: appointmentDetails?.lower?.material_size && (
                              <Tag
                                value={getFirstLetterCapitalOfWord(
                                  appointmentDetails?.lower?.material_size
                                )}
                                className='text-sm bg-secondarySupport text-secondaryColor w-fit'
                              />
                            ),
                          }}
                        />
                      </div>
                      <div className='w-full border border-lightGray  mx-1 md:hidden block' />
                      <div className='flex-1 flex-col gap-4 md:mt-4'>
                        <div className='flex flex-col md:flex-row gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Space closure tool
                          </div>
                          <div className='flex md:flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.lower?.space_enclosure_tools.length > 0 ? (
                              appointmentDetails?.lower?.space_enclosure_tools.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex flex-col md:flex-row md:my-4 gap-3 md:gap-0'>
                          <div className='w-40 text-gray-600 text-base font-medium leading-normal flex-shrink-0'>
                            Accessories
                          </div>
                          <div className='flex flex-row justify-start flex-wrap items-center flex-grow'>
                            {appointmentDetails?.lower?.accessories.length > 0 ? (
                              appointmentDetails?.lower?.accessories.map(
                                (tool: string, index: Key | null | undefined) => (
                                  <Tag
                                    key={index}
                                    value={getFirstLetterCapitalOfWord(tool)}
                                    className='text-sm bg-secondarySupport text-secondaryColor mb-2 mx-1'
                                  />
                                )
                              )
                            ) : (
                              <div className='w-full text-textColor text-base font-medium leading-normal'>
                                Not Added
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </BorderedCard>
              </div>
            </div>
          </When>

          {/* Photos */}
          <div className='my-4'>
            <BorderedCard
              header={{
                title: 'Photos',
              }}
            >
              <When
                isTrue={
                  appointmentDetails?.local_files && appointmentDetails?.local_files?.length > 0
                }
              >
                <div className='flex flex-wrap gap-2'>
                  {appointmentDetails?.local_files?.map((file: any, index) => (
                    <div key={index} className='md:w-[7%] gap-2'>
                      <Image
                        src={getImageUrl(file)}
                        alt='Uploaded file '
                        className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer mt-2'
                        onClick={() => {
                          setIsShowPhotos(true)
                          setSelectedIndex(index)
                        }}
                        size={20}
                        fileName={''}
                        showFileName={false}
                        showLoading={true}
                      />
                    </div>
                  ))}
                </div>
              </When>
              <When
                isTrue={
                  appointmentDetails?.local_files && appointmentDetails?.local_files?.length == 0
                }
              >
                <When isTrue={appointmentDetails?.files.length === 0}>
                  <div className='w-full text-stone-500 text-base font-medium leading-normal'>
                    Not Added
                  </div>
                </When>
              </When>
              <When
                isTrue={
                  hasValue(appointmentId) &&
                  appointmentDetails.status === treatmentPlanStatusConstants.ACTIVE
                }
              >
                <When isTrue={appointmentDetails?.files?.length > 0}>
                  <div className='flex flex-wrap gap-2'>
                    {appointmentDetails?.files?.map((file: any, index) => (
                      <div key={index} className='md:w-[7%] gap-2'>
                        <Image
                          src={getImageUrl(file)}
                          alt='Uploaded file '
                          className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer mt-2'
                          onClick={() => {
                            setIsShowPhotos(true)
                            setSelectedIndex(index)
                          }}
                          size={20}
                          fileName={''}
                          showFileName={false}
                          showLoading={true}
                        />
                      </div>
                    ))}
                  </div>
                </When>
                <When isTrue={appointmentDetails?.files.length == 0}>
                  <div className='w-64 text-stone-500 text-base font-medium leading-normal'>
                    Not Added
                  </div>
                </When>
              </When>
              <When
                isTrue={
                  hasValue(appointmentId) &&
                  appointmentDetails.status === treatmentPlanStatusConstants.DRAFT
                }
              >
                <When isTrue={appointmentDetails?.draft_files?.length > 0}>
                  <div className='flex flex-wrap gap-2'>
                    {appointmentDetails?.draft_files?.map((file: any, index) => (
                      <div key={index} className='w-[7%] gap-2'>
                        <Image
                          src={getImageUrl(file)}
                          alt='Uploaded file '
                          className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer mt-2'
                          onClick={() => {
                            setIsShowPhotos(true)
                            setSelectedIndex(index)
                          }}
                          size={20}
                          fileName={''}
                          showFileName={false}
                          showLoading={true}
                        />
                      </div>
                    ))}
                  </div>
                </When>
                <When isTrue={appointmentDetails?.draft_files?.length == 0}>
                  <div className='w-64 text-stone-500 text-base font-medium leading-normal'>
                    Not Added
                  </div>
                </When>
              </When>
            </BorderedCard>
          </div>

          <div className='flex flex-col-reverse md:flex-row gap-4  my-4 justify-end'>
            <When isTrue={appointmentDetails?.status === treatmentPlanStatusConstants.DRAFT}>
              <Button
                className='h-11 rounded-lg p-3 cursor-pointer bg-white border !border-primaryColor text-primaryColor hover:!bg-white hover:!text-primaryColor'
                loading={isNew ? postAddAppointmentLoading : postUpdateAppointmentLoading}
                onClick={() => {
                  identifyUser()
                  callCreateAppointment(treatmentPlanStatusConstants.DRAFT)
                }}
              >
                Save as draft
              </Button>
            </When>
            <When
              isTrue={
                isEditAppointment &&
                dayjs().isAfter(dayjs(appointmentDetails.start_date).startOf('day'))
              }
            >
              <Button
                className='h-11 bg-primaryColor rounded-lg p-3 !text-white'
                loading={isNew ? postAddAppointmentLoading : postUpdateAppointmentLoading}
                onClick={() => {
                  identifyUser()
                  callCreateAppointment(treatmentPlanStatusConstants.ACTIVE, isNew ? true : false)
                }}
              >
                {isNew
                  ? 'Create Appointment'
                  : appointmentDetails?.status === treatmentPlanStatusConstants.DRAFT
                    ? 'Create Appointment'
                    : 'Save Appointment'}
              </Button>
            </When>
          </div>
        </form>
      )}
    </Page>
  )
}

export default ViewAppointment
