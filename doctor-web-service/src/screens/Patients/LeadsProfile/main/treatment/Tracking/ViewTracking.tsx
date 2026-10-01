import AntdButton from 'components/atom/Buttons/AntdButton'
import {useContext, useEffect, useState} from 'react'
import TrackingMethodCard from './components/TrackingMethodCard'
import Page from 'components/page/Page'
import trackingTypes from '@constants/trackingTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {getTrackingDetails} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CrownIcon from 'assets/icons/CrownIcon'
import When from 'components/when/When'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import ModalUpgradeConfirm from 'components/modal/LeadsProfile/Tracking/ModalUpgradeConfirm'

const ViewTracking = () => {
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const profileBasePath = useProfileBasePath()
  const [isModalUpgradeOpen, setIsModalUpgradeOpen] = useState(false)

  const {dataGetTrackingDetails, loadingGetTrackingDetails} = useSelector(
    (state: RootState) => state.tracking
  )

  useEffect(() => {
    dispatchAction(
      getTrackingDetails({
        patient_id: String(patientId),
        doctor_id: safeParseInt(userId),
        treatment_subtype: treatmentTypeMain.ALIGNERS,
      })
    )
  }, [])

  return (
    <Page
      title='Tracking'
      backNavigationRoute={`${profileBasePath}/${patientId}/plans-list`}
      showBorder={false}
      showBackButton={true}
      loading={loadingGetTrackingDetails}
    >
      {isModalUpgradeOpen && <ModalUpgradeConfirm setIsModalUpgradeOpen={setIsModalUpgradeOpen} />}
      <div className='w-full flex flex-col'>
        {/*<----------------------------------------- Button displayed according to the type of tracking------------------------- */}
        <When isTrue={dataGetTrackingDetails?.tracking_type === trackingTypes?.MANUAL}>
          <AntdButton
            icon={<CrownIcon />}
            text={'Upgrade'}
            className='!w-full !bg-orangeSupport hover:!bg-orangeSupport text-orange hover:!text-orange font-semibold !h-12'
            onClick={() => setIsModalUpgradeOpen(true)}
          />
        </When>
        <When isTrue={dataGetTrackingDetails?.tracking_type === trackingTypes.PATIENTAPP}>
          <AntdButton
            icon={<CrownIcon color='#666666' />}
            text={'Upgrade'}
            className='!w-full !bg-mediumGray hover:!bg-mediumGray text-textColor hover:!text-textColor font-semibold !h-12'
          />
        </When>
        {/*<----------------------------------------- End of button ------------------------- */}

        {/*<----------------------------------------- First Card for selected tracking method------------------------- */}
        <Page title='' loading={loadingGetTrackingDetails}>
          <div className='md:mt-[32px] mt-4'>
            <TrackingMethodCard trackingDetails={dataGetTrackingDetails} isSelectedMethod={true} />
          </div>
        </Page>
        {/*<----------------------------------------- End of first card---------------------------------- */}

        {/*<----------------------------------------- Other tracking method card------------------------- */}
        <div className='text-textColor text-[16px] font-semibold mt-[32px] mb-[10px]'>
          Other tracking methods
        </div>
        <Page title='' loading={loadingGetTrackingDetails}>
          <TrackingMethodCard trackingDetails={dataGetTrackingDetails} isSelectedMethod={false} />
        </Page>
        {/*<----------------------------------------- End of Other tracking method card------------------------- */}
      </div>
    </Page>
  )
}

export default ViewTracking
