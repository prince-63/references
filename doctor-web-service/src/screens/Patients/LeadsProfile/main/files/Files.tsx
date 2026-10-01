import {Outlet} from 'react-router-dom'
import FilesHeader from './components/FilesHeader'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {useContext, useState} from 'react'
import When from 'components/when/When'
import SubscriptionModuleUpgradedModal from 'components/subscription/modals/SubscriptionModuleUpgradedModal'
import useDispatchAction from '@hooks/useDispatchAction'
import {updateSubscriptionFlags} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CustomStlViewer from 'CustomStlViewer'

const Files = () => {
  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()
  const [showUpgradedPlanModal, setShowUpgradedPlanModal] = useState(false)

  const {isStlPreviewVisible} = useSelector((state: RootState) => state.leadsProfileFiles)

  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)

  return (
    <div>
      <FilesHeader />
      <When isTrue={!loadingSubscriptionData && showUpgradedPlanModal}>
        <SubscriptionModuleUpgradedModal
          {...{
            onClose: () => {
              dispatchAction(
                updateSubscriptionFlags({
                  doctor_id: safeParseInt(userId),
                  storage_update: false,
                })
              )
              setShowUpgradedPlanModal(false)
            },
            title: `Storage limit increased to ${subscriptionData?.total_storage_gb} GB successfully!`,
            subTitle:
              'Congratulations! your storage limit has increased. You can now add more files.',
            onClick: () => {
              dispatchAction(
                updateSubscriptionFlags({
                  doctor_id: safeParseInt(userId),
                  storage_update: false,
                })
              )
              setShowUpgradedPlanModal(false)
            },
          }}
        />
      </When>
      <When isTrue={isStlPreviewVisible}>
        <CustomStlViewer />
      </When>
      <Outlet />
    </div>
  )
}

export default Files
