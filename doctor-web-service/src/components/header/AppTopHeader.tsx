import {IMAGE_APP_LOGO} from '../../utils/ImageConst'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {Image} from 'assets/images/Images/Image'
import {useContext, useState} from 'react'
import NotificationsIcon from 'assets/icons/NotificationsIcon'
import {RootState} from 'redux/store'
import clsx from 'clsx'
import cn from '@utils/cn'
import {Popover} from 'antd'
import ProfileDropDown from 'components/menu/ProfileDropDown'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import AddProfile from 'components/menu/AddProfile'
import getActiveProfile from '@utils/getActiveProfile'
import {AuthContext} from 'context/AuthContext'
import {getImageUrlById, safeParseInt} from 'utils/ConstFunctions'

function AppTopHeader() {
  const navigation = useNavigate()
  const {countsData} = useSelector((state: RootState) => state.DoctorDashboard)
  const [openCollapsed, setOpenCollapsed] = useState(false)
  const [openAddProfile, setOpenAddProfile] = useState(false)
  const {profileId} = useContext(AuthContext)
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const activeProfile = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  return (
    <header>
      <AddProfile openAddProfile={openAddProfile} setOpenAddProfile={setOpenAddProfile} />
      <nav className='md:hidden flex px-4 pt-4 md:pb-4 items-center justify-between'>
        <div
          className='mt-2'
          onClick={() => {
            navigation('/')
          }}
        >
          <img className='w-[124px] self-center ' src={IMAGE_APP_LOGO} alt='app logo' />
        </div>
        <div className='flex justify-center items-center gap-3 mt-3'>
          <div>
            {countsData?.unread_notification_count !== 0 && (
              <div className={clsx('absolute top-6 ml-7 w-3 h-3 bg-red rounded-full ')}>. </div>
            )}
            <div
              className='w-10 h-10 rounded-full flex justify-center items-center border border-mediumGray'
              onClick={() => navigation('/notifications')}
            >
              <NotificationsIcon height='22' width='22' color={'#666666'} />
            </div>
          </div>

          <Popover
            content={<ProfileDropDown {...{setOpenCollapsed, setOpenAddProfile}} />}
            trigger={['click']}
            open={openCollapsed}
            overlayInnerStyle={{
              padding: '0px',
              fontFamily: 'figtree',
            }}
            style={{fontFamily: 'figtree'}}
            placement={'topRight'}
            onOpenChange={(open) => setOpenCollapsed(open)}
          >
            <div
              className={cn(
                'rounded-lg flex border border-mediumGray p-2 justify-between cursor-pointer',
                openCollapsed && 'shadow border-primaryColor'
              )}
            >
              <div className={cn('flex gap-3')}>
                {activeProfile?.profile_picture || activeProfile?.profile_picture_id ? (
                  <Image
                    className='w-10 h-10 rounded-[4px] object-cover cursor-pointer bg-transparent'
                    src={
                      activeProfile?.profile_picture_id
                        ? getImageUrlById(activeProfile?.profile_picture_id)
                        : (activeProfile?.profile_picture ?? '')
                    }
                    alt='profile photo'
                  />
                ) : (
                  <PatientProfileInitials
                    {...{
                      name: activeProfile?.first_name ?? '',
                      className: cn(
                        'min-w-10 min-h-10 rounded-[4px]',
                        openCollapsed && 'bg-primarySupport text-primaryColor'
                      ),
                    }}
                  />
                )}
              </div>
            </div>
          </Popover>
        </div>
      </nav>
    </header>
  )
}

export default AppTopHeader
