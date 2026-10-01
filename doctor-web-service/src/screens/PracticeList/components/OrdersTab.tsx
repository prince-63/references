import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useOutletContext, useParams} from 'react-router-dom'
import {
  getCustomerOrderDetail,
  getVspMiniDashboard,
  VspMiniDashboardResponse,
} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import TableContainerForOrders from './TableContainerForOrders'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import {PracticeProfileOutletContext} from '../types/practiceProfile.types'
import VspOrdersTable from './VspOrdersTable'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getVspMiniDashboardPayload from '../helpers/getVspMiniDashboardPayload'

const OrdersTab = () => {
  const [pageNumber, setCurrentPageNumber] = useState(0)
  const {userId, profileId} = useContext(AuthContext)
  const {isVspPlanning} = useOutletContext<PracticeProfileOutletContext>()

  const {dispatchAction} = useDispatchAction()
  const {customerId} = useParams<{customerId: string}>()
  const {miniDashboardData} = useSelector((state: RootState) => state.profile)

  const handleOnSearch = async ({
    page = pageNumber,
    search = null,
  }: {
    updateLoadingState?: boolean
    page?: number
    search?: string | null
    sort?: {
      type: string
      sort: string
    }
  }) => {
    if (!userId) throw new Error('User ID not found')
    setCurrentPageNumber(page)
    dispatchAction(
      getCustomerOrderDetail({
        customer_profile_id: safeParseInt(customerId),
        sort_criteria: {type: 'date', sort: 'desc'},
        page: page,
        search,
      })
    )
  }

  useEffect(() => {
    if (isVspPlanning) return
    handleOnSearch({
      page: pageNumber,
    })
  }, [isVspPlanning])

  const handleVspOrderPageChange = (page: number) => {
    const parsedProfileId = safeParseInt(profileId)
    const parsedCustomerId = safeParseInt(customerId)
    if (!parsedProfileId || !parsedCustomerId) return

    dispatchAction(
      getVspMiniDashboard(
        getVspMiniDashboardPayload({
          profileId: parsedProfileId,
          customerProfileId: parsedCustomerId,
          currentData: (miniDashboardData as VspMiniDashboardResponse | null) ?? null,
          orderPageNo: page,
        })
      )
    )
  }

  if (isVspPlanning) {
    return <VspOrdersTable onPageChange={handleVspOrderPageChange} />
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex md:flex-row flex-col gap-3'>
        <PracticeSearchInput
          placeholder='Search'
          handleSearch={(value) => {
            handleOnSearch({
              search: value,
            })
          }}
        />
      </div>
      <div className='w-full overflow-x-scroll'>
        <TableContainerForOrders pageNumber={pageNumber} handleOnSearch={handleOnSearch} />
      </div>
    </div>
  )
}

export default OrdersTab
