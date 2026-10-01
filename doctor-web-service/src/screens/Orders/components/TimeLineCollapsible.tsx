import {Collapse} from 'antd'
import ExpandIcon from 'components/atom/SVG/ExpandIcon'
import {orderDetailsPanelStyles} from '../constants'
import TimeLineContent from './TimeLineContent'

const TimeLineCollapsible = () => {
  return (
    <div className='p-4'>
      <Collapse
        defaultActiveKey={['1']}
        bordered={false}
        style={{
          padding: 0,
          backgroundColor: 'transparent',
        }}
        items={[
          {
            key: '1',
            label: <p className='text-lg font-semibold '>Timeline</p>,
            children: <TimeLineContent />,
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

export default TimeLineCollapsible
