import {ConfigProvider} from 'antd'
import {useState} from 'react'
import OrderDetails from './OrderDetails'
import ExpandIcon from 'components/atom/SVG/ExpandIcon'
import When from 'components/when/When'
import userOrderDetails from '../hooks/userOrderDetails'
import hasValue from 'utils/hasValue'
import PurchaseOrderCard from './PurchaseOrderCard'
import OrderDetailsMobile from './OrderDetailsMobile'

const OrderLeftPanel = () => {
  const [expanded, setExpanded] = useState(true)
  const {order} = userOrderDetails()

  return (
    <div className='min-w-[25%] '>
      <div className='md:flex hidden flex-col'>
        <OrderDetails></OrderDetails>
        <When isTrue={hasValue(order?.purchase_order_details)}>
          <PurchaseOrderCard />
        </When>
      </div>
      <>
        <div className='md:hidden mb--2'>
          <ConfigProvider
            theme={{
              components: {
                Collapse: {
                  contentBg: '#ffffff',
                  headerBg: '#ffffff',
                },
              },
              token: {
                fontSizeIcon: 16,
                fontFamily: 'figtree',
                colorBorder: '',
              },
            }}
          >
            <div className='md:hidden'>
              {/* Toggle Button */}
              <div
                className='flex items-center py-2 cursor-pointer'
                onClick={() => setExpanded(!expanded)}
              >
                <span className='text-sm font-medium'>{expanded ? 'View less' : 'View more'}</span>
                <span className='ml-1'>
                  <ExpandIcon isActive={expanded} />
                </span>
              </div>

              {expanded && (
                <div className='border border-mediumGray rounded-lg mt-2'>
                  <OrderDetailsMobile />
                  <When isTrue={hasValue(order?.purchase_order_details)}>
                    <PurchaseOrderCard />
                  </When>
                </div>
              )}
            </div>
          </ConfigProvider>
        </div>
      </>
    </div>
  )
}

export default OrderLeftPanel
