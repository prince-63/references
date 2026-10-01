import {useContext, useEffect} from 'react'
import {
  getImageUrl,
  getImageUrlById,
  getProfilePictureUrl,
  properDateTime,
  validateList,
} from '../../../../utils/ConstFunctions'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import {SVG_DROPDOWN_BIG} from '../../../../utils/SvgConstants'
import {AuthContext} from '../../../../context/AuthContext'
import {useParams} from 'react-router'
import {Image} from '../../../../assets/images/Images/Image'
import When from '../../../../components/when/When'
import hasValue from '../../../../utils/hasValue'
import userTypes from '../../../../@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
interface Props {
  onPatientChatClick: (userId: string) => void
  data: any
  totalUnreadMessagesCount: number
  chatListLoading: boolean
}
export const ChatSidebar = (props: Props) => {
  const {onPatientChatClick, data, totalUnreadMessagesCount, chatListLoading} = props
  const {demoModeStatus} = useContext(AuthContext)
  const {id: patientUserId}: any = useParams()
  const {dispatchAction} = useDispatchAction()

  useEffect(() => {
    dispatchAction(setIsBottomBarOpen(true))
  }, [])

  return (
    <Spin indicator={<Spinner loading />} spinning={chatListLoading}>
      <div className='md:w-[350px] lg:w-[350px] w-full pb-[140px]'>
        <div className='w-full justify-start items-center gap-2.5 inline-flex py-[19px] md:border-b '>
          <div className='justify-start items-center gap-1.5 flex'>
            <div className='text-black text-xl font-semibold leading-loose'>Messages</div>
            <CommonSVG svg={SVG_DROPDOWN_BIG} width='16' height='16' />
          </div>
          <div className='px-2.5 py-2 bg-primarySupport rounded-3xl flex-col justify-start items-start gap-2.5 inline-flex'>
            <div className='text-black text-xs font-semibold leading-none'>
              {totalUnreadMessagesCount}
            </div>
          </div>
        </div>

        <aside className='md:h-[calc(100vh-5rem)] md:border-r overflow-y-auto'>
          {validateList(data) &&
            data.map((chat: any, index: number) => (
              <div
                onClick={() => onPatientChatClick(chat.user_id)}
                className={`w-full min-h-16 px-4 justify-start items-center gap-2 flex
           ${patientUserId == chat.user_id ? 'bg-primarySupport' : ''} cursor-pointer`}
                key={index}
              >
                {(() => {
                  const profile_url = chat.profile_image_id
                    ? getImageUrlById(chat.profile_image_id)
                    : chat.profile_image

                  const rawSrc = getProfilePictureUrl(demoModeStatus, profile_url)
                  const resolvedSrc =
                    getImageUrl({
                      url: rawSrc,
                      is_gdrive_platform:
                        typeof rawSrc === 'string' && rawSrc.includes('patient/drive/image/'),
                      drive_file_id:
                        typeof rawSrc === 'string'
                          ? rawSrc.match(/patient\/drive\/image\/([^/?#]+)/)?.[1]
                          : (rawSrc as any)?.drive_file_id,
                    }) || rawSrc

                  return (
                    <Image
                      className='min-w-12 h-12 object-cover relative rounded-3xl'
                      src={resolvedSrc}
                    />
                  )
                })()}

                <div className='w-full'>
                  <div className='w-full flex justify-between items-center'>
                    <div className='flex gap-2 items-center'>
                      <div className='text-black text-base font-semibold'>{chat.full_name}</div>
                      <div>
                        {chat.unread_message != 0 && (
                          <div className='w-4 h-4 bg-primaryColor rounded-full text-white font-medium text-xs flex items-center justify-center'>
                            {chat.unread_message}
                          </div>
                        )}
                      </div>
                    </div>
                    {chat.created_date !== null && (
                      <div className='w-[30%] opacity-30 text-black text-xs font-semibold text-end'>
                        {properDateTime(chat.created_date)}
                      </div>
                    )}
                  </div>
                  <When isTrue={hasValue(chat.message)}>
                    <div
                      className={`${
                        chat.unread_message != 0 ? 'text-black font-semibold' : 'text-textColor'
                      } text-opacity-80 text-xs font-medium`}
                    >
                      {chat.message &&
                        chat.message.slice(0, 30) + `${chat.message.length > 30 ? '...' : ''}`}
                    </div>
                  </When>
                  <When isTrue={hasValue(chat.image_name) && hasValue(chat.image_name[0])}>
                    <div
                      className={`${
                        chat.unread_message != 0 ? 'text-black font-semibold' : 'text-textColor'
                      } text-opacity-80 text-xs font-medium`}
                    >
                      {chat.role_name?.toUpperCase() === userTypes.PATIENT
                        ? 'sent an attachment'
                        : 'attachment sent'}
                    </div>
                  </When>
                  <When isTrue={!hasValue(chat.message) && !hasValue(chat.image_name)}>
                    <div className='text-textColor text-opacity-80 text-xs font-medium'>
                      Tap to start a conversation
                    </div>
                  </When>
                </div>
              </div>
            ))}
        </aside>
      </div>
    </Spin>
  )
}
