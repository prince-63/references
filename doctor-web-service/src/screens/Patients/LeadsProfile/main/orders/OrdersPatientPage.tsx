import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {getAlignerOrderDetailsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import TableContainerForAlignerOrders from 'screens/Orders/components/TableContainerForAlignerOrders'
import useAllUserPlan from '@hooks/useAllUserPlan'

const OrdersPatientPage = () => {
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {loadingOrderList} = useSelector((state: RootState) => state.orders)
  const {isOrganization, isDesignLabUser, isPractice, isCustomer, isVendor} = useAllUserPlan()
  useEffect(() => {
    handleOnSearch({page: pageNumber})
  }, [pageNumber])

  const handleOnSearch = async ({page = 1}: {page?: number}) => {
    if (!userId && !patientId) throw new Error('User ID not found')
    setCurrentPageNumber(page)
    dispatchAction(
      getAlignerOrderDetailsList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        is_org_admin: isOrganization || isDesignLabUser || isVendor,
        page_number: page - 1,
        sort_criteria: {
          type: 'date',
          sort: 'desc',
        },
        order_flow: isCustomer || isPractice ? 'SENT' : 'RECEIVED',
      })
    )
  }

  return (
    <Page title='Orders' showBorder loading={loadingOrderList}>
      <div className='w-full overflow-x-scroll'>
        <TableContainerForAlignerOrders
          pageNumber={pageNumber}
          patientProfile={true}
          handleOnSearch={handleOnSearch}
        />
      </div>
    </Page>
  )
}

export default OrdersPatientPage
