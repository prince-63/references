import {useState} from 'react'
import Page from 'components/page/Page'
import {Card, Tabs, Empty, Timeline, Badge, Space} from 'antd'
import {Clock} from 'lucide-react'

export default function VspTracking() {
  const [loading] = useState(false)

  const trackingTabs = [
    {
      key: 'status',
      label: 'Case Status',
      children: (
        <div className='space-y-4'>
          <Card className='shadow-sm'>
            <Space direction='vertical' className='w-full'>
              <div className='flex items-center gap-2'>
                <Badge status='processing' />
                <span className='text-sm text-gray-600'>In Progress</span>
              </div>
              <div className='flex items-center gap-2'>
                <Badge status='default' />
                <span className='text-sm text-gray-600'>Not Started</span>
              </div>
            </Space>
          </Card>
          <Empty description='No status updates' />
        </div>
      ),
    },
    {
      key: 'timeline',
      label: 'Timeline',
      children: (
        <div className='space-y-4'>
          <Timeline items={[]} />
          <Empty description='No timeline events' />
        </div>
      ),
    },
    {
      key: 'milestones',
      label: 'Milestones',
      children: (
        <div className='space-y-4'>
          <Empty description='No milestones set' />
        </div>
      ),
    },
  ]

  return (
    <Page loading={loading}>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2'>
          <Clock className='h-5 w-5 text-blue-500' />
          <h3 className='text-lg font-semibold text-gray-800'>Case Tracking</h3>
        </div>

        <Card className='shadow-sm border-l-4 border-l-blue-500'>
          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              <strong>Estimated Completion:</strong> Monitor case progress and milestones
            </p>
          </div>
        </Card>

        <Card className='shadow-sm'>
          <Tabs items={trackingTabs} />
        </Card>
      </div>
    </Page>
  )
}
