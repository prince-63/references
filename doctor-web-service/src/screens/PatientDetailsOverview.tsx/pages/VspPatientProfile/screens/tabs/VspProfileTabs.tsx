import {useMemo} from 'react'
import {Tabs} from 'antd'
import {useNavigate, useLocation, useParams, Outlet, useSearchParams} from 'react-router-dom'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getVspTabs from './helpers/getVspTabs'
import StatusStepper from '../header/components/StatusStepper'

const {TabPane} = Tabs

const VspProfileTabs = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {patientId} = useParams()
  const {permissionChecks} = useFeatureAccess()
  const patientDetailsTabs = permissionChecks?.patientProfileActions
  const {active_order_id, selectedOrderId} = useSelector(
    (state: RootState) => state.customerPatientProfile
  )
  const child = useMemo(() => location.pathname.split('/')?.[3], [location])
  const activeTabKey = child ?? getVspTabs[0]?.path
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('order_id')

  const handleTabChange = (key: string) => {
    const orderId = selectedOrderId ?? active_order_id
    navigate(`/vsp-profile/${patientId}/${key}?${orderId ? 'order_id=' + orderId : ''}`)
  }

  return (
    <div className='h-full flex flex-col gap-4'>
      {active_order_id === orderIdFromUrl && <StatusStepper />}

      <div>
        <Tabs
          className='h-full flex flex-col details-tabs'
          activeKey={activeTabKey}
          onChange={handleTabChange}
          tabBarGutter={32}
          tabBarStyle={{
            background: '#fff',
            borderTop: '1px solid #e8e8e8',
          }}
        >
          {getVspTabs.map((route) => {
            if (patientDetailsTabs?.caseFiles?.isViewable === false && route.path === 'records') {
              return null
            }
            if (
              patientDetailsTabs?.prescriptions?.isViewable === false &&
              route.path === 'prescriptions-list'
            ) {
              return null
            }
            const Icon = route.icon
            return (
              <TabPane
                tab={
                  <span className='flex items-center gap-1'>
                    <Icon className='w-4 h-4' />
                    {route.label}
                  </span>
                }
                key={route.path}
                className='h-full'
                forceRender={false}
              >
                {activeTabKey === route.path && <Outlet />}
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

export default VspProfileTabs
