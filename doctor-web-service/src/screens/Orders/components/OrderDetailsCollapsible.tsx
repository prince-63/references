import {Collapse} from 'antd'
import ExpandIcon from 'components/atom/SVG/ExpandIcon'
import {orderDetailsPanelStyles} from '../constants'
import ReviewAndSendStep from '../Steps/ReviewAndSendStep'

const OrderDetailsCollapsible = () => {
  return (
    <div className='p-4'>
      <Collapse
        bordered={false}
        style={{
          padding: 0,
          backgroundColor: 'transparent',
        }}
        items={[
          {
            key: '1',
            label: <p className='text-lg font-semibold '>Order details</p>,
            children: (
              <ReviewAndSendStep
                {...{
                  isViewOrderPage: true,
                }}
              />
            ),
            forceRender: true,
            styles: orderDetailsPanelStyles,
          },
        ]}
        expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
        expandIconPosition='start'
      />
    </div>
  )
}

export default OrderDetailsCollapsible
